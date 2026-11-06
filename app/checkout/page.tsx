"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { captureAnalyticsEvent } from "@/lib/analytics/posthog";
import { useCartStore } from "@/lib/cart/store";
import { computeTotals, VAT_RATE } from "@/lib/checkout/pricing";
import { formatNumber, formatSAR } from "@/lib/format";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
  note: string;
};

const EMPTY_FORM: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  addressLine: "",
  postalCode: "",
  note: "",
};

const inputClasses =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition " +
  "placeholder:text-ink-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900 aria-[invalid=true]:border-warning-600";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
  className?: string;
  optionalHint?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  maxLength,
  className,
  optionalHint,
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-700">
        {label}
        {optionalHint && <span className="ms-1 font-normal text-ink-400">({optionalHint})</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClasses}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-warning-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);

  // السلة تأتي من localStorage: ننتظر الترطيب قبل عرض الملخص
  const [isHydrated, setIsHydrated] = useState(false);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // مفتاح واحد لكل محاولة شراء: يمنع إنشاء طلبين عند الضغط مرتين
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => setIsHydrated(true), []);

  const setField = (field: keyof FormValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );
  const totals = useMemo(() => computeTotals(subtotal), [subtotal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || items.length === 0) return;

    setFormError(null);

    // تحقق سريع في الواجهة — الخادم يعيد التحقق دائماً
    const clientErrors: Record<string, string> = {};
    if (values.fullName.trim().length < 2) clientErrors.fullName = "الاسم مطلوب.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      clientErrors.email = "أدخل بريداً إلكترونياً صحيحاً.";
    if (!/^\+?\d{9,15}$/.test(values.phone.replace(/[\s-]/g, "")))
      clientErrors.phone = "أدخل رقم جوال صحيحاً.";
    if (values.city.trim().length < 2) clientErrors.city = "المدينة مطلوبة.";
    if (values.addressLine.trim().length < 5) clientErrors.addressLine = "العنوان مطلوب.";

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    idempotencyKeyRef.current ??= crypto.randomUUID();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: values,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          paymentMethod: "cod",
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        if (payload?.error?.fields) setFieldErrors(payload.error.fields);
        setFormError(payload?.error?.message ?? "تعذّر إتمام الطلب. يرجى المحاولة مجدداً.");
        return;
      }

      const orderNumber: string = payload.data.orderNumber;

      // تُقرأ القيم قبل تفريغ السلة
      captureAnalyticsEvent("order_placed", {
        order_number: orderNumber,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        total: totals.total,
        currency: "SAR",
        payment_method: "cod",
      });

      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`);
    } catch {
      setFormError("تعذّر الاتصال بالخادم. تحقق من الشبكة وحاول مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <p className="mt-3 text-sm text-ink-500">أضف قطعة واحدة على الأقل قبل إتمام الطلب.</p>
        <div className="mt-8 flex justify-center">
          <Button onClick={() => router.push("/shop")} size="lg">
            تسوّق الآن
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Checkout
        </p>
        <h1 className="mt-3 font-display text-3xl text-ink-900">إتمام الطلب</h1>
        <p className="mt-3 text-sm text-ink-500">
          خطوة واحدة، والدفع عند الاستلام. لا حاجة لبطاقة الآن.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start"
      >
        {/* ---------- بيانات الشحن ---------- */}
        <section
          aria-labelledby="shipping-heading"
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card"
        >
          <h2 id="shipping-heading" className="text-sm font-semibold text-ink-900">
            بيانات الشحن
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="fullName"
              label="الاسم الكامل"
              value={values.fullName}
              onChange={setField("fullName")}
              error={fieldErrors.fullName}
              autoComplete="name"
              maxLength={100}
            />
            <Field
              id="phone"
              label="رقم الجوال"
              value={values.phone}
              onChange={setField("phone")}
              error={fieldErrors.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="05xxxxxxxx"
              maxLength={15}
            />
            <Field
              id="email"
              label="البريد الإلكتروني"
              value={values.email}
              onChange={setField("email")}
              error={fieldErrors.email}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={120}
              className="sm:col-span-2"
            />
            <Field
              id="city"
              label="المدينة"
              value={values.city}
              onChange={setField("city")}
              error={fieldErrors.city}
              autoComplete="address-level2"
              maxLength={60}
            />
            <Field
              id="district"
              label="الحي"
              optionalHint="اختياري"
              value={values.district}
              onChange={setField("district")}
              error={fieldErrors.district}
              autoComplete="address-level3"
              maxLength={60}
            />
            <Field
              id="addressLine"
              label="العنوان التفصيلي"
              value={values.addressLine}
              onChange={setField("addressLine")}
              error={fieldErrors.addressLine}
              autoComplete="street-address"
              placeholder="الشارع، رقم المبنى، أقرب معلم"
              maxLength={200}
              className="sm:col-span-2"
            />
            <Field
              id="postalCode"
              label="الرمز البريدي"
              optionalHint="اختياري"
              value={values.postalCode}
              onChange={setField("postalCode")}
              error={fieldErrors.postalCode}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
            />
            <Field
              id="note"
              label="ملاحظات على الطلب"
              optionalHint="اختياري"
              value={values.note}
              onChange={setField("note")}
              error={fieldErrors.note}
              placeholder="مثال: الاتصال قبل التسليم"
              maxLength={500}
              className="sm:col-span-2"
            />
          </div>

          {/* ---------- طريقة الدفع ---------- */}
          <div className="mt-6 rounded-2xl border border-ink-100 bg-sand-50 p-4">
            <h3 className="text-xs font-semibold text-ink-800">طريقة الدفع</h3>
            <label className="mt-3 flex cursor-default items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked
                readOnly
                className="mt-1 h-4 w-4 accent-ink-900"
              />
              <span className="text-sm text-ink-900">
                الدفع عند الاستلام (COD)
                <span className="mt-1 block text-xs text-ink-500">
                  تدفع نقداً أو بالشبكة عند وصول الطلب — لا يُخصم أي مبلغ الآن.
                </span>
              </span>
            </label>
            <p className="mt-3 text-[11px] text-ink-400">الدفع الإلكتروني بالبطاقة سيتوفر لاحقاً.</p>
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-warning-300 bg-warning-50 px-3 py-2 text-xs text-warning-700"
            >
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth className="mt-6" isLoading={isSubmitting}>
            تأكيد الطلب — {formatSAR(totals.total)}
          </Button>

          <p className="mt-3 text-center text-[11px] text-ink-400">
            بتأكيدك للطلب أنت توافق على الشروط وسياسة الإرجاع خلال ١٤ يوماً.
          </p>
        </section>

        {/* ---------- ملخص الطلب ---------- */}
        <aside
          aria-labelledby="summary-heading"
          className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card lg:sticky lg:top-24"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="summary-heading" className="text-sm font-semibold text-ink-900">
              ملخص الطلب
            </h2>
            <span className="text-xs text-ink-500">{formatNumber(items.length)} صنف</span>
          </div>

          <ul className="mt-4 divide-y divide-ink-100">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 py-3">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-sand-100">
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-900">{item.name}</p>
                  <p className="mt-1 text-[11px] text-ink-500">{item.variantLabel}</p>
                  <p className="mt-1 text-[11px] text-ink-400">الكمية: {formatNumber(item.quantity)}</p>
                </div>
                <span className="text-xs font-semibold text-ink-900">
                  {formatSAR(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
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

          <p className="mt-3 text-[11px] text-ink-400">
            الأسعار شاملة ضريبة القيمة المضافة. الشحن مجاني للطلبات فوق ٣٠٠ ر.س.
          </p>

          <Link
            href="/shop"
            className="mt-5 block text-center text-xs text-ink-500 underline underline-offset-4 hover:text-ink-900"
          >
            تعديل السلة (العودة للمتجر)
          </Link>
        </aside>
      </form>
    </div>
  );
}
