import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AppError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/roles";
import {
  deleteCategory,
  listCategoriesForAdmin,
  upsertCategory,
} from "@/lib/server/taxonomy-admin";

export const metadata: Metadata = {
  title: "التصنيفات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function saveCategory(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/categories"));

  const id = String(formData.get("id") ?? "") || undefined;
  let error: string | null = null;

  try {
    await upsertCategory({
      ...(id ? { id } : {}),
      nameAr: formData.get("nameAr"),
      nameEn: formData.get("nameEn"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive") === "on",
    });
  } catch (caught) {
    error = caught instanceof AppError ? caught.message : "تعذّر حفظ التصنيف.";
  }

  revalidatePath("/admin/categories");
  redirect(
    error
      ? `/admin/categories?error=${encodeURIComponent(error)}`
      : "/admin/categories?saved=1",
  );
}

async function removeCategory(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/categories"));

  const id = String(formData.get("id") ?? "");
  let error: string | null = null;

  try {
    await deleteCategory(id);
  } catch (caught) {
    error = caught instanceof AppError ? caught.message : "تعذّر حذف التصنيف.";
  }

  revalidatePath("/admin/categories");
  redirect(
    error ? `/admin/categories?error=${encodeURIComponent(error)}` : "/admin/categories?saved=1",
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none transition focus:border-ink-900 focus:ring-1 focus:ring-ink-900";
const labelCls = "mb-1.5 block text-[11px] font-medium text-ink-700";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, categories] = await Promise.all([
    searchParams,
    listCategoriesForAdmin(),
  ]);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">التصنيفات</h1>
        <p className="mt-2 text-xs text-ink-500">
          التصنيفات تبني قوائم المتجر. لا يمكن حذف تصنيف يحوي منتجات.
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
        <h2 className="text-sm font-semibold text-ink-900">تصنيف جديد</h2>
        <form action={saveCategory} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="new-nameAr" className={labelCls}>الاسم بالعربية</label>
            <input id="new-nameAr" name="nameAr" className={inputCls} required maxLength={80} />
          </div>
          <div>
            <label htmlFor="new-nameEn" className={labelCls}>الاسم بالإنجليزية</label>
            <input id="new-nameEn" name="nameEn" dir="ltr" className={inputCls} maxLength={80} />
          </div>
          <div>
            <label htmlFor="new-slug" className={labelCls}>الرابط</label>
            <input
              id="new-slug"
              name="slug"
              dir="ltr"
              className={inputCls}
              placeholder="new-arrivals"
              required
              maxLength={60}
            />
          </div>
          <div>
            <label htmlFor="new-sortOrder" className={labelCls}>الترتيب</label>
            <input
              id="new-sortOrder"
              name="sortOrder"
              type="number"
              className={inputCls}
              defaultValue={categories.length}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-description" className={labelCls}>الوصف</label>
            <input id="new-description" name="description" className={inputCls} maxLength={400} />
          </div>
          <label className="flex items-end gap-2 pb-2 text-xs text-ink-700">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-ink-900" />
            ظاهر في المتجر
          </label>
          <div className="flex items-end">
            <Button type="submit">إضافة التصنيف</Button>
          </div>
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {categories.length === 0 && (
          <p className="rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500">
            لا توجد تصنيفات بعد.
          </p>
        )}

        {categories.map((category) => (
          <details
            key={category.id}
            className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span className="font-medium text-ink-900">{category.nameAr}</span>
                <span dir="ltr" className="font-mono text-[11px] text-ink-400">
                  /{category.slug}
                </span>
                {!category.isActive && (
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-600">
                    مخفي
                  </span>
                )}
              </span>
              <span className="text-[11px] text-ink-400">
                {category.productsCount} منتج — تعديل ▼
              </span>
            </summary>

            <form action={saveCategory} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input type="hidden" name="id" value={category.id} />
              <div>
                <label className={labelCls}>الاسم بالعربية</label>
                <input
                  name="nameAr"
                  className={inputCls}
                  defaultValue={category.nameAr}
                  required
                  maxLength={80}
                />
              </div>
              <div>
                <label className={labelCls}>الاسم بالإنجليزية</label>
                <input
                  name="nameEn"
                  dir="ltr"
                  className={inputCls}
                  defaultValue={category.nameEn ?? ""}
                  maxLength={80}
                />
              </div>
              <div>
                <label className={labelCls}>الرابط</label>
                <input
                  name="slug"
                  dir="ltr"
                  className={inputCls}
                  defaultValue={category.slug}
                  required
                  maxLength={60}
                />
              </div>
              <div>
                <label className={labelCls}>الترتيب</label>
                <input
                  name="sortOrder"
                  type="number"
                  className={inputCls}
                  defaultValue={category.sortOrder}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>الوصف</label>
                <input
                  name="description"
                  className={inputCls}
                  defaultValue={category.description ?? ""}
                  maxLength={400}
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-xs text-ink-700">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={category.isActive}
                  className="h-4 w-4 accent-ink-900"
                />
                ظاهر في المتجر
              </label>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm">حفظ</Button>
              </div>
            </form>

            <form action={removeCategory} className="mt-3">
              <input type="hidden" name="id" value={category.id} />
              <Button type="submit" variant="outline" size="sm">
                حذف نهائي
              </Button>
              {category.productsCount > 0 && (
                <span className="ms-3 text-[11px] text-ink-400">
                  الحذف متاح بعد نقل منتجاته.
                </span>
              )}
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
