"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart/store";
import { computeTotals, VAT_RATE } from "@/lib/checkout/pricing";
import { formatNumber, formatSAR } from "@/lib/format";

/**
 * صفحة السلة الكاملة — نفس مصدر الحالة (Zustand + localStorage)
 * المستخدم في السلة الجانبية وصفحة الدفع.
 */
export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // السلة تُقرأ من localStorage: ننتظر الترطيب قبل عرض المحتوى
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totals = computeTotals(subtotal);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isHydrated) {
    return (
      <div className="shell py-16">
        <p className="text-sm text-ink-400">جارٍ تحميل السلة…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="font-display text-2xl text-ink-900">سلتك فارغة</h1>
        <p className="mt-3 text-sm text-ink-500">لم تُضف أي قطعة بعد — لنبدأ من المتجر.</p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={() => router.push("/shop")}>
            تسوّق الآن
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">AURA Cart</p>
          <h1 className="mt-3 font-display text-3xl text-ink-900">سلة المشتريات</h1>
        </div>
        <p className="text-xs text-ink-500">{formatNumber(itemCount)} قطعة</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
        {/* القطع */}
        <ul className="divide-y divide-ink-100 rounded-3xl border border-ink-100 bg-white px-5 shadow-card">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-5">
              <Link
                href={`/product/${item.slug}`}
                className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-ink-100 bg-sand-100"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    width={800}
                    height={1000}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-medium text-ink-900 hover:underline hover:underline-offset-4"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-500">{item.variantLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`إزالة ${item.name} من السلة`}
                    className="text-xs text-ink-400 underline-offset-4 hover:text-warning-700 hover:underline"
                  >
                    إزالة
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <div className="inline-flex items-center rounded-full border border-ink-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      aria-label={`تقليل كمية ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
                    >
                      −
                    </button>
                    <span className="min-w-7 text-center text-xs text-ink-900">
                      {formatNumber(item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                      aria-label={`زيادة كمية ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-ink-900">
                    {formatSAR(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* الملخص */}
        <aside className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-ink-900">ملخص الطلب</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-600">المجموع الفرعي</dt>
              <dd className="text-ink-900">{formatSAR(totals.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-600">الشحن</dt>
              <dd className={totals.shipping === 0 ? "font-medium text-accent-700" : "text-ink-900"}>
                {totals.shipping === 0 ? "مجاني" : formatSAR(totals.shipping)}
              </dd>
            </div>
            {totals.freeShippingRemainingCents > 0 && (
              <p className="rounded-xl bg-sand-100 px-3 py-2 text-[11px] text-ink-600">
                أضف {formatSAR(totals.freeShippingRemainingCents / 100)} للحصول على شحن مجاني.
              </p>
            )}
            <div className="flex items-center justify-between gap-3 text-xs text-ink-500">
              <dt>منها ضريبة القيمة المضافة ({formatNumber(Math.round(VAT_RATE * 100))}٪)</dt>
              <dd>{formatSAR(totals.vat)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-3 text-base font-semibold">
              <dt className="text-ink-900">الإجمالي</dt>
              <dd className="text-ink-900">{formatSAR(totals.total)}</dd>
            </div>
          </dl>

          <Button size="lg" fullWidth className="mt-5" onClick={() => router.push("/checkout")}>
            إتمام الطلب
          </Button>

          <Link
            href="/shop"
            className="mt-4 block text-center text-xs text-ink-500 underline underline-offset-4 hover:text-ink-900"
          >
            متابعة التسوّق
          </Link>
        </aside>
      </div>
    </div>
  );
}
