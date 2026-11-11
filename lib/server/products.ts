import type { Prisma } from "@prisma/client";
import { VAT_RATE } from "@/lib/checkout/pricing";
import { prisma } from "@/lib/db";
import type {
  ProductDetailDto,
  ProductListDto,
  ProductSummaryDto,
  ProductVariantDto,
} from "@/lib/types/product";

/**
 * طبقة قراءة واحدة يستخدمها كل من:
 *  - مسارات /api/products (العقد العام للـ API)
 *  - مكوّنات الخادم RSC في صفحتي المتجر والمنتج
 *
 * لماذا لا تستدعي صفحات RSC مسار الـ API عبر HTTP؟
 * لأن ذلك يضيف قفزة شبكة داخلية، ويجعل البناء أو العرض مرتبطاً بعنوان
 * مطلق (base URL) يعمل على الخادم فقط. مشاركة الدوال نفسها تضمن أن
 * الواجهة والـ API يقرآن البيانات بنفس المنطق تماماً.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const productInclude = {
  category: {
    select: { id: true, slug: true, nameAr: true, nameEn: true },
  },
  images: {
    select: {
      url: true,
      altAr: true,
      isPrimary: true,
      sortOrder: true,
      variantId: true,
    },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  },
  badges: {
    where: { badge: { isActive: true } },
    orderBy: { sortOrder: "asc" },
    select: {
      badge: { select: { slug: true, labelAr: true, style: true, colorHex: true } },
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: [{ stockQuantity: "desc" }, { variantKey: "asc" }],
    select: {
      id: true,
      sku: true,
      variantKey: true,
      colorName: true,
      colorHex: true,
      sizeLabel: true,
      lensColor: true,
      frameWidthMm: true,
      price: true,
      compareAtPrice: true,
      stockQuantity: true,
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const money = (value: { toFixed(digits: number): string } | null): string | null =>
  value === null ? null : value.toFixed(2);

function variantLabel(variant: ProductRow["variants"][number]): string {
  const parts = [variant.colorName, variant.lensColor, variant.sizeLabel].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" / ") : variant.sku;
}

function mapVariant(
  variant: ProductRow["variants"][number],
  basePrice: ProductRow["basePrice"],
): ProductVariantDto {
  // سعر المتغير إن وُجد، وإلا سعر المنتج الأساسي
  const effectivePrice = variant.price ?? basePrice;

  return {
    id: variant.id,
    sku: variant.sku,
    label: variantLabel(variant),
    key: variant.variantKey,
    attributes: {
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      lensColor: variant.lensColor,
      sizeLabel: variant.sizeLabel,
      frameWidthMm: variant.frameWidthMm,
    },
    price: {
      amount: effectivePrice.toFixed(2),
      compareAt: money(variant.compareAtPrice),
    },
    stockQuantity: variant.stockQuantity,
    inStock: variant.stockQuantity > 0,
  };
}

export function toProductSummary(row: ProductRow): ProductSummaryDto {
  const variants = row.variants.map((variant) => mapVariant(variant, row.basePrice));
  const prices = variants.map((variant) => Number(variant.price.amount));
  // السعر المعروض = أرخص متغير *متوفر*؛ وإن نفد الكل فالأرخص كأقل تقدير
  const inStockPrices = variants
    .filter((variant) => variant.inStock)
    .map((variant) => Number(variant.price.amount));
  const pricePool = inStockPrices.length > 0 ? inStockPrices : prices;
  const minPrice = pricePool.length > 0 ? Math.min(...pricePool) : Number(row.basePrice.toFixed(2));

  return {
    id: row.id,
    slug: row.slug,
    name: { ar: row.nameAr, en: row.nameEn },
    type: row.productType,
    category: {
      id: row.category.id,
      slug: row.category.slug,
      name: { ar: row.category.nameAr, en: row.category.nameEn },
    },
    badges: row.badges.map((entry) => ({
      slug: entry.badge.slug,
      label: entry.badge.labelAr,
      style: entry.badge.style,
      colorHex: entry.badge.colorHex,
    })),
    shortDescription: row.shortDescription,
    price: {
      amount: minPrice.toFixed(2),
      compareAt: money(row.compareAtPrice),
      currency: row.currency,
      vatIncluded: true,
      vatRate: VAT_RATE,
    },
    returnWindowDays: row.returnWindowDays,
    inStock: variants.some((variant) => variant.inStock),
    totalStock: variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    images: row.images.map((image) => ({
      url: image.url,
      alt: image.altAr,
      isPrimary: image.isPrimary,
      variantId: image.variantId,
    })),
    variants,
  };
}

function toProductDetail(row: ProductRow): ProductDetailDto {
  return {
    ...toProductSummary(row),
    description: row.description,
    specs: (row.specs ?? {}) as Record<string, unknown>,
  };
}

/** خيارات الترتيب المتاحة في واجهة المتجر — قيمة غير معروفة تُعاد إلى الافتراضي. */
export const PRODUCT_SORTS = ["featured", "newest", "price_asc", "price_desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export function toProductSort(value: string | null | undefined): ProductSort {
  return PRODUCT_SORTS.includes(value as ProductSort) ? (value as ProductSort) : "featured";
}

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  newest: [{ createdAt: "desc" }],
  price_asc: [{ basePrice: "asc" }, { createdAt: "desc" }],
  price_desc: [{ basePrice: "desc" }, { createdAt: "desc" }],
};

export type ListProductsOptions = {
  category?: string | null;
  search?: string | null;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export async function listProducts(options: ListProductsOptions = {}): Promise<ProductListDto> {
  const page = Math.max(1, Math.trunc(options.page ?? 1));
  const pageSize = Math.min(96, Math.max(1, Math.trunc(options.pageSize ?? 24)));

  // حد الطول يمنع استعلامات ضخمة عبر الرابط
  const term = (options.search ?? "").trim().slice(0, 60);

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: "active",
    ...(options.category ? { category: { slug: options.category } } : {}),
    ...(term
      ? {
          OR: [
            { nameAr: { contains: term, mode: "insensitive" } },
            { nameEn: { contains: term, mode: "insensitive" } },
            { shortDescription: { contains: term, mode: "insensitive" } },
            { variants: { some: { sku: { contains: term, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: ORDER_BY[options.sort ?? "featured"],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: rows.map(toProductSummary), total, page, pageSize };
}

/** يقبل slug أو UUID، ويتجاهل المنتجات غير المنشورة أو المحذوفة. */
export async function getProductDetail(key: string): Promise<ProductDetailDto | null> {
  const normalizedKey = key.trim();
  if (!normalizedKey) return null;

  const isUuid = UUID_RE.test(normalizedKey);

  const row = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      status: "active",
      ...(isUuid ? { id: normalizedKey } : { slug: normalizedKey }),
    },
    include: productInclude,
  });

  return row ? toProductDetail(row) : null;
}
