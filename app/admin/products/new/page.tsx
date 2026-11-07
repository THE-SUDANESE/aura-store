import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { listBadgeOptions, listCategoryOptions } from "@/lib/server/catalog-admin";

export const metadata: Metadata = {
  title: "منتج جديد",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, badges] = await Promise.all([listCategoryOptions(), listBadgeOptions()]);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">منتج جديد</h1>
      </header>

      {categories.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-warning-300 bg-warning-50 px-4 py-3 text-xs text-warning-700">
          أنشئ تصنيفاً واحداً على الأقل من صفحة «التصنيفات» قبل إضافة منتج.
        </p>
      ) : (
        <ProductForm initial={null} categories={categories} badges={badges} />
      )}
    </div>
  );
}
