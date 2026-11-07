import type { OrderStatus, Prisma } from "@prisma/client";
import { canTransition, ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/** استعلامات وتعديلات لوحة التحكم — تُستخدم في صفحة /admin وفي مسارات /api/admin. */

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerContact: string;
  total: string;
  currency: string;
  status: OrderStatus;
  placedAt: string;
  itemsCount: number;
};

export type AdminInventoryRow = {
  variantId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
};

function readCustomerName(address: unknown): string | null {
  if (typeof address !== "object" || address === null) return null;
  const record = address as Record<string, unknown>;
  return typeof record.fullName === "string" ? record.fullName : null;
}

/** هاتف الشحن موجود داخل shippingAddress لكل من الزائر والعميل المسجّل. */
function readCustomerPhone(address: unknown): string | null {
  if (typeof address !== "object" || address === null) return null;
  const record = address as Record<string, unknown>;
  return typeof record.phone === "string" ? record.phone : null;
}

export async function listRecentOrders(limit = 20): Promise<AdminOrderRow[]> {
  const orders = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    take: limit,
    include: {
      user: { select: { fullName: true } },
      items: { select: { quantity: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user?.fullName ?? readCustomerName(order.shippingAddress) ?? "زائر",
    // guestPhone يُملأ للزوار فقط؛ للعميل المسجّل نقرأ الهاتف من عنوان الشحن
    customerContact: order.guestPhone ?? readCustomerPhone(order.shippingAddress) ?? "",
    total: order.grandTotal.toFixed(2),
    currency: order.currency,
    status: order.status,
    placedAt: order.placedAt.toISOString(),
    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export async function listInventory(limit = 60): Promise<AdminInventoryRow[]> {
  const variants = await prisma.productVariant.findMany({
    where: { product: { deletedAt: null } },
    orderBy: [{ product: { nameAr: "asc" } }, { variantKey: "asc" }],
    take: limit,
    include: {
      product: { select: { nameAr: true } },
    },
  });

  return variants.map((variant) => ({
    variantId: variant.id,
    productName: variant.product.nameAr,
    variantLabel:
      [variant.colorName, variant.lensColor, variant.sizeLabel].filter(Boolean).join(" / ") ||
      variant.sku,
    sku: variant.sku,
    stockQuantity: variant.stockQuantity,
    lowStockThreshold: variant.lowStockThreshold,
    isActive: variant.isActive,
  }));
}

/**
 * تغيير حالة الطلب.
 *
 * قاعدة المحاسبة: المخزون يُخصم عند إنشاء الطلب، لذلك يجب أن يعود عند
 * الإلغاء أو الإرجاع — وإلا بقيت الكميات محتجزة للأبد واختلف المخزون
 * الفعلي عن المسجّل. الإرجاع/الإلغاء لا يتكرران لأن الحالتين نهائيتان
 * في جدول الانتقالات (ORDER_STATUS_TRANSITIONS).
 */
export async function updateOrderStatus(input: {
  orderId: string;
  nextStatus: OrderStatus;
}): Promise<{ orderNumber: string; status: OrderStatus }> {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { id: true, orderNumber: true, status: true },
  });

  if (!order) {
    throw new AppError("NOT_FOUND", "الطلب غير موجود.", 404);
  }

  if (order.status === input.nextStatus) {
    return { orderNumber: order.orderNumber, status: order.status };
  }

  if (!canTransition(order.status, input.nextStatus)) {
    throw new AppError(
      "INVALID_TRANSITION",
      `لا يمكن نقل الطلب من «${ORDER_STATUS_LABELS[order.status]}» إلى «${ORDER_STATUS_LABELS[input.nextStatus]}».`,
      409,
    );
  }

  const now = new Date();
  const timestamps: Prisma.OrderUpdateInput = {};

  switch (input.nextStatus) {
    case "confirmed":
      timestamps.confirmedAt = now;
      break;
    case "shipped":
      timestamps.shippedAt = now;
      break;
    case "delivered":
      timestamps.deliveredAt = now;
      break;
    case "cancelled":
      timestamps.cancelledAt = now;
      break;
    case "returned":
      timestamps.returnedAt = now;
      break;
    default:
      break;
  }

  const restocks = input.nextStatus === "cancelled" || input.nextStatus === "returned";

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: input.nextStatus, ...timestamps },
      select: { orderNumber: true, status: true },
    });

    if (restocks) {
      const items = await tx.orderItem.findMany({
        where: { orderId: order.id, variantId: { not: null } },
        select: { variantId: true, quantity: true },
      });

      for (const item of items) {
        if (!item.variantId) continue;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            delta: item.quantity,
            reason: input.nextStatus === "returned" ? "return" : "cancel",
            orderId: order.id,
            note:
              input.nextStatus === "returned"
                ? "إرجاع كامل من لوحة التحكم"
                : "إلغاء الطلب من لوحة التحكم",
          },
        });
      }
    }

    return updated;
  });
}

/**
 * تعديل المخزون يدوياً من لوحة التحكم.
 * يُسجَّل الفرق في inventory_movements داخل نفس المعاملة للتدقيق.
 */
export async function updateVariantStock(input: {
  variantId: string;
  stockQuantity: number;
  actorId: string;
}): Promise<{ id: string; stockQuantity: number }> {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: input.variantId },
      select: { id: true, stockQuantity: true },
    });

    if (!variant) {
      throw new AppError("NOT_FOUND", "المتغير غير موجود.", 404);
    }

    const delta = input.stockQuantity - variant.stockQuantity;
    if (delta === 0) {
      return { id: variant.id, stockQuantity: variant.stockQuantity };
    }

    const updated = await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: input.stockQuantity },
      select: { id: true, stockQuantity: true },
    });

    await tx.inventoryMovement.create({
      data: {
        variantId: variant.id,
        delta,
        reason: "manual_adjustment",
        createdBy: input.actorId,
        note: "تعديل يدوي من لوحة التحكم",
      },
    });

    return updated;
  });
}
