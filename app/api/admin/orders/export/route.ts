import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

/** GET /api/admin/orders/export — تصدير آخر ٩٠ يوماً كملف CSV يفتح في Excel. */
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function addressField(address: unknown, key: string): string {
  if (typeof address !== "object" || address === null) return "";
  const value = (address as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { placedAt: { gte: since } },
    orderBy: { placedAt: "desc" },
    take: 5000,
    include: { items: { select: { quantity: true } }, user: { select: { email: true } } },
  });

  const header = [
    "رقم الطلب",
    "التاريخ",
    "الحالة",
    "حالة الدفع",
    "طريقة الدفع",
    "العميل",
    "الجوال",
    "المدينة",
    "الحي",
    "العنوان",
    "عدد القطع",
    "المجموع الفرعي",
    "الخصم",
    "كود الخصم",
    "الشحن",
    "الضريبة",
    "الإجمالي",
    "البريد",
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    order.placedAt.toISOString(),
    order.status,
    order.paymentStatus,
    order.paymentMethod,
    addressField(order.shippingAddress, "fullName"),
    addressField(order.shippingAddress, "phone"),
    addressField(order.shippingAddress, "city"),
    addressField(order.shippingAddress, "district"),
    addressField(order.shippingAddress, "addressLine"),
    order.items.reduce((sum, item) => sum + item.quantity, 0),
    order.subtotal.toFixed(2),
    order.discountTotal.toFixed(2),
    order.discountCode ?? "",
    order.shippingTotal.toFixed(2),
    order.taxTotal.toFixed(2),
    order.grandTotal.toFixed(2),
    order.user?.email ?? addressField(order.shippingAddress, "email"),
  ]);

  // BOM حتى تظهر العربية بشكل صحيح عند فتح الملف في Excel
  const csv =
    "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="aura-orders-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
