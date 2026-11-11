import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/admin/PrintButton";
import { auth } from "@/auth";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { formatNumber, formatSAR } from "@/lib/format";

export const metadata: Metadata = {
  title: "فاتورة الطلب",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  dateStyle: "long",
  timeStyle: "short",
});

function field(address: unknown, key: string): string {
  if (typeof address !== "object" || address === null) return "";
  const value = (address as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    await requireAdmin();
  } catch {
    redirect("/admin");
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const order = await prisma.order.findFirst({
    where: { id },
    include: { items: { orderBy: { createdAt: "asc" } }, user: { select: { fullName: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div className="shell py-10 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin" className="text-xs text-ink-500 underline underline-offset-4">
          العودة إلى لوحة التحكم
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-3xl rounded-3xl border border-ink-100 bg-white p-8 shadow-card print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-6">
          <div>
            <p className="font-display text-2xl text-ink-900">AURA</p>
            <p className="mt-1 text-[11px] text-ink-500">نظارات شمسية وأزياء</p>
          </div>
          <div className="text-end">
            <p className="text-sm font-semibold text-ink-900">فاتورة طلب</p>
            <p className="mt-1 text-xs text-ink-600" dir="ltr">
              {order.orderNumber}
            </p>
            <p className="mt-1 text-[11px] text-ink-500">{dateFormatter.format(order.placedAt)}</p>
          </div>
        </header>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-ink-400">بيانات العميل</h2>
            <p className="mt-2 text-sm text-ink-900">
              {field(order.shippingAddress, "fullName") || order.user?.fullName || "—"}
            </p>
            <p className="mt-1 text-xs text-ink-600" dir="ltr">
              {field(order.shippingAddress, "phone")}
            </p>
            <p className="mt-1 text-xs text-ink-600">
              {order.user?.email ?? field(order.shippingAddress, "email")}
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-ink-400">عنوان الشحن</h2>
            <p className="mt-2 text-xs leading-6 text-ink-700">
              {field(order.shippingAddress, "addressLine")}
              <br />
              {[field(order.shippingAddress, "district"), field(order.shippingAddress, "city")]
                .filter(Boolean)
                .join(" — ")}
              {field(order.shippingAddress, "postalCode")
                ? ` — ${field(order.shippingAddress, "postalCode")}`
                : ""}
            </p>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-ink-100 py-3 text-[11px] text-ink-600">
          <p>
            حالة الطلب: <span className="text-ink-900">{ORDER_STATUS_LABELS[order.status]}</span>
          </p>
          <p>
            طريقة الدفع:{" "}
            <span className="text-ink-900">
              {order.paymentMethod === "cod" ? "عند الاستلام" : "إلكتروني"}
            </span>
          </p>
          <p>
            حالة الدفع:{" "}
            <span className="text-ink-900">
              {order.paymentStatus === "paid" ? "مدفوع" : "غير مدفوع"}
            </span>
          </p>
        </div>

        <table className="mt-6 w-full text-start text-xs">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] text-ink-500">
              <th className="py-2 text-start font-medium">المنتج</th>
              <th className="py-2 text-start font-medium">SKU</th>
              <th className="py-2 text-center font-medium">الكمية</th>
              <th className="py-2 text-end font-medium">سعر الوحدة</th>
              <th className="py-2 text-end font-medium">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-ink-50">
                <td className="py-3 pe-3">
                  <p className="text-ink-900">{item.productNameSnapshot}</p>
                  {item.variantLabelSnapshot ? (
                    <p className="mt-0.5 text-[11px] text-ink-400">{item.variantLabelSnapshot}</p>
                  ) : null}
                </td>
                <td className="py-3 pe-3 text-[11px] text-ink-500" dir="ltr">
                  {item.skuSnapshot}
                </td>
                <td className="py-3 text-center text-ink-700">{formatNumber(item.quantity)}</td>
                <td className="py-3 text-end text-ink-700">{formatSAR(Number(item.unitPrice))}</td>
                <td className="py-3 text-end font-medium text-ink-900">
                  {formatSAR(Number(item.lineTotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ms-auto mt-5 w-full max-w-xs space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">المجموع الفرعي</dt>
            <dd className="text-ink-900">{formatSAR(Number(order.subtotal))}</dd>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">
                الخصم{order.discountCode ? ` (${order.discountCode})` : ""}
              </dt>
              <dd className="text-accent-700">-{formatSAR(Number(order.discountTotal))}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">الشحن</dt>
            <dd className="text-ink-900">
              {Number(order.shippingTotal) === 0 ? "مجاني" : formatSAR(Number(order.shippingTotal))}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">ضريبة القيمة المضافة (مضمّنة)</dt>
            <dd className="text-ink-900">{formatSAR(Number(order.taxTotal))}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-ink-100 pt-2 text-sm font-semibold">
            <dt className="text-ink-900">الإجمالي</dt>
            <dd className="text-ink-900">{formatSAR(Number(order.grandTotal))}</dd>
          </div>
        </dl>

        {order.customerNote ? (
          <p className="mt-6 rounded-xl bg-sand-50 px-4 py-3 text-[11px] text-ink-600">
            ملاحظة العميل: {order.customerNote}
          </p>
        ) : null}

        <footer className="mt-8 border-t border-ink-100 pt-4 text-[10px] text-ink-400">
          الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة. سياسة الاستبدال والإرجاع خلال ١٤ يوماً من
          الاستلام.
        </footer>
      </article>
    </div>
  );
}
