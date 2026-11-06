import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "تم تأكيد طلبك",
  description: "شكراً لطلبك من AURA — سنتواصل معك لتأكيد التسليم.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{ order?: string | string[] }>;
};

// نعرض فقط أرقام الطلبات بصيغتنا المعروفة، ولا نستعلم عن أي بيانات شخصية
const ORDER_NUMBER_RE = /^AURA-\d{4}-\d{3,8}$/;

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams;
  const rawOrder = Array.isArray(order) ? order[0] : order;
  const orderNumber = rawOrder && ORDER_NUMBER_RE.test(rawOrder) ? rawOrder : null;

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-xl rounded-4xl border border-ink-100 bg-white p-8 text-center shadow-soft sm:p-10">
        <span
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>

        <h1 className="mt-6 font-display text-3xl text-ink-900">شكراً لك!</h1>
        <p className="mt-3 text-sm leading-7 text-ink-600">
          تم استلام طلبك بنجاح. سيتواصل معك فريق AURA لتأكيد موعد التسليم.
        </p>

        {orderNumber ? (
          <div className="mt-6 rounded-2xl border border-ink-100 bg-sand-50 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-500">رقم الطلب</p>
            <p dir="ltr" className="mt-2 font-mono text-lg font-semibold tracking-wider text-ink-900">
              {orderNumber}
            </p>
            <p className="mt-2 text-[11px] text-ink-400">احتفظ بهذا الرقم للرجوع إليه عند الاستفسار.</p>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-ink-200 px-4 py-4 text-xs text-ink-500">
            لم نتمكن من قراءة رقم الطلب من الرابط. تحقّق من بريدك أو تواصل معنا.
          </p>
        )}

        <ul className="mt-8 space-y-3 text-start text-xs text-ink-600">
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            سنتصل بك خلال ٢٤ ساعة لتأكيد الطلب والعنوان.
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            الدفع عند الاستلام — نقداً أو بالشبكة عند وصول الطلب.
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            يمكنك الإرجاع أو الاستبدال خلال ١٤ يوماً من الاستلام.
          </li>
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-medium text-white transition-colors hover:bg-ink-800"
          >
            متابعة التسوّق
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ink-900 px-6 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
