import type { Metadata } from "next";
import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { StockEditor } from "@/components/admin/StockEditor";
import { auth } from "@/auth";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { requireAdmin } from "@/lib/auth/roles";
import { formatNumber, formatSAR } from "@/lib/format";
import { listInventory, listRecentOrders } from "@/lib/server/admin";
import { getSalesSummary } from "@/lib/server/reports";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ROLE_LABELS = {
  owner: "مالك",
  store_admin: "مدير متجر",
  catalog_manager: "مشرف محتوى",
  customer: "عميل",
} as const;

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-warning-300 bg-warning-50 text-warning-700",
  confirmed: "border-ink-200 bg-ink-100 text-ink-700",
  shipped: "border-accent-200 bg-accent-50 text-accent-700",
  delivered: "border-ink-900 bg-ink-900 text-white",
  cancelled: "border-ink-200 bg-ink-100 text-ink-400",
  returned: "border-warning-300 bg-warning-50 text-warning-700",
};

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "short",
});

async function getAdminOrNull() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    return await requireAdmin();
  } catch {
    // جلسة صالحة لكن الدور ليس إدارياً (أو الحساب أُوقف)
    return null;
  }
}

function AccessDenied() {
  return (
    <div className="shell py-24 text-center">
      <h1 className="font-display text-2xl text-ink-900">لا تملك صلاحية الوصول</h1>
      <p className="mt-3 text-sm text-ink-500">
        هذه الصفحة مخصّصة لمالك المتجر أو مدير المتجر فقط.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-accent-700 underline underline-offset-4"
      >
        العودة إلى المتجر
      </Link>
    </div>
  );
}

export default async function AdminPage() {
  const admin = await getAdminOrNull();
  if (!admin) return <AccessDenied />;

  const [orders, inventory, summary] = await Promise.all([
    listRecentOrders(20),
    listInventory(60),
    getSalesSummary(),
  ]);

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const lowStockCount = inventory.filter(
    (variant) => variant.isActive && variant.stockQuantity <= variant.lowStockThreshold,
  ).length;

  return (
    <div className="shell py-10 lg:py-14">
      {/* ---------- رأس الصفحة ---------- */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            AURA Admin
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">لوحة التحكم</h1>
          <p className="mt-2 text-xs text-ink-500">
            مرحباً {admin.name} — {ROLE_LABELS[admin.role]}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/api/admin/orders/export"
            className="rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-700 transition-colors hover:border-ink-400"
          >
            تصدير الطلبات CSV
          </a>
          <Link
            href="/shop"
            className="rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-700 transition-colors hover:border-ink-400"
          >
            عرض المتجر
          </Link>
        </div>
      </header>

      {/* ---------- مؤشرات سريعة ---------- */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <p className="text-xs text-ink-500">إيراد آخر ٣٠ يوماً</p>
          <p className="mt-1 text-2xl font-semibold text-ink-900">
            {formatSAR(summary.revenue30d)}
          </p>
          <p className="mt-1 text-[11px] text-ink-400">
            {formatNumber(summary.orders30d)} طلب — متوسط {formatSAR(summary.averageOrder)}
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <p className="text-xs text-ink-500">مبيعات اليوم</p>
          <p className="mt-1 text-2xl font-semibold text-ink-900">
            {formatSAR(summary.revenueToday)}
          </p>
          <p className="mt-1 text-[11px] text-ink-400">
            {formatNumber(summary.ordersToday)} طلب اليوم
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <p className="text-xs text-ink-500">بانتظار التأكيد</p>
          <p className="mt-1 text-2xl font-semibold text-warning-700">
            {formatNumber(summary.pendingOrders)}
          </p>
          <p className="mt-1 text-[11px] text-ink-400">
            {formatNumber(pendingCount)} منها ضمن آخر الطلبات
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <p className="text-xs text-ink-500">متغيرات منخفضة المخزون</p>
          <p className="mt-1 text-2xl font-semibold text-warning-700">
            {formatNumber(Math.max(lowStockCount, summary.lowStockCount))}
          </p>
          <p className="mt-1 text-[11px] text-ink-400">تحت حد التنبيه لكل متغير</p>
        </div>
      </div>

      {/* ---------- الطلبات ---------- */}
      <section aria-labelledby="orders-heading" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="orders-heading" className="text-base font-semibold text-ink-900">
            أحدث الطلبات
          </h2>
          <p className="text-[11px] text-ink-400">
            الانتقالات المسموحة فقط: تأكيد ← شحن ← تسليم (أو إلغاء قبل الشحن).
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-3xl border border-ink-100 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-sand-50 text-[11px] uppercase tracking-wider text-ink-500">
                <th scope="col" className="px-4 py-3 text-start font-medium">رقم الطلب</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">العميل</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">القطع</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">الإجمالي</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-500">
                    لا توجد طلبات بعد.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-ink-100 align-top">
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        dir="ltr"
                        className="font-mono text-xs text-ink-700 underline underline-offset-4 hover:text-ink-900"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-ink-900">{order.customerName}</p>
                      {order.customerContact && (
                        <p dir="ltr" className="mt-1 text-[11px] text-ink-400">
                          {order.customerContact}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-600">
                      {formatNumber(order.itemsCount)}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-ink-900">
                      {formatSAR(Number(order.total))}
                    </td>
                    <td className="px-4 py-4 text-[11px] text-ink-500">
                      {dateFormatter.format(new Date(order.placedAt))}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] ${STATUS_STYLES[order.status]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          className="w-fit text-[11px] text-ink-500 underline underline-offset-4 hover:text-ink-900"
                        >
                          فاتورة
                        </Link>
                        <OrderStatusSelect
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          status={order.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- المخزون ---------- */}
      <section aria-labelledby="inventory-heading" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="inventory-heading" className="text-base font-semibold text-ink-900">
            المخزون السريع
          </h2>
          <p className="text-[11px] text-ink-400">
            كل تعديل يُسجَّل في سجل حركة المخزون باسم حسابك.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-3xl border border-ink-100 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-sand-50 text-[11px] uppercase tracking-wider text-ink-500">
                <th scope="col" className="px-4 py-3 text-start font-medium">المنتج</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">SKU</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">المخزون</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">تعديل</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-ink-500">
                    لا توجد متغيرات منتجات. أضف منتجات أو نفّذ ملف البيانات التجريبية.
                  </td>
                </tr>
              ) : (
                inventory.map((variant) => {
                  const isLow = variant.isActive && variant.stockQuantity <= variant.lowStockThreshold;

                  return (
                    <tr key={variant.variantId} className="border-t border-ink-100 align-top">
                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-ink-900">{variant.productName}</p>
                        <p className="mt-1 text-[11px] text-ink-500">{variant.variantLabel}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span dir="ltr" className="font-mono text-[11px] text-ink-500">
                          {variant.sku}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            isLow
                              ? "rounded-full bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-700"
                              : "text-xs text-ink-700"
                          }
                        >
                          {formatNumber(variant.stockQuantity)}
                        </span>
                        {!variant.isActive && (
                          <span className="ms-2 text-[11px] text-ink-400">(غير نشط)</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StockEditor
                          variantId={variant.variantId}
                          sku={variant.sku}
                          stockQuantity={variant.stockQuantity}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
