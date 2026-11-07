import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  getProductForAdmin,
  listBadgeOptions,
  listCategoryOptions,
} from "@/lib/server/catalog-admin";

export const metadata: Metadata = {
  title: "تحرير منتج",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, badges] = await Promise.all([
    getProductForAdmin(id),
    listCategoryOptions(),
    listBadgeOptions(),
  ]);

  if (!product) notFound();

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            AURA Admin
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">{product.nameAr}</h1>
          <p dir="ltr" className="mt-2 font-mono text-[11px] text-ink-400">
            /product/{product.slug}
          </p>
        </div>
      </header>

      <ProductForm initial={product} categories={categories} badges={badges} />
    </div>
  );
}
