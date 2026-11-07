import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { requireAdmin } from "@/lib/auth/roles";
import { formatNumber, formatSAR } from "@/lib/format";
import { AppError } from "@/lib/http";
import { applyOrderAdjustments, getOrderDetail } from "@/lib/server/orders-admin";

export const metadata: Metadata = {
  title: "تفاصيل الطلب",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

async function saveAdjustments(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin"));

  const orderId = String(formData.get("orderId") ?? "");

  try {
    await applyOrderAdjustments({
      orderId,
      adminNote: formData.get("adminNote"),
      discountTotal: formData.get("discountTotal"),
    });
  } catch (error) {
    redirect(
      `/admin/orders/${orderId}?error=${encodeURIComponent(
        error instanceof AppError ? error.message : "تعذّر حفظ التعديلات.",
      )}`,
    );
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?saved=1`);
}

const inputCls =
  "h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none transition focus:border-ink-900 focus:ring-1 focus:ring-ink-900";

const dateTime = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminOrderPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await getOrderDetail(id);

  if (!order) notFound();

  const address = order.shippingAddress;
  const addressParts = [
    address.addressLine,
    address.district,
    address.city,
    address.postalCode,
  ].filter((part): part is string => typeof part === "string" && part.trim().length > 0);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <Link href="/admin" className="text-[11px] text-ink-500 underline underline-offset-4">
            ← كل الطلبات
          </Link>
          <h1 dir="ltr" className="mt-2 font-mono text-2xl text-ink-900">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-xs text-ink-500">
            {dateTime.format(new Date(order.timeline[0]?.at ?? new Date().toISOString()))} —{" "}
            {ORDER_STATUS_LABELS[order.status]}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <OrderStatusSelect orderId={order.id} orderNumber={order.orderNumber} status={order.status} />
          <p className="text-[11px] text-ink-400">
            الدفع: {order.paymentMethod === "cod" ? "عند الاستلام" : "إلكتروني"} —{" "}
            {order.paymentStatus === "paid" ? "مدفوع" : order.paymentStatus === "refunded" ? "مسترد" : "غير مدفوع"}
          </p>
        </div>
      </header>

      {(query.saved || query.error) && (
        <p
          role={query.error ? "alert" : "status"}
          className={
            query.error
              ? "mt-5 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-xs text-warning-700"
              : "mt-5 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800"
          }
        >
          {query.error ?? "تم حفظ تعديلات الطلب."}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <div className="space-y-6">
          {/* القطع */}
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">قطع الطلب</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-ink-500">
                    <th scope="col" className="py-2 text-start font-medium">المنتج</th>
                    <th scope="col" className="py-2 text-start font-medium">SKU</th>
                    <th scope="col" className="py-2 text-start font-medium">الكمية</th>
                    <th scope="col" className="py-2 text-start font-medium">السعر</th>
                    <th scope="col" className="py-2 text-start font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-ink-100">
                      <td className="py-3">
                        <p className="text-xs font-medium text-ink-900">{item.name}</p>
                        {item.variantLabel && (
                          <p className="mt-0.5 text-[11px] text-ink-500">{item.variantLabel}</p>
                        )}
                      </td>
                      <td dir="ltr" className="py-3 font-mono text-[11px] text-ink-500">{item.sku}</td>
                      <td className="py-3 text-xs">{formatNumber(item.quantity)}</td>
                      <td className="py-3 text-xs">{formatSAR(Number(item.unitPrice))}</td>
                      <td className="py-3 text-xs font-semibold">{formatSAR(Number(item.lineTotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-5 space-y-1.5 border-t border-ink-100 pt-4 text-xs">
              <div className="flex justify-between"><dt className="text-ink-500">المجموع الفرعي</dt><dd>{formatSAR(Number(order.subtotal))}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">الخصم</dt><dd>{formatSAR(Number(order.discountTotal))}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">الشحن</dt><dd>{formatSAR(Number(order.shippingTotal))}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">الضريبة (مستخرجة)</dt><dd>{formatSAR(Number(order.taxTotal))}</dd></div>
              <div className="flex justify-between border-t border-ink-100 pt-2 text-sm font-semibold">
                <dt>الإجمالي</dt>
                <dd>{formatSAR(Number(order.grandTotal))}</dd>
              </div>
            </dl>
          </section>

          {/* ملاحظة وخصم */}
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">ملاحظة داخلية وخصم</h2>
            <p className="mt-1 text-[11px] text-ink-400">
              الخصم يُخفّض الإجمالي ويُحفظ في الطلب — الإجمالي يُعاد حسابه على الخادم.
            </p>

            <form action={saveAdjustments} className="mt-4 space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label htmlFor="adminNote" className="mb-1.5 block text-[11px] font-medium text-ink-700">
                  ملاحظة داخلية (لا يراها العميل)
                </label>
                <textarea
                  id="adminNote"
                  name="adminNote"
                  className={`${inputCls} h-24 py-2`}
                  defaultValue={order.adminNote ?? ""}
                  maxLength={1000}
                  placeholder="مثال: العميل طلب تغليف هدية"
                />
              </div>
              <div className="max-w-[220px]">
                <label htmlFor="discountTotal" className="mb-1.5 block text-[11px] font-medium text-ink-700">
                  الخصم (ر.س)
                </label>
                <input
                  id="discountTotal"
                  name="discountTotal"
                  type="number"
                  min={0}
                  max={Number(order.subtotal)}
                  step="0.01"
                  dir="ltr"
                  className={inputCls}
                  defaultValue={Number(order.discountTotal) || ""}
                />
              </div>
              <Button type="submit">حفظ التعديلات</Button>
            </form>

            {order.customerNote && (
              <div className="mt-6 rounded-2xl bg-sand-50 p-4 text-xs text-ink-700">
                <p className="font-medium text-ink-800">ملاحظة العميل</p>
                <p className="mt-1 leading-6">{order.customerNote}</p>
              </div>
            )}
          </section>

          {/* سجل المخزون */}
          {order.movements.length > 0 && (
            <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
              <h2 className="text-sm font-semibold text-ink-900">حركة المخزون المرتبطة</h2>
              <ul className="mt-3 divide-y divide-ink-100 text-xs">
                {order.movements.map((movement) => (
                  <li key={movement.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-ink-600">{movement.note ?? movement.reason}</span>
                    <span className={movement.delta > 0 ? "text-accent-700" : "text-warning-700"}>
                      {movement.delta > 0 ? "+" : ""}
                      {formatNumber(movement.delta)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* العميل والمسار */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">العميل</h2>
            <p className="mt-3 text-sm text-ink-900">{order.customer.name}</p>
            {order.customer.email && <p dir="ltr" className="mt-1 text-[11px] text-ink-500">{order.customer.email}</p>}
            {order.customer.phone && <p dir="ltr" className="mt-1 text-[11px] text-ink-500">{order.customer.phone}</p>}
            <p className="mt-2 text-[11px] text-ink-400">
              {order.customer.registered ? "حساب مسجّل" : "شراء كزائر"}
            </p>

            <h3 className="mt-5 text-xs font-semibold text-ink-800">عنوان الشحن</h3>
            <p className="mt-2 text-xs leading-6 text-ink-600">
              {addressParts.length > 0 ? addressParts.join("، ") : "لا يوجد عنوان مسجّل."}
            </p>
          </section>

          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">المسار الزمني</h2>
            <ol className="mt-3 space-y-3 text-xs">
              {order.timeline.map((event) => (
                <li key={`${event.label}-${event.at}`} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" />
                  <span>
                    <span className="block text-ink-800">{event.label}</span>
                    <time className="text-[11px] text-ink-400">{dateTime.format(new Date(event.at))}</time>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
