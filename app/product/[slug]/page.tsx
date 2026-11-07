import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/products/ProductGallery";
import { VariantPicker } from "@/components/products/VariantPicker";
import { formatSAR } from "@/lib/format";
import { getProductDetail } from "@/lib/server/products";
import { getProductReviews } from "@/lib/server/reviews";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// المخزون والأسعار متغيّرة: لا نُجمّد الصفحة في بناء ثابت
export const dynamic = "force-dynamic";

const BADGE_STYLES = {
  solid: "bg-ink-900 text-white",
  outline: "border border-ink-900 text-ink-900",
  soft: "bg-accent-50 text-accent-800",
} as const;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) return { title: "المنتج غير موجود" };

  const image = product.images[0]?.url;

  return {
    title: product.name.ar,
    description: product.shortDescription ?? undefined,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name.ar,
      description: product.shortDescription ?? undefined,
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, alt: product.name.ar }] : undefined,
    },
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

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} من ٥`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={star <= Math.round(value) ? "h-3.5 w-3.5 fill-accent-600" : "h-3.5 w-3.5 fill-ink-200"}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) notFound();

  const reviews = await getProductReviews(product.id);

  const isEyewear = product.type === "sunglasses";
  const specEntries = Object.entries(product.specs ?? {}).filter(
    ([, value]) => value !== null && value !== "",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.ar,
    description: product.description ?? product.shortDescription ?? undefined,
    sku: product.variants[0]?.sku,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: "AURA" },
    offers: {
      "@type": "Offer",
      priceCurrency: product.price.currency,
      price: product.price.amount,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `/product/${product.slug}`,
    },
    ...(reviews.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.average,
            reviewCount: reviews.count,
          },
        }
      : {}),
  };

  return (
    <div className="shell py-6 lg:py-10">
      <script
        type="application/ld+json"
        // بيانات منظّمة ثابتة الشكل مُولّدة على الخادم
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-700">
              {product.category.name.ar}
            </p>
            {product.badges.map((badge) => (
              <span
                key={badge.slug}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${BADGE_STYLES[badge.style]}`}
                style={
                  badge.colorHex && badge.style === "solid"
                    ? { backgroundColor: badge.colorHex }
                    : badge.colorHex
                      ? { color: badge.colorHex, borderColor: badge.colorHex }
                      : undefined
                }
              >
                {badge.label}
              </span>
            ))}
          </div>

          <h1 className="mt-3 font-display text-3xl leading-snug text-ink-900 sm:text-4xl">
            {product.name.ar}
          </h1>

          {reviews.count > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
              <Stars value={reviews.average} />
              <span>
                {reviews.average} — {reviews.count} تقييم
              </span>
            </div>
          )}

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

      {/* التقييمات المعتمدة */}
      <section className="mt-16 border-t border-ink-100 pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink-900">تقييمات العملاء</h2>
          <p className="text-xs text-ink-400">
            تُنشر التقييمات بعد مراجعتها من فريق المتجر.
          </p>
        </div>

        {reviews.count === 0 ? (
          <p className="mt-4 rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500">
            لا توجد تقييمات منشورة لهذا المنتج بعد.
          </p>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
            <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
              <p className="font-display text-4xl text-ink-900">{reviews.average}</p>
              <div className="mt-2">
                <Stars value={reviews.average} />
              </div>
              <p className="mt-2 text-xs text-ink-500">{reviews.count} تقييم منشور</p>

              <ul className="mt-4 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const share = reviews.count === 0 ? 0 : (reviews.distribution[star] / reviews.count) * 100;
                  return (
                    <li key={star} className="flex items-center gap-2 text-[11px] text-ink-500">
                      <span className="w-3 text-end">{star}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <span
                          className="block h-full rounded-full bg-accent-600"
                          style={{ width: `${share}%` }}
                        />
                      </span>
                      <span className="w-5 text-end">{reviews.distribution[star]}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="divide-y divide-ink-100 rounded-3xl border border-ink-100 bg-white px-6 shadow-card">
              {reviews.items.map((review) => (
                <li key={review.id} className="py-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars value={review.rating} />
                    <p className="text-sm font-medium text-ink-900">{review.authorName}</p>
                    {review.isVerifiedPurchase && (
                      <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] text-accent-800">
                        شراء موثّق
                      </span>
                    )}
                    <time
                      dateTime={review.createdAt}
                      className="ms-auto text-[11px] text-ink-400"
                    >
                      {new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
                        year: "numeric",
                        month: "long",
                      }).format(new Date(review.createdAt))}
                    </time>
                  </div>
                  {review.title && (
                    <p className="mt-2 text-sm font-semibold text-ink-800">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="mt-1 text-sm leading-7 text-ink-600">{review.body}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
