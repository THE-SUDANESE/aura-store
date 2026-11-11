"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  EMPTY_PRODUCT,
  EMPTY_VARIANT,
  type AdminImageInput,
  type AdminProductInitial,
  type AdminProductInput,
  type AdminVariantInput,
  type BadgeOption,
  type CategoryOption,
} from "@/lib/types/catalog";

const input =
  "h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition " +
  "placeholder:text-ink-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900 aria-[invalid=true]:border-warning-600";

const label = "mb-1.5 block text-xs font-medium text-ink-700";

type Props = {
  initial: AdminProductInitial | null;
  categories: CategoryOption[];
  badges: BadgeOption[];
};

export function ProductForm({ initial, categories, badges }: Props) {
  const router = useRouter();
  const isNew = initial === null;

  const [form, setForm] = useState<AdminProductInput>(
    initial ?? { ...EMPTY_PRODUCT, categoryId: categories[0]?.id ?? "" },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateVariant = (index: number, patch: Partial<AdminVariantInput>) =>
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, ...patch } : variant,
      ),
    }));

  const updateImage = (index: number, patch: Partial<AdminImageInput>) =>
    setForm((current) => ({
      ...current,
      images: current.images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    }));

  /** ترتيب الصور يحدد ترتيب العرض في صفحة المنتج — نعيد ترقيم sortOrder دائماً. */
  const moveImage = (from: number, to: number) =>
    setForm((current) => {
      if (to < 0 || to >= current.images.length) return current;
      const images = [...current.images];
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      return { ...current, images: images.map((image, i) => ({ ...image, sortOrder: i })) };
    });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrors({});
    setMessage(null);

    try {
      const response = await fetch(
        isNew ? "/api/admin/products" : `/api/admin/products/${initial?.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: form }),
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        if (payload?.error?.fields) setErrors(payload.error.fields);
        setMessage({
          type: "error",
          text: payload?.error?.message ?? "تعذّر حفظ المنتج.",
        });
        return;
      }

      setMessage({ type: "ok", text: "تم حفظ المنتج — التغييرات ظاهرة في المتجر." });
      if (isNew) {
        router.replace(`/admin/products/${payload.data.id}`);
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
    if (!window.confirm(`أرشفة «${initial.nameAr}» وإخفاؤها من المتجر؟`)) return;

    try {
      const response = await fetch(`/api/admin/products/${initial.id}`, { method: "DELETE" });
      if (!response.ok) {
        setMessage({ type: "error", text: "تعذّر حذف المنتج." });
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "تعذّر الاتصال بالخادم." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 pb-20">
      {/* البيانات الأساسية */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">البيانات الأساسية</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nameAr" className={label}>الاسم بالعربية</label>
            <input
              id="nameAr"
              className={input}
              value={form.nameAr}
              maxLength={120}
              aria-invalid={Boolean(errors.nameAr) || undefined}
              onChange={(event) => set("nameAr", event.target.value)}
            />
            {errors.nameAr && <p className="mt-1 text-[11px] text-warning-700">{errors.nameAr}</p>}
          </div>

          <div>
            <label htmlFor="nameEn" className={label}>الاسم بالإنجليزية (اختياري)</label>
            <input
              id="nameEn"
              dir="ltr"
              className={input}
              value={form.nameEn}
              maxLength={120}
              onChange={(event) => set("nameEn", event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="slug" className={label}>رابط المنتج</label>
            <input
              id="slug"
              dir="ltr"
              className={input}
              value={form.slug}
              maxLength={80}
              placeholder="aura-aviator-onyx"
              aria-invalid={Boolean(errors.slug) || undefined}
              onChange={(event) => set("slug", event.target.value.toLowerCase())}
            />
            {errors.slug && <p className="mt-1 text-[11px] text-warning-700">{errors.slug}</p>}
            <p className="mt-1 text-[11px] text-ink-400">ينتج /product/&#123;الرابط&#125;</p>
          </div>

          <div>
            <label htmlFor="categoryId" className={label}>التصنيف</label>
            <select
              id="categoryId"
              className={input}
              value={form.categoryId}
              aria-invalid={Boolean(errors.categoryId) || undefined}
              onChange={(event) => set("categoryId", event.target.value)}
            >
              <option value="">— اختر —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameAr}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-[11px] text-warning-700">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label htmlFor="productType" className={label}>نوع المنتج</label>
            <select
              id="productType"
              className={input}
              value={form.productType}
              onChange={(event) =>
                set("productType", event.target.value as AdminProductInput["productType"])
              }
            >
              <option value="sunglasses">نظارات شمسية</option>
              <option value="clothing">أزياء</option>
              <option value="accessory">إكسسوار</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className={label}>حالة النشر</label>
            <select
              id="status"
              className={input}
              value={form.status}
              onChange={(event) => set("status", event.target.value as AdminProductInput["status"])}
            >
              <option value="draft">مسودة (مخفي)</option>
              <option value="active">منشور</option>
              <option value="archived">مؤرشف</option>
            </select>
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-xs text-ink-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ink-900"
                checked={form.isFeatured}
                onChange={(event) => set("isFeatured", event.target.checked)}
              />
              منتج مميّز (يظهر أولاً في الصفحة الرئيسية)
            </label>

            <div className="flex items-center gap-2">
              <label htmlFor="returnWindow" className="text-xs text-ink-700">مدة الإرجاع (يوم)</label>
              <input
                id="returnWindow"
                type="number"
                min={0}
                max={365}
                className="h-9 w-20 rounded-lg border border-ink-200 px-2 text-center text-sm"
                value={form.returnWindowDays}
                onChange={(event) => set("returnWindowDays", Number(event.target.value))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* التسعير */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">التسعير</h2>
        <p className="mt-1 text-[11px] text-ink-400">
          الأسعار شاملة الضريبة. سعر المقارنة يظهر مشطوباً ويُحسب منه نسبة الخصم.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="basePrice" className={label}>السعر الأساسي (ر.س)</label>
            <input
              id="basePrice"
              type="number"
              min={0}
              step="0.01"
              dir="ltr"
              className={input}
              value={form.basePrice}
              aria-invalid={Boolean(errors.basePrice) || undefined}
              onChange={(event) => set("basePrice", event.target.value)}
            />
            {errors.basePrice && (
              <p className="mt-1 text-[11px] text-warning-700">{errors.basePrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="compareAtPrice" className={label}>سعر المقارنة (اختياري)</label>
            <input
              id="compareAtPrice"
              type="number"
              min={0}
              step="0.01"
              dir="ltr"
              className={input}
              value={form.compareAtPrice}
              aria-invalid={Boolean(errors.compareAtPrice) || undefined}
              onChange={(event) => set("compareAtPrice", event.target.value)}
            />
            {errors.compareAtPrice && (
              <p className="mt-1 text-[11px] text-warning-700">{errors.compareAtPrice}</p>
            )}
          </div>
        </div>
      </section>

      {/* الوصف والـ SEO */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">الوصف والبحث</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="shortDescription" className={label}>الوصف المختصر</label>
            <input
              id="shortDescription"
              className={input}
              value={form.shortDescription}
              maxLength={300}
              onChange={(event) => set("shortDescription", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={label}>الوصف الكامل</label>
            <textarea
              id="description"
              className={`${input} h-32 py-2`}
              value={form.description}
              maxLength={4000}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="metaTitle" className={label}>عنوان البحث (SEO)</label>
            <input
              id="metaTitle"
              className={input}
              value={form.metaTitle}
              maxLength={160}
              onChange={(event) => set("metaTitle", event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className={label}>وصف البحث (SEO)</label>
            <input
              id="metaDescription"
              className={input}
              value={form.metaDescription}
              maxLength={300}
              onChange={(event) => set("metaDescription", event.target.value)}
            />
          </div>
        </div>
      </section>

      {/* المواصفات */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-900">المواصفات</h2>
          <span className="text-[11px] text-ink-400">تظهر في جدول أسفل صفحة المنتج</span>
        </div>

        <ul className="mt-4 space-y-2">
          {form.specs.map((spec, index) => (
            <li key={index} className="flex gap-2">
              <input
                aria-label={`اسم المواصفة ${index + 1}`}
                className={input}
                placeholder="المادة"
                value={spec.key}
                maxLength={60}
                onChange={(event) =>
                  set(
                    "specs",
                    form.specs.map((item, i) =>
                      i === index ? { ...item, key: event.target.value } : item,
                    ),
                  )
                }
              />
              <input
                aria-label={`قيمة المواصفة ${index + 1}`}
                className={input}
                placeholder="أسيتات إيطالي"
                value={spec.value}
                maxLength={200}
                onChange={(event) =>
                  set(
                    "specs",
                    form.specs.map((item, i) =>
                      i === index ? { ...item, value: event.target.value } : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="h-10 shrink-0 rounded-lg border border-ink-200 px-3 text-xs text-warning-700"
                onClick={() =>
                  set("specs", form.specs.filter((_, i) => i !== index))
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
          className="mt-3"
          onClick={() => set("specs", [...form.specs, { key: "", value: "" }])}
        >
          + مواصفة
        </Button>
      </section>

      {/* المتغيرات */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-900">المتغيرات والمخزون</h2>
          <span className="text-[11px] text-ink-400">كل متغير له SKU وسعر ومخزون مستقل</span>
        </div>
        {errors.variants && <p className="mt-2 text-[11px] text-warning-700">{errors.variants}</p>}

        <div className="mt-4 space-y-4">
          {form.variants.map((variant, index) => (
            <div key={variant.id ?? index} className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-ink-800">
                  متغير {index + 1}
                  {!variant.isActive && <span className="ms-2 text-ink-400">(معطّل)</span>}
                </p>
                <button
                  type="button"
                  className="text-[11px] text-warning-700 underline underline-offset-4"
                  onClick={() =>
                    set(
                      "variants",
                      form.variants.filter((_, i) => i !== index),
                    )
                  }
                >
                  حذف
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <div>
                  <label className={label}>SKU</label>
                  <input
                    dir="ltr"
                    className={input}
                    value={variant.sku}
                    maxLength={64}
                    aria-invalid={Boolean(errors[`variants.${index}.sku`]) || undefined}
                    onChange={(event) => updateVariant(index, { sku: event.target.value })}
                  />
                  {errors[`variants.${index}.sku`] && (
                    <p className="mt-1 text-[11px] text-warning-700">
                      {errors[`variants.${index}.sku`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className={label}>مفتاح المتغير</label>
                  <input
                    dir="ltr"
                    className={input}
                    value={variant.variantKey}
                    maxLength={60}
                    onChange={(event) => updateVariant(index, { variantKey: event.target.value })}
                  />
                </div>

                <div>
                  <label className={label}>لون الإطار/القطعة</label>
                  <input
                    className={input}
                    value={variant.colorName}
                    maxLength={60}
                    onChange={(event) => updateVariant(index, { colorName: event.target.value })}
                  />
                </div>

                <div>
                  <label className={label}>كود اللون</label>
                  <input
                    dir="ltr"
                    className={input}
                    value={variant.colorHex}
                    maxLength={7}
                    placeholder="#000000"
                    onChange={(event) => updateVariant(index, { colorHex: event.target.value })}
                  />
                </div>

                <div>
                  <label className={label}>لون العدسة</label>
                  <input
                    className={input}
                    value={variant.lensColor}
                    maxLength={60}
                    onChange={(event) => updateVariant(index, { lensColor: event.target.value })}
                  />
                </div>

                <div>
                  <label className={label}>المقاس</label>
                  <input
                    className={input}
                    value={variant.sizeLabel}
                    maxLength={30}
                    onChange={(event) => updateVariant(index, { sizeLabel: event.target.value })}
                  />
                </div>

                <div>
                  <label className={label}>سعر المتغير (فارغ = الأساسي)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    dir="ltr"
                    className={input}
                    value={variant.price}
                    onChange={(event) => updateVariant(index, { price: event.target.value })}
                  />
                </div>

                <div>
                  <label className={label}>سعر المقارنة</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    dir="ltr"
                    className={input}
                    value={variant.compareAtPrice}
                    onChange={(event) =>
                      updateVariant(index, { compareAtPrice: event.target.value })
                    }
                  />
                </div>

                <div>
                  <label className={label}>المخزون</label>
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    className={input}
                    value={variant.stockQuantity}
                    onChange={(event) =>
                      updateVariant(index, { stockQuantity: Number(event.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className={label}>حد التنبيه</label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    className={input}
                    value={variant.lowStockThreshold}
                    onChange={(event) =>
                      updateVariant(index, { lowStockThreshold: Number(event.target.value) })
                    }
                  />
                </div>

                <label className="flex items-end gap-2 pb-2 text-xs text-ink-700 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-ink-900"
                    checked={variant.isActive}
                    onChange={(event) => updateVariant(index, { isActive: event.target.checked })}
                  />
                  متاح للبيع
                </label>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => set("variants", [...form.variants, { ...EMPTY_VARIANT }])}
        >
          + متغير
        </Button>
      </section>

      {/* الصور */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-900">الصور</h2>
          <span className="text-[11px] text-ink-400">حتى ١٢ صورة</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-5 text-ink-400">
          الصق رابط الصورة (يبدأ بـ / أو https://). رفع الملفات مباشرة يحتاج تخزيناً خارجياً
          (Vercel لا يسمح بالكتابة على القرص) — الروابط تعمل الآن بلا أي اعتماد إضافي.
        </p>

        <ul className="mt-4 space-y-2">
          {form.images.map((image, index) => (
            <li key={index} className="flex flex-col gap-2 sm:flex-row">
              <input
                aria-label={`رابط الصورة ${index + 1}`}
                dir="ltr"
                className={input}
                placeholder="/products/aura-aviator-onyx-1.svg"
                value={image.url}
                maxLength={500}
                onChange={(event) => updateImage(index, { url: event.target.value })}
              />
              <input
                aria-label={`نص بديل للصورة ${index + 1}`}
                className={input}
                placeholder="وصف الصورة"
                value={image.altAr}
                maxLength={160}
                onChange={(event) => updateImage(index, { altAr: event.target.value })}
              />
              <label className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-ink-200 px-3 text-[11px] text-ink-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-ink-900"
                  checked={image.isPrimary}
                  onChange={(event) => updateImage(index, { isPrimary: event.target.checked })}
                />
                رئيسية
              </label>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label="تقديم الصورة"
                  disabled={index === 0}
                  className="h-10 w-9 rounded-lg border border-ink-200 text-xs text-ink-600 disabled:opacity-40"
                  onClick={() => moveImage(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="تأخير الصورة"
                  disabled={index === form.images.length - 1}
                  className="h-10 w-9 rounded-lg border border-ink-200 text-xs text-ink-600 disabled:opacity-40"
                  onClick={() => moveImage(index, index + 1)}
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                className="h-10 shrink-0 rounded-lg border border-ink-200 px-3 text-xs text-warning-700"
                onClick={() =>
                  set(
                    "images",
                    form.images.filter((_, i) => i !== index),
                  )
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
          className="mt-3"
          onClick={() =>
            set("images", [
              ...form.images,
              {
                url: "",
                altAr: "",
                sortOrder: form.images.length,
                isPrimary: form.images.length === 0,
              },
            ])
          }
        >
          + صورة
        </Button>
      </section>

      {/* الشارات */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">الشارات</h2>
        {badges.length === 0 ? (
          <p className="mt-2 text-xs text-ink-500">
            لا توجد شارات بعد — أنشئها من صفحة «الشارات».
          </p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-3">
            {badges.map((badge) => {
              const checked = form.badgeIds.includes(badge.id);
              return (
                <li key={badge.id}>
                  <label
                    className={
                      checked
                        ? "flex cursor-pointer items-center gap-2 rounded-full border border-ink-900 bg-ink-900 px-3 py-1.5 text-[11px] text-white"
                        : "flex cursor-pointer items-center gap-2 rounded-full border border-ink-200 px-3 py-1.5 text-[11px] text-ink-700"
                    }
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={(event) =>
                        set(
                          "badgeIds",
                          event.target.checked
                            ? [...form.badgeIds, badge.id]
                            : form.badgeIds.filter((id) => id !== badge.id),
                        )
                      }
                    />
                    {badge.labelAr}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white/95 p-4 shadow-soft backdrop-blur">
        <Button type="submit" size="lg" isLoading={isSaving}>
          {isNew ? "إنشاء المنتج" : "حفظ التغييرات"}
        </Button>

        {!isNew && (
          <Button type="button" variant="outline" size="lg" onClick={handleDelete}>
            أرشفة
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
