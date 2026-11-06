"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { captureAnalyticsEvent } from "@/lib/analytics/posthog";
import { useCartStore, selectSubtotal, selectVatPortion, VAT_RATE } from "@/lib/cart/store";
import { formatNumber, formatSAR } from "@/lib/format";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectSubtotal);
  const vatPortion = useCartStore(selectVatPortion);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // إغلاق بـ Escape + منع تمرير الصفحة خلف السلة
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div aria-hidden={!open} className={open ? "pointer-events-auto" : "pointer-events-none"}>
      {/* الخلفية المعتمة */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-ink-950/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* اللوحة: تنزلق من اليسار (نهاية السطر في RTL) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-sand-50 shadow-soft transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">سلة المشتريات</h2>
            <p className="mt-1 text-xs text-ink-500">
              {totalQuantity > 0 ? `${formatNumber(totalQuantity)} قطعة` : "السلة فارغة"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق السلة"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100"
          >
            <CloseIcon />
          </button>
        </header>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-ink-600">سلتك فارغة حالياً.</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="text-sm font-medium text-accent-700 underline underline-offset-4"
              >
                ابدأ التسوّق
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-ink-100 bg-sand-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        width={800}
                        height={1000}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={onClose}
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

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-full border border-ink-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          aria-label={`تقليل كمية ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-xs text-ink-900">
                          {formatNumber(item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          aria-label={`زيادة كمية ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 disabled:opacity-30"
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
          )}
        </div>

        {/* الإجماليات والدفع */}
        {items.length > 0 && (
          <footer className="border-t border-ink-100 bg-white px-5 py-5">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">المجموع (شامل الضريبة)</dt>
                <dd className="font-semibold text-ink-900">{formatSAR(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-ink-500">
                <dt>منها ضريبة القيمة المضافة ({formatNumber(Math.round(VAT_RATE * 100))}٪)</dt>
                <dd>{formatSAR(vatPortion)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-ink-500">
                <dt>الشحن</dt>
                <dd>يُحسب في صفحة الدفع</dd>
              </div>
            </dl>

            <Button
              size="lg"
              fullWidth
              className="mt-4"
              onClick={() => {
                captureAnalyticsEvent("checkout_started", {
                  item_count: totalQuantity,
                  subtotal,
                  currency: "SAR",
                });
                onClose();
                router.push("/checkout");
              }}
            >
              إتمام الطلب
            </Button>

            <p className="mt-3 text-center text-[11px] text-ink-400">
              الأسعار نهائية وشاملة ضريبة القيمة المضافة ١٥٪
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
