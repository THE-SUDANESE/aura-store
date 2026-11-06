import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { listProducts } from "@/lib/server/products";

export const metadata: Metadata = {
  title: "AURA - متجر النظارات الشمسية والأزياء",
  description: "اكتشف مجموعة من النظارات الشمسية والأزياء ذات الجودة العالية",
};

// المنتجات تأتي من قاعدة البيانات: slugs حقيقية حتى لا تنتهي بطاقات المنتجات بصفحة 404
export const dynamic = "force-dynamic";

const BEST_SELLERS_COUNT = 6;

export default async function HomePage() {
  const { items } = await listProducts({ page: 1, pageSize: BEST_SELLERS_COUNT });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-desert-50 py-20 lg:py-32">
        <div className="shell max-w-2xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            أهلاً بك في متجر AURA
          </p>
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl lg:text-6xl">
            نظارات بتصميم لا يُنسى
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-ink-600 lg:text-lg">
            نختار لك أفضل النظارات الشمسية بألوان العدسة الأكثر أناقة، مع حماية ١٠٠٪ من الأشعة فوق البنفسجية.
          </p>
          <div className="fade-in">
            <Link
              href="/shop?category=sunglasses"
              className="hover-lift inline-block rounded-full bg-accent-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-accent-500"
            >
              تسوّق العروض
            </Link>
          </div>
        </div>

        <div
          className="absolute -top-1/2 right-0 h-full w-96 rotate-6 bg-desert-100 opacity-50"
          aria-hidden="true"
        />
      </section>

      {/* Best Sellers */}
      <section className="bg-desert-100 py-16 lg:py-24">
        <div className="shell">
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
              الأفضل مبيعاً
            </p>
            <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
              المنتجات الأكثر رواجاً
            </h2>
          </header>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-ink-200 px-6 py-16 text-center">
              <p className="text-sm text-ink-600">لا توجد منتجات منشورة حالياً.</p>
              <p className="mt-2 text-xs text-ink-400">
                أضف منتجات بحالة «نشط» من لوحة التحكم أو نفّذ ملف البيانات التجريبية.
              </p>
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link
              href="/shop"
              className="rounded-full border border-ink-900 px-7 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            >
              عرض كل المنتجات
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
