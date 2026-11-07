import type { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/** تفاصيل الطلب وتعديلات ما بعد البيع (ملاحظة داخلية + خصم). */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  discountCode: string | null;
  customerNote: string | null;
  adminNote: string | null;
  customer: { name: string; email: string | null; phone: string | null; registered: boolean };
  shippingAddress: Record<string, unknown>;
  items: Array<{
    id: string;
    name: string;
    variantLabel: string | null;
    sku: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }>;
  timeline: Array<{ label: string; at: string }>;
  movements: Array<{ id: string; delta: number; reason: string; note: string | null; at: string }>;
};

function money(value: { toFixed(digits: number): string } | null): string | null {
  return value === null ? null : value.toFixed(2);
}

export async function getOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  if (!UUID_RE.test(id)) return null;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      items: { orderBy: { createdAt: "asc" } },
      inventoryMovements: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return null;

  const address = (order.shippingAddress ?? {}) as Record<string, unknown>;
  const readString = (key: string): string | null =>
    typeof address[key] === "string" ? (address[key] as string) : null;

  const timeline: Array<{ label: string; at: string }> = [
    { label: "تم إنشاء الطلب", at: order.placedAt.toISOString() },
  ];
  if (order.confirmedAt) timeline.push({ label: "تم التأكيد", at: order.confirmedAt.toISOString() });
  if (order.shippedAt) timeline.push({ label: "تم الشحن", at: order.shippedAt.toISOString() });
  if (order.deliveredAt) timeline.push({ label: "تم التسليم", at: order.deliveredAt.toISOString() });
  if (order.cancelledAt) timeline.push({ label: "تم الإلغاء", at: order.cancelledAt.toISOString() });
  if (order.returnedAt) timeline.push({ label: "تم الإرجاع", at: order.returnedAt.toISOString() });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    currency: order.currency,
    subtotal: money(order.subtotal) as string,
    discountTotal: money(order.discountTotal) as string,
    shippingTotal: money(order.shippingTotal) as string,
    taxTotal: money(order.taxTotal) as string,
    grandTotal: money(order.grandTotal) as string,
    discountCode: order.discountCode,
    customerNote: order.customerNote,
    adminNote: order.adminNote,
    customer: {
      name: order.user?.fullName ?? readString("fullName") ?? "زائر",
      email: order.user?.email ?? order.guestEmail ?? null,
      phone: order.user?.phone ?? order.guestPhone ?? readString("phone") ?? null,
      registered: Boolean(order.userId),
    },
    shippingAddress: address,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.productNameSnapshot,
      variantLabel: item.variantLabelSnapshot,
      sku: item.skuSnapshot,
      unitPrice: item.unitPrice.toFixed(2),
      quantity: item.quantity,
      lineTotal: item.lineTotal.toFixed(2),
    })),
    timeline,
    movements: order.inventoryMovements.map((movement) => ({
      id: movement.id,
      delta: movement.delta,
      reason: movement.reason,
      note: movement.note,
      at: movement.createdAt.toISOString(),
    })),
  };
}

/**
 * تعديل الملاحظة الداخلية والخصم.
 *
 * الإجمالي لا يُرسل من النموذج: يُعاد حسابه على الخادم من المجموع الفرعي
 * والخصم والشحن والضريبة المسجّلة، فلا يستطيع أحد تزوير الإجمالي من المتصفح.
 */
export async function applyOrderAdjustments(input: {
  orderId: string;
  adminNote: unknown;
  discountTotal: unknown;
}): Promise<void> {
  if (!UUID_RE.test(input.orderId)) {
    throw new AppError("INVALID_REQUEST", "معرّف الطلب غير صالح.", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { id: true, subtotal: true, shippingTotal: true, taxTotal: true },
  });

  if (!order) throw new AppError("NOT_FOUND", "الطلب غير موجود.", 404);

  const subtotal = Number(order.subtotal);
  const rawDiscount = input.discountTotal === "" || input.discountTotal == null
    ? 0
    : Number(String(input.discountTotal).trim());

  if (!Number.isFinite(rawDiscount) || rawDiscount < 0) {
    throw new AppError("VALIDATION_ERROR", "الخصم غير صالح.", 400, {
      discountTotal: "أدخل مبلغاً صحيحاً (صفر أو أكثر).",
    });
  }

  if (rawDiscount > subtotal) {
    throw new AppError("VALIDATION_ERROR", "الخصم أكبر من قيمة الطلب.", 400, {
      discountTotal: `الحد الأقصى ${subtotal.toFixed(2)} ر.س.`,
    });
  }

  const discount = Math.round(rawDiscount * 100) / 100;
  const grandTotal = Math.max(
    Math.round(
      (subtotal - discount + Number(order.shippingTotal) + Number(order.taxTotal)) * 100,
    ) / 100,
    0,
  );

  const note = typeof input.adminNote === "string" ? input.adminNote.trim().slice(0, 1000) : "";

  await prisma.order.update({
    where: { id: order.id },
    data: {
      adminNote: note || null,
      discountTotal: discount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    },
  });

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin");
}
