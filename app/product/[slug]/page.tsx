import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/products/ProductGallery";
import { VariantPicker } from "@/components/products/VariantPicker";
import { formatSAR } from "@/lib/format";
import { getProductDetail } from "@/lib/server/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// المخزون والأسعار متغيّرة: لا نُجمّد الصفحة في بناء ثابت
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) return { title: "المنتج غير موجود" };

  return {
    title: product.name.ar,
    description: product.shortDescription ?? undefined,
  };
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-accent-600"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) notFound();

  const isEyewear = product.type === "sunglasses";
  const specEntries = Object.entries(product.specs ?? {}).filter(
    ([, value]) => value !== null && value !== "",
  );

  return (
    <div className="shell py-6 lg:py-10">
      {/* مسار التنقل */}
      <nav aria-label="مسار التنقل" className="text-xs text-ink-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink-900">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-ink-900">
              المتجر
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink-900">
              {product.category.name.ar}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink-800">{product.name.ar}</li>
        </ol>
      </nav>

      {/* المعرض يميناً والتفاصيل يساراً (RTL: العنصر الأول في DOM يظهر يميناً) */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-16">
        <ProductGallery
          images={product.images.map((image) => image.url)}
          alt={`${product.name.ar} — ${product.category.name.ar}`}
        />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-700">
            {product.category.name.ar}
          </p>

          <h1 className="mt-3 font-display text-3xl leading-snug text-ink-900 sm:text-4xl">
            {product.name.ar}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold text-ink-900">
              {formatSAR(Number(product.price.amount))}
            </span>

            {product.price.compareAt && (
              <span className="text-sm text-ink-400 line-through">
                {formatSAR(Number(product.price.compareAt))}
              </span>
            )}

            {!product.inStock && (
              <span className="rounded-full bg-warning-100 px-2.5 py-1 text-xs font-medium text-warning-700">
                نفد المخزون
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-ink-400">السعر شامل ضريبة القيمة المضافة</p>

          <p className="mt-6 text-sm leading-8 text-ink-600">{product.shortDescription}</p>

          {/* اختيار المتغيرات + زر الإضافة للسلة */}
          <div className="mt-8 border-t border-ink-100 pt-7">
            <VariantPicker
              product={product}
              colorLabel={isEyewear ? "لون الإطار" : "اللون"}
              sizeLabel={isEyewear ? "مقاس العدسة" : "المقاس"}
            />
          </div>

          {/* مزايا الشراء */}
          <ul className="mt-8 space-y-3 border-t border-ink-100 pt-7 text-xs text-ink-600">
            <li className="flex gap-2">
              <CheckIcon />
              <span>شحن مجاني للطلبات فوق ٣٠٠ ر.س — التوصيل خلال ٢–٤ أيام عمل.</span>
            </li>
            <li className="flex gap-2">
              <CheckIcon />
              <span>
                إرجاع أو استبدال خلال {product.returnWindowDays} يوماً من الاستلام بشرط سلامة العلبة.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckIcon />
              <span>الدفع عند الاستلام متاح — الدفع الإلكتروني قريباً.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* التفاصيل والمواصفات */}
      <section className="mt-16 grid gap-10 border-t border-ink-100 pt-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">تفاصيل المنتج</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-8 text-ink-600">
            {product.description ?? product.shortDescription}
          </p>
        </div>

        {specEntries.length > 0 && (
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">المواصفات</h2>
            <dl className="mt-4 divide-y divide-ink-100">
              {specEntries.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <dt className="text-ink-500">{label}</dt>
                  <dd className="font-medium text-ink-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
