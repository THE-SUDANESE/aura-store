import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { formatNumber } from "@/lib/format";
import { listProducts, toProductSort, type ProductSort } from "@/lib/server/products";

export const metadata: Metadata = {
  title: "المتجر",
  description: "تسوّق نظارات AURA الشمسية والأزياء — شحن مجاني فوق ٣٠٠ ر.س.",
};

// المخزون متغيّر: نقرأ من قاعدة البيانات في كل طلب
export const dynamic = "force-dynamic";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

const PAGE_SIZE = 24;

const first = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

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

const SORT_OPTIONS: Array<{ label: string; value: ProductSort }> = [
  { label: "المميزة أولاً", value: "featured" },
  { label: "الأحدث", value: "newest" },
  { label: "الأرخص أولاً", value: "price_asc" },
  { label: "الأغلى أولاً", value: "price_desc" },
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
  const params = await searchParams;
  const activeCategory = toCategoryParam(params.category);
  const currentPage = toPageParam(params.page);
  const searchTerm = first(params.q).trim().slice(0, 60);
  const activeSort = toProductSort(first(params.sort));

  // نفس الطبقة التي يستخدمها /api/products — بيانات حقيقية من PostgreSQL
  const { items, total, pageSize } = await listProducts({
    category: activeCategory,
    search: searchTerm,
    sort: activeSort,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /** كل روابط الصفحة تُبنى هنا حتى لا يضيع الفلتر أو البحث عند الترقيم أو الفرز. */
  const buildHref = (overrides: {
    category?: string | null;
    q?: string | null;
    sort?: ProductSort;
    page?: number;
  }): string => {
    const nextCategory = overrides.category === undefined ? activeCategory : overrides.category;
    const nextQuery = overrides.q === undefined ? searchTerm : overrides.q;
    const nextSort = overrides.sort ?? activeSort;
    const targetPage = overrides.page ?? 1;

    const search = new URLSearchParams();
    if (nextCategory) search.set("category", nextCategory);
    if (nextQuery) search.set("q", nextQuery);
    if (nextSort !== "featured") search.set("sort", nextSort);
    if (targetPage > 1) search.set("page", String(targetPage));

    const query = search.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  const heading = searchTerm
    ? `نتائج البحث عن «${searchTerm}»`
    : activeCategory === "sunglasses"
      ? "النظارات الشمسية"
      : activeCategory === "clothing"
        ? "الأزياء"
        : "كل المنتجات";

  return (
    <div className="shell py-10 lg:py-14">
      {/* رأس الصفحة */}
      <header className="border-b border-ink-100 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Store
        </p>
        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">{heading}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-ink-600">
          قطع مختارة بعناية، بعدسات تحجب ١٠٠٪ من الأشعة فوق البنفسجية وأقمشة تتحمل الاستخدام اليومي.
        </p>
      </header>

      {/* البحث */}
      <form action="/shop" method="get" className="mt-6 flex flex-wrap items-center gap-3">
        {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
        {activeSort !== "featured" ? <input type="hidden" name="sort" value={activeSort} /> : null}
        <label htmlFor="shop-search" className="sr-only">
          البحث في المنتجات
        </label>
        <input
          id="shop-search"
          type="search"
          name="q"
          defaultValue={searchTerm}
          placeholder="ابحث باسم المنتج أو بالكود…"
          maxLength={60}
          className="w-full rounded-full border border-ink-200 bg-white px-5 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-ink-900 sm:w-80"
        />
        <button
          type="submit"
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          بحث
        </button>
        {searchTerm ? (
          <Link href={buildHref({ q: null })} className="text-xs text-ink-500 underline underline-offset-4">
            مسح البحث
          </Link>
        ) : null}
      </form>

      {/* الفلاتر */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="تصفية حسب الفئة" className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = filter.value === activeCategory;

            return (
              <Link
                key={filter.label}
                href={buildHref({ category: filter.value })}
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

      {/* الترتيب */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400">ترتيب</span>
        {SORT_OPTIONS.map((option) => {
          const isActive = option.value === activeSort;

          return (
            <Link
              key={option.value}
              href={buildHref({ sort: option.value })}
              aria-current={isActive ? "true" : undefined}
              className={
                isActive
                  ? "rounded-full border border-ink-900 px-3 py-1.5 text-[11px] font-medium text-ink-900"
                  : "rounded-full border border-transparent px-3 py-1.5 text-[11px] text-ink-500 transition-colors hover:border-ink-200 hover:text-ink-900"
              }
            >
              {option.label}
            </Link>
          );
        })}
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
          {searchTerm ? (
            <>
              <p className="text-sm text-ink-600">
                لا توجد منتجات مطابقة لـ «{searchTerm}». جرّب كلمة أقصر أو ابحث بالكود.
              </p>
            
              <Link
                href={buildHref({ q: null })}
                className="mt-4 inline-block text-xs text-accent-700 underline underline-offset-4"
              >
                عرض كل المنتجات
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-600">لا توجد منتجات منشورة في هذه الفئة حالياً.</p>
              <p className="mt-2 text-xs text-ink-400">
                أضف منتجات بحالة «نشط» من لوحة التحكم أو نفّذ ملف البيانات التجريبية.
              </p>
            </>
          )}
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
              href={buildHref({ page: currentPage - 1 })}
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
              href={buildHref({ page: currentPage + 1 })}
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
