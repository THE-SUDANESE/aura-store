"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { PageSection } from "@/lib/types/settings";

const inputClasses =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition " +
  "placeholder:text-ink-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900";

const labelClasses = "mb-1.5 block text-xs font-medium text-ink-700";

type InitialPage = {
  slug: string;
  title: string;
  intro: string;
  sections: PageSection[];
  isActive: boolean;
  sortOrder: number;
};

export function PageEditor({ initial }: { initial: InitialPage | null }) {
  const router = useRouter();
  const isNew = initial === null;

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [intro, setIntro] = useState(initial?.intro ?? "");
  const [sections, setSections] = useState<PageSection[]>(
    initial?.sections.length ? initial.sections : [{ heading: "", body: "" }],
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const updateSection = (index: number, value: Partial<PageSection>) =>
    setSections((current) =>
      current.map((section, i) => (i === index ? { ...section, ...value } : section)),
    );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const targetSlug = (initial?.slug ?? slug).trim().toLowerCase();
    if (!targetSlug) {
      setMessage({ type: "error", text: "أدخل رابط الصفحة (بالإنجليزية، مثل about)." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(targetSlug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, intro, sections, isActive, sortOrder }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setMessage({ type: "error", text: payload?.error?.message ?? "تعذّر حفظ الصفحة." });
        return;
      }

      setMessage({ type: "ok", text: "تم الحفظ — الصفحة محدَّثة في المتجر." });
      if (isNew) {
        router.replace(`/admin/pages/${payload.data.slug}`);
      }
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`حذف صفحة «${initial.title}» نهائياً؟`)) return;

    try {
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(initial.slug)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setMessage({ type: "error", text: "تعذّر حذف الصفحة." });
        return;
      }
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "تعذّر الاتصال بالخادم." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6 pb-16">
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="page-slug" className={labelClasses}>
              رابط الصفحة
            </label>
            <input
              id="page-slug"
              dir="ltr"
              className={inputClasses}
              value={initial?.slug ?? slug}
              disabled={!isNew}
              placeholder="about"
              maxLength={60}
              onChange={(event) => setSlug(event.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-ink-400">
              أحرف إنجليزية صغيرة وأرقام وشرطات فقط — لا يمكن تغييره بعد الإنشاء.
            </p>
          </div>

          <div>
            <label htmlFor="page-title" className={labelClasses}>
              عنوان الصفحة
            </label>
            <input
              id="page-title"
              className={inputClasses}
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="page-intro" className={labelClasses}>
              المقدمة
            </label>
            <textarea
              id="page-intro"
              className={`${inputClasses} h-24 py-2`}
              value={intro}
              maxLength={600}
              onChange={(event) => setIntro(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-ink-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ink-900"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              منشورة
            </label>
            <div className="flex items-center gap-2">
              <label htmlFor="page-order" className="text-xs text-ink-700">
                الترتيب
              </label>
              <input
                id="page-order"
                type="number"
                min={0}
                max={999}
                className="h-9 w-20 rounded-lg border border-ink-200 px-2 text-center text-sm"
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value))}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-900">أقسام الصفحة</h2>
          <span className="text-[11px] text-ink-400">كل قسم = عنوان + نص</span>
        </div>

        <ul className="mt-4 space-y-5">
          {sections.map((section, index) => (
            <li key={index} className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`section-heading-${index}`} className={labelClasses}>
                  عنوان القسم {index + 1}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSections((current) => current.filter((_, i) => i !== index))
                  }
                  className="text-[11px] text-warning-700 underline underline-offset-4"
                >
                  حذف القسم
                </button>
              </div>
              <input
                id={`section-heading-${index}`}
                className={inputClasses}
                value={section.heading}
                maxLength={120}
                onChange={(event) => updateSection(index, { heading: event.target.value })}
              />

              <label htmlFor={`section-body-${index}`} className={`${labelClasses} mt-3`}>
                النص
              </label>
              <textarea
                id={`section-body-${index}`}
                className={`${inputClasses} h-28 py-2`}
                value={section.body}
                maxLength={2000}
                onChange={(event) => updateSection(index, { body: event.target.value })}
              />
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() =>
            setSections((current) => [...current, { heading: "", body: "" }])
          }
        >
          + إضافة قسم
        </Button>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" isLoading={isSaving}>
          حفظ الصفحة
        </Button>

        {!isNew && (
          <Button type="button" variant="outline" size="lg" onClick={handleDelete}>
            حذف الصفحة
          </Button>
        )}

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={message.type === "error" ? "text-xs text-warning-700" : "text-xs text-accent-700"}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
