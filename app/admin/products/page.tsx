import type { Metadata } from "next";
import Link from "next/link";
import { formatNumber, formatSAR } from "@/lib/format";
import { listAdminProducts } from "@/lib/server/catalog-admin";

export const metadata: Metadata = {
  title: "المنتجات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  active: "منشور",
  archived: "مؤرشف",
};

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            AURA Admin
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">المنتجات</h1>
          <p className="mt-2 text-xs text-ink-500">
            إنشاء وتحرير كامل: الأسعار، المتغيرات، الصور، والشارات — بلا كود.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink-900 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-ink-800"
        >
          + منتج جديد
        </Link>
      </header>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-ink-100 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sand-50 text-[11px] uppercase tracking-wider text-ink-500">
              <th scope="col" className="px-4 py-3 text-start font-medium">المنتج</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">السعر</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">المتغيرات</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">المخزون</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الحالة</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">تحرير</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-500">
                  لا توجد منتجات — أنشئ أول منتج.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-ink-100">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-sand-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt=""
                            width={80}
                            height={100}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ink-900">{product.nameAr}</p>
                        <p dir="ltr" className="mt-1 font-mono text-[11px] text-ink-400">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-ink-800">
                    {formatSAR(Number(product.basePrice))}
                  </td>
                  <td className="px-4 py-4 text-xs text-ink-600">
                    {formatNumber(product.variantsCount)}
                  </td>
                  <td className="px-4 py-4 text-xs text-ink-600">
                    {formatNumber(product.totalStock)}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <span
                      className={
                        product.status === "active"
                          ? "rounded-full bg-accent-50 px-2.5 py-0.5 text-accent-700"
                          : "rounded-full bg-ink-100 px-2.5 py-0.5 text-ink-500"
                      }
                    >
                      {STATUS_LABELS[product.status] ?? product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs text-ink-700 underline underline-offset-4 hover:text-ink-900"
                    >
                      تحرير
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
