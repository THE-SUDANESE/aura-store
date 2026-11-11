"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_SETTINGS, type NavLink, type SiteSettings } from "@/lib/types/settings";

const inputClasses =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition " +
  "placeholder:text-ink-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900";

const labelClasses = "mb-1.5 block text-xs font-medium text-ink-700";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(initial ?? DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function patch<
    K extends "announcement" | "hero" | "contact" | "shipping" | "footer" | "social",
  >(
    section: K,
    value: Partial<SiteSettings[K]>,
  ) {
    setForm(
      (current) =>
        ({
          ...current,
          [section]: { ...current[section], ...value },
        }) as SiteSettings,
    );
  }

  const updateNav = (index: number, value: Partial<NavLink>) =>
    setForm((current) => ({
      ...current,
      nav: current.nav.map((link, i) => (i === index ? { ...link, ...value } : link)),
    }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setMessage({
          type: "error",
          text: payload?.error?.message ?? "تعذّر حفظ الإعدادات.",
        });
        return;
      }

      setForm(payload.data);
      setMessage({ type: "ok", text: "تم الحفظ — التغييرات ظاهرة الآن في المتجر." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 pb-16">
      {/* الشريط العلوي */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">شريط الإعلان العلوي</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="announcement-text" label="نص الشريط" hint="يظهر في أعلى كل صفحة — اتركه قصيراً.">
            <input
              id="announcement-text"
              className={inputClasses}
              value={form.announcement.text}
              maxLength={200}
              onChange={(event) => patch("announcement", { text: event.target.value })}
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-xs text-ink-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-ink-900"
              checked={form.announcement.enabled}
              onChange={(event) => patch("announcement", { enabled: event.target.checked })}
            />
            إظهار الشريط
          </label>
        </div>
      </section>

      {/* البانر */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">بانر الصفحة الرئيسية</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="hero-eyebrow" label="السطر العلوي الصغير">
            <input
              id="hero-eyebrow"
              className={inputClasses}
              value={form.hero.eyebrow}
              maxLength={80}
              onChange={(event) => patch("hero", { eyebrow: event.target.value })}
            />
          </Field>
          <Field id="hero-title" label="العنوان الرئيسي">
            <input
              id="hero-title"
              className={inputClasses}
              value={form.hero.title}
              maxLength={120}
              onChange={(event) => patch("hero", { title: event.target.value })}
            />
          </Field>
          <Field id="hero-subtitle" label="الوصف" hint="سطر أو سطران تحت العنوان.">
            <textarea
              id="hero-subtitle"
              className={`${inputClasses} h-24 py-2`}
              value={form.hero.subtitle}
              maxLength={300}
              onChange={(event) => patch("hero", { subtitle: event.target.value })}
            />
          </Field>
          <div className="grid gap-4">
            <Field id="hero-cta-label" label="نص زر البانر">
              <input
                id="hero-cta-label"
                className={inputClasses}
                value={form.hero.ctaLabel}
                maxLength={40}
                onChange={(event) => patch("hero", { ctaLabel: event.target.value })}
              />
            </Field>
            <Field id="hero-cta-href" label="رابط الزر" hint="مثال: /shop أو /shop?category=clothing">
              <input
                id="hero-cta-href"
                dir="ltr"
                className={inputClasses}
                value={form.hero.ctaHref}
                maxLength={200}
                onChange={(event) => patch("hero", { ctaHref: event.target.value })}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* التواصل */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">بيانات التواصل</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="contact-whatsapp"
            label="رقم واتساب"
            hint="بصيغة دولية بلا + وبلا مسافات: 966500000000"
          >
            <input
              id="contact-whatsapp"
              dir="ltr"
              className={inputClasses}
              value={form.contact.whatsapp}
              maxLength={20}
              onChange={(event) => patch("contact", { whatsapp: event.target.value })}
            />
          </Field>
          <Field id="contact-phone" label="الرقم المعروض">
            <input
              id="contact-phone"
              className={inputClasses}
              value={form.contact.phoneDisplay}
              maxLength={30}
              onChange={(event) => patch("contact", { phoneDisplay: event.target.value })}
            />
          </Field>
          <Field id="contact-email" label="البريد الإلكتروني">
            <input
              id="contact-email"
              dir="ltr"
              className={inputClasses}
              value={form.contact.email}
              maxLength={120}
              onChange={(event) => patch("contact", { email: event.target.value })}
            />
          </Field>
          <Field id="contact-address" label="العنوان">
            <input
              id="contact-address"
              className={inputClasses}
              value={form.contact.address}
              maxLength={120}
              onChange={(event) => patch("contact", { address: event.target.value })}
            />
          </Field>
        </div>
      </section>

      {/* الشحن والضريبة */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">الشحن والضريبة</h2>
        <p className="mt-1.5 text-[11px] text-ink-400">
          تُستخدم هذه القيم في صفحة السلة والدفع وعلى الخادم عند إنشاء الطلب — لا تُقبل أي قيمة من
          المتصفح.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field id="shipping-flat" label="رسوم الشحن (ر.س)">
            <input
              id="shipping-flat"
              type="number"
              min={0}
              max={1000}
              step="0.01"
              className={inputClasses}
              value={form.shipping.flatSar}
              onChange={(event) => patch("shipping", { flatSar: Number(event.target.value) })}
            />
          </Field>
          <Field id="shipping-threshold" label="حد الشحن المجاني (ر.س)">
            <input
              id="shipping-threshold"
              type="number"
              min={0}
              max={100000}
              step="1"
              className={inputClasses}
              value={form.shipping.freeThresholdSar}
              onChange={(event) =>
                patch("shipping", { freeThresholdSar: Number(event.target.value) })
              }
            />
          </Field>
          <Field id="shipping-vat" label="ضريبة القيمة المضافة (٪)">
            <input
              id="shipping-vat"
              type="number"
              min={0}
              max={50}
              step="0.5"
              className={inputClasses}
              value={form.shipping.vatRatePercent}
              onChange={(event) =>
                patch("shipping", { vatRatePercent: Number(event.target.value) })
              }
            />
          </Field>
        </div>
      </section>

      {/* حسابات التواصل الاجتماعي */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">حسابات التواصل الاجتماعي</h2>
        <p className="mt-1 text-[11px] text-ink-400">
          اترك الحقل فارغاً لإخفاء الحساب من الفوتر. استخدم الرابط الكامل الذي يبدأ بـ https://
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="social-instagram" label="إنستغرام">
            <input
              id="social-instagram"
              dir="ltr"
              className={inputClasses}
              maxLength={300}
              placeholder="https://instagram.com/aura"
              value={form.social.instagram}
              onChange={(event) => patch("social", { instagram: event.target.value })}
            />
          </Field>
          <Field id="social-tiktok" label="تيك توك">
            <input
              id="social-tiktok"
              dir="ltr"
              className={inputClasses}
              maxLength={300}
              placeholder="https://tiktok.com/@aura"
              value={form.social.tiktok}
              onChange={(event) => patch("social", { tiktok: event.target.value })}
            />
          </Field>
          <Field id="social-snapchat" label="سناب شات">
            <input
              id="social-snapchat"
              dir="ltr"
              className={inputClasses}
              maxLength={300}
              placeholder="https://snapchat.com/add/aura"
              value={form.social.snapchat}
              onChange={(event) => patch("social", { snapchat: event.target.value })}
            />
          </Field>
          <Field id="social-x" label="منصة X (تويتر)">
            <input
              id="social-x"
              dir="ltr"
              className={inputClasses}
              maxLength={300}
              placeholder="https://x.com/aura"
              value={form.social.x}
              onChange={(event) => patch("social", { x: event.target.value })}
            />
          </Field>
          <Field id="social-facebook" label="فيسبوك">
            <input
              id="social-facebook"
              dir="ltr"
              className={inputClasses}
              maxLength={300}
              placeholder="https://facebook.com/aura"
              value={form.social.facebook}
              onChange={(event) => patch("social", { facebook: event.target.value })}
            />
          </Field>
          <Field id="social-youtube" label="يوتيوب">
            <input
              id="social-youtube"
              dir="ltr"
              className={inputClasses}
              maxLength={300}
              placeholder="https://youtube.com/@aura"
              value={form.social.youtube}
              onChange={(event) => patch("social", { youtube: event.target.value })}
            />
          </Field>
        </div>
      </section>

      {/* الفوتر */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">الفوتر</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="footer-tagline" label="نبذة البراند">
            <textarea
              id="footer-tagline"
              className={`${inputClasses} h-24 py-2`}
              value={form.footer.tagline}
              maxLength={300}
              onChange={(event) => patch("footer", { tagline: event.target.value })}
            />
          </Field>
          <Field id="footer-payment" label="ملاحظة الدفع في آخر الفوتر">
            <textarea
              id="footer-payment"
              className={`${inputClasses} h-24 py-2`}
              value={form.footer.paymentNote}
              maxLength={200}
              onChange={(event) => patch("footer", { paymentNote: event.target.value })}
            />
          </Field>
        </div>
      </section>

      {/* روابط التنقل */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-900">روابط الهيدر</h2>
          <span className="text-[11px] text-ink-400">حتى ٨ روابط</span>
        </div>

        <ul className="mt-4 space-y-3">
          {form.nav.map((link, index) => (
            <li key={index} className="flex flex-col gap-2 sm:flex-row">
              <input
                aria-label={`اسم الرابط ${index + 1}`}
                className={inputClasses}
                value={link.label}
                maxLength={40}
                placeholder="الاسم"
                onChange={(event) => updateNav(index, { label: event.target.value })}
              />
              <input
                aria-label={`مسار الرابط ${index + 1}`}
                dir="ltr"
                className={inputClasses}
                value={link.href}
                maxLength={200}
                placeholder="/shop"
                onChange={(event) => updateNav(index, { href: event.target.value })}
              />
              <button
                type="button"
                className="h-11 shrink-0 rounded-xl border border-ink-200 px-4 text-xs text-warning-700 transition-colors hover:border-warning-600"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    nav: current.nav.filter((_, i) => i !== index),
                  }))
                }
              >
                حذف
              </button>
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={form.nav.length >= 8}
          onClick={() =>
            setForm((current) => ({
              ...current,
              nav: [...current.nav, { label: "", href: "/shop" }],
            }))
          }
        >
          + إضافة رابط
        </Button>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white/95 p-4 shadow-soft backdrop-blur">
        <Button type="submit" size="lg" isLoading={isSaving}>
          حفظ الإعدادات
        </Button>

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={
              message.type === "error"
                ? "text-xs text-warning-700"
                : "text-xs text-accent-700"
            }
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
