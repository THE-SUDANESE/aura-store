import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { formatNumber } from "@/lib/format";
import { listProducts } from "@/lib/server/products";

export const metadata: Metadata = {
  title: "المتجر",
  description: "تسوّق نظارات AURA الشمسية والأزياء — شحن مجاني فوق ٣٠٠ ر.س.",
};

// المخزون متغيّر: نقرأ من قاعدة البيانات في كل طلب
export const dynamic = "force-dynamic";

type ShopPageProps = {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
};

const PAGE_SIZE = 24;

function toPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

const FILTERS: Array<{ label: string; value: "sunglasses" | "clothing" | null }> = [
  { label: "كل المنتجات", value: null },
  { label: "نظارات شمسية", value: "sunglasses" },
  { label: "أزياء", value: "clothing" },
];

function toCategoryParam(value: string | string[] | undefined): "sunglasses" | "clothing" | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "sunglasses" || raw === "clothing" ? raw : null;
}

/** صيغة العدد الصحيحة عربياً: منتج واحد / منتجان / ٨ منتجات / ١٥ منتجاً. */
function productCountLabel(count: number): string {
  if (count === 1) return "منتج واحد";
  if (count === 2) return "منتجان";
  if (count >= 3 && count <= 10) return `${formatNumber(count)} منتجات`;
  return `${formatNumber(count)} منتجاً`;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, page } = await searchParams;
  const activeCategory = toCategoryParam(category);
  const currentPage = toPageParam(page);

  // نفس الطبقة التي يستخدمها /api/products — بيانات حقيقية من PostgreSQL
  const { items, total, pageSize } = await listProducts({
    category: activeCategory,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // حافظ على فلتر الفئة في روابط الترقيم
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  return (
    <div className="shell py-10 lg:py-14">
      {/* رأس الصفحة */}
      <header className="border-b border-ink-100 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Store
        </p>
        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">
          {activeCategory === "sunglasses"
            ? "النظارات الشمسية"
            : activeCategory === "clothing"
              ? "الأزياء"
              : "كل المنتجات"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-ink-600">
          قطع مختارة بعناية، بعدسات تحجب ١٠٠٪ من الأشعة فوق البنفسجية وأقمشة تتحمل الاستخدام اليومي.
        </p>
      </header>

      {/* الفلاتر */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="تصفية حسب الفئة" className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = filter.value === activeCategory;
            const href = filter.value ? `/shop?category=${filter.value}` : "/shop";

            return (
              <Link
                key={filter.label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white"
                    : "rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-700 transition-colors hover:border-ink-400"
                }
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        <p className="text-xs text-ink-500">{productCountLabel(total)}</p>
      </div>

      {/* شبكة المنتجات: عمود واحد على الجوال، ٢ على التابلت، ٣ على الكمبيوتر */}
      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-3xl border border-dashed border-ink-200 px-6 py-16 text-center">
          <p className="text-sm text-ink-600">لا توجد منتجات منشورة في هذه الفئة حالياً.</p>
          <p className="mt-2 text-xs text-ink-400">
            أضف منتجات بحالة «نشط» من لوحة التحكم أو نفّذ ملف البيانات التجريبية.
          </p>
        </div>
      )}

      {/* ترقيم الصفحات */}
      {totalPages > 1 && (
        <nav
          aria-label="التنقل بين صفحات المنتجات"
          className="mt-14 flex items-center justify-center gap-2"
        >
          {currentPage > 1 && (
            <Link
              href={pageHref(currentPage - 1)}
              className="rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-700 transition-colors hover:border-ink-400"
            >
              السابق
            </Link>
          )}

          <span className="px-2 text-xs text-ink-500">
            صفحة {formatNumber(currentPage)} من {formatNumber(totalPages)}
          </span>

          {currentPage < totalPages && (
            <Link
              href={pageHref(currentPage + 1)}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs text-white transition-opacity hover:opacity-90"
            >
              التالي
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
