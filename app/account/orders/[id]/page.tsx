import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { prisma } from "@/lib/db";
import { formatSAR } from "@/lib/format";

export const metadata: Metadata = {
  title: "تفاصيل الطلب",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  online: "دفع إلكتروني",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "غير مدفوع",
  paid: "مدفوع",
  refunded: "مُسترد",
  failed: "فشل الدفع",
};

const dateTimeFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?redirect=/account");

  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  // الشرط userId هنا هو الحماية الحقيقية: لا يمكن قراءة طلب شخص آخر بمعرفة رابطه
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) notFound();

  const address = asRecord(order.shippingAddress);

  const steps = [
    { label: "تم استلام الطلب", at: order.placedAt },
    { label: "تم التأكيد", at: order.confirmedAt },
    { label: "تم الشحن", at: order.shippedAt },
    { label: "تم التسليم", at: order.deliveredAt },
  ];

  const isClosed = order.status === "cancelled" || order.status === "returned";

  return (
    <div className="shell py-10 lg:py-14">
      <nav className="text-xs text-ink-500">
        <Link href="/account" className="underline underline-offset-4 hover:text-ink-900">
          حسابي
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">تفاصيل الطلب</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            AURA Order
          </p>
          <h1 className="mt-3 font-display text-2xl text-ink-900 sm:text-3xl" dir="ltr">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-xs text-ink-500">
            تاريخ الطلب: {dateTimeFormatter.format(order.placedAt)}
          </p>
        </div>

        <span className="rounded-full border border-ink-900 px-4 py-1.5 text-xs font-medium text-ink-900">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="space-y-6">
          {/* مسار الطلب */}
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">مسار الطلب</h2>

            {isClosed ? (
              <p className="mt-4 rounded-2xl bg-sand-50 px-4 py-3 text-sm text-ink-700">
                هذا الطلب {order.status === "cancelled" ? "ملغي" : "مرتجع"}
                {order.cancelReason ? ` — ${order.cancelReason}` : "."}
              </p>
            ) : (
              <ol className="mt-5 space-y-4">
                {steps.map((step) => {
                  const done = Boolean(step.at);
                  return (
                    <li key={step.label} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className={
                          done
                            ? "mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ink-900"
                            : "mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-ink-300 bg-white"
                        }
                      />
                      <div>
                        <p className={done ? "text-sm text-ink-900" : "text-sm text-ink-400"}>
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-400">
                          {step.at ? dateTimeFormatter.format(step.at) : "لم يتم بعد"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* المنتجات */}
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">المنتجات</h2>
            <ul className="mt-4 divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm text-ink-900">{item.productNameSnapshot}</p>
                    {item.variantLabelSnapshot ? (
                      <p className="mt-1 text-xs text-ink-500">{item.variantLabelSnapshot}</p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-ink-400" dir="ltr">
                      {item.skuSnapshot} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink-900">
                      {formatSAR(Number(item.lineTotal))}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-400">
                      {formatSAR(Number(item.unitPrice))} للوحدة
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          {/* الإجماليات */}
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">الإجماليات</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">المجموع الفرعي</dt>
                <dd className="text-ink-900">{formatSAR(Number(order.subtotal))}</dd>
              </div>
              {Number(order.discountTotal) > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">
                    الخصم{order.discountCode ? ` (${order.discountCode})` : ""}
                  </dt>
                  <dd className="text-accent-700">-{formatSAR(Number(order.discountTotal))}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">الشحن</dt>
                <dd className="text-ink-900">
                  {Number(order.shippingTotal) === 0 ? "مجاني" : formatSAR(Number(order.shippingTotal))}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">ضريبة القيمة المضافة</dt>
                <dd className="text-ink-900">{formatSAR(Number(order.taxTotal))}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-ink-100 pt-3 text-base">
                <dt className="font-semibold text-ink-900">الإجمالي</dt>
                <dd className="font-semibold text-ink-900">{formatSAR(Number(order.grandTotal))}</dd>
              </div>
            </dl>

            <p className="mt-4 text-[11px] text-ink-500">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod} —{" "}
              {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </p>
          </section>

          {/* عنوان الشحن */}
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">عنوان الشحن</h2>
            <address className="mt-4 space-y-1 text-sm not-italic text-ink-700">
              <p className="text-ink-900">{text(address.fullName)}</p>
              <p>{text(address.addressLine)}</p>
              <p>
                {[text(address.district), text(address.city)].filter(Boolean).join(" — ")}
              </p>
              {text(address.postalCode) ? <p dir="ltr">{text(address.postalCode)}</p> : null}
              {text(address.phone) ? (
                <p className="pt-2 text-xs text-ink-500" dir="ltr">
                  {text(address.phone)}
                </p>
              ) : null}
            </address>

            {order.customerNote ? (
              <p className="mt-4 rounded-2xl bg-sand-50 px-4 py-3 text-xs text-ink-600">
                ملاحظتك: {order.customerNote}
              </p>
            ) : null}
          </section>

          <Link
            href="/shop"
            className="block rounded-full bg-ink-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-ink-800"
          >
            متابعة التسوّق
          </Link>
        </div>
      </div>
    </div>
  );
}
