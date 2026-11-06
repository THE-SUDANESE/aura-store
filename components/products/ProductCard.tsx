import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { discountPercent, formatNumber, formatSAR } from "@/lib/format";
import type { ProductSummaryDto } from "@/lib/types/product";

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const primaryImage = product.images[0]?.url ?? null;
  const hoverImage = product.images[1]?.url ?? null;
  const price = Number(product.price.amount);
  const compareAt = product.price.compareAt ? Number(product.price.compareAt) : null;
  const discount = compareAt ? discountPercent(price, compareAt) : 0;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-3xl border border-ink-100 bg-sand-100"
        aria-label={`عرض تفاصيل ${product.name.ar}`}
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.images[0]?.alt ?? `${product.name.ar} — ${product.category.name.ar}`}
            width={800}
            height={1000}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex aspect-[4/5] w-full items-center justify-center text-xs text-ink-400"
            aria-hidden="true"
          >
            لا توجد صورة
          </div>
        )}

        {/* صورة ثانية عند المرور */}
        {hoverImage && primaryImage && (
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            width={800}
            height={1000}
            loading="lazy"
            className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {discount > 0 && (
          <span className="absolute end-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            خصم {formatNumber(discount)}٪
          </span>
        )}

        {!product.inStock && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink-950/80 px-3 py-1.5 text-center text-[11px] text-white backdrop-blur">
            نفد المخزون
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-ink-900">
            <Link
              href={`/product/${product.slug}`}
              className="hover:underline hover:underline-offset-4"
            >
              {product.name.ar}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-ink-500">{product.category.name.ar}</p>
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-ink-900">{formatSAR(price)}</span>
        {compareAt && (
          <span className="text-xs text-ink-400 line-through">{formatSAR(compareAt)}</span>
        )}
      </div>

      <AddToCartButton product={product} />
    </article>
  );
}
