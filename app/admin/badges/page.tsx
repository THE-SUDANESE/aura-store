import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AppError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/roles";
import { deleteBadge, listBadgesForAdmin, upsertBadge } from "@/lib/server/taxonomy-admin";

export const metadata: Metadata = {
  title: "الشارات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function saveBadge(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/badges"));

  const id = String(formData.get("id") ?? "") || undefined;
  let error: string | null = null;

  try {
    await upsertBadge({
      ...(id ? { id } : {}),
      labelAr: formData.get("labelAr"),
      labelEn: formData.get("labelEn"),
      slug: formData.get("slug"),
      style: formData.get("style"),
      colorHex: formData.get("colorHex"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive") === "on",
    });
  } catch (caught) {
    error = caught instanceof AppError ? caught.message : "تعذّر حفظ الشارة.";
  }

  revalidatePath("/admin/badges");
  redirect(error ? `/admin/badges?error=${encodeURIComponent(error)}` : "/admin/badges?saved=1");
}

async function removeBadge(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/badges"));

  let error: string | null = null;
  try {
    await deleteBadge(String(formData.get("id") ?? ""));
  } catch (caught) {
    error = caught instanceof AppError ? caught.message : "تعذّر حذف الشارة.";
  }

  revalidatePath("/admin/badges");
  redirect(error ? `/admin/badges?error=${encodeURIComponent(error)}` : "/admin/badges?saved=1");
}

const inputCls =
  "h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none transition focus:border-ink-900 focus:ring-1 focus:ring-ink-900";
const labelCls = "mb-1.5 block text-[11px] font-medium text-ink-700";

const STYLE_LABEL: Record<string, string> = {
  solid: "ممتلئة",
  outline: "محدّدة",
  soft: "هادئة",
};

export default async function AdminBadgesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, badges] = await Promise.all([searchParams, listBadgesForAdmin()]);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">الشارات</h1>
        <p className="mt-2 text-xs text-ink-500">
          شارات تُلصق على المنتجات (جديد، الأكثر مبيعاً، إصدار محدود…).
        </p>
      </header>

      {(saved || error) && (
        <p
          role={error ? "alert" : "status"}
          className={
            error
              ? "mt-5 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-xs text-warning-700"
              : "mt-5 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800"
          }
        >
          {error ?? "تم حفظ التغييرات."}
        </p>
      )}

      <section className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">شارة جديدة</h2>
        <form action={saveBadge} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="new-labelAr" className={labelCls}>النص بالعربية</label>
            <input id="new-labelAr" name="labelAr" className={inputCls} required maxLength={40} />
          </div>
          <div>
            <label htmlFor="new-labelEn" className={labelCls}>النص بالإنجليزية</label>
            <input id="new-labelEn" name="labelEn" dir="ltr" className={inputCls} maxLength={40} />
          </div>
          <div>
            <label htmlFor="new-slug" className={labelCls}>الرابط</label>
            <input
              id="new-slug"
              name="slug"
              dir="ltr"
              className={inputCls}
              placeholder="limited"
              required
              maxLength={60}
            />
          </div>
          <div>
            <label htmlFor="new-style" className={labelCls}>النمط</label>
            <select id="new-style" name="style" className={inputCls} defaultValue="solid">
              <option value="solid">ممتلئة</option>
              <option value="outline">محدّدة</option>
              <option value="soft">هادئة</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-colorHex" className={labelCls}>اللون (اختياري)</label>
            <input
              id="new-colorHex"
              name="colorHex"
              dir="ltr"
              className={inputCls}
              placeholder="#101010"
              maxLength={7}
            />
          </div>
          <div>
            <label htmlFor="new-sortOrder" className={labelCls}>الترتيب</label>
            <input
              id="new-sortOrder"
              name="sortOrder"
              type="number"
              className={inputCls}
              defaultValue={badges.length}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-xs text-ink-700">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-ink-900" />
            متاحة للاستخدام
          </label>
          <div className="flex items-end">
            <Button type="submit">إضافة الشارة</Button>
          </div>
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {badges.length === 0 && (
          <p className="rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500">
            لا توجد شارات بعد.
          </p>
        )}

        {badges.map((badge) => (
          <details key={badge.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span className="rounded-full bg-ink-900 px-3 py-1 text-[11px] text-white">
                  {badge.labelAr}
                </span>
                <span dir="ltr" className="font-mono text-[11px] text-ink-400">
                  {badge.slug}
                </span>
                <span className="text-[11px] text-ink-500">{STYLE_LABEL[badge.style]}</span>
                {!badge.isActive && (
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-600">
                    معطّلة
                  </span>
                )}
              </span>
              <span className="text-[11px] text-ink-400">
                {badge.productsCount} منتج — تعديل ▼
              </span>
            </summary>

            <form action={saveBadge} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input type="hidden" name="id" value={badge.id} />
              <div>
                <label className={labelCls}>النص بالعربية</label>
                <input
                  name="labelAr"
                  className={inputCls}
                  defaultValue={badge.labelAr}
                  required
                  maxLength={40}
                />
              </div>
              <div>
                <label className={labelCls}>النص بالإنجليزية</label>
                <input
                  name="labelEn"
                  dir="ltr"
                  className={inputCls}
                  defaultValue={badge.labelEn ?? ""}
                  maxLength={40}
                />
              </div>
              <div>
                <label className={labelCls}>الرابط</label>
                <input
                  name="slug"
                  dir="ltr"
                  className={inputCls}
                  defaultValue={badge.slug}
                  required
                  maxLength={60}
                />
              </div>
              <div>
                <label className={labelCls}>النمط</label>
                <select name="style" className={inputCls} defaultValue={badge.style}>
                  <option value="solid">ممتلئة</option>
                  <option value="outline">محدّدة</option>
                  <option value="soft">هادئة</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>اللون</label>
                <input
                  name="colorHex"
                  dir="ltr"
                  className={inputCls}
                  defaultValue={badge.colorHex ?? ""}
                  maxLength={7}
                />
              </div>
              <div>
                <label className={labelCls}>الترتيب</label>
                <input
                  name="sortOrder"
                  type="number"
                  className={inputCls}
                  defaultValue={badge.sortOrder}
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-xs text-ink-700">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={badge.isActive}
                  className="h-4 w-4 accent-ink-900"
                />
                متاحة للاستخدام
              </label>
              <div className="flex items-end">
                <Button type="submit" size="sm">حفظ</Button>
              </div>
            </form>

            <form action={removeBadge} className="mt-3">
              <input type="hidden" name="id" value={badge.id} />
              <Button type="submit" variant="outline" size="sm">حذف</Button>
              <span className="ms-3 text-[11px] text-ink-400">
                الحذف يزيل الشارة من كل المنتجات.
              </span>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
