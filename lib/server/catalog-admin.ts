import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";
import type {
  AdminImageInput,
  AdminProductInput,
  AdminProductInitial,
  AdminVariantInput,
  BadgeOption,
  CategoryOption,
} from "@/lib/types/catalog";

/**
 * تحرير الكتالوج من لوحة التحكم.
 * كل كتابة تمر هنا: تحقق مركزي + معاملة واحدة، فلا يبقى منتج بلا متغيرات
 * أو متغيرات بلا منتج عند أي فشل.
 */

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;
const SKU_RE = /^[A-Za-z0-9._-]{2,64}$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;

function str(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function money(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000) return NaN;
  return Math.round(parsed * 100) / 100;
}

function integer(value: unknown, fallback = 0, min = 0, max = 1_000_000): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseVariants(input: unknown, fields: Record<string, string>): AdminVariantInput[] {
  const rows = Array.isArray(input) ? input : [];
  if (rows.length === 0) {
    fields.variants = "أضف متغيراً واحداً على الأقل (SKU وسعر).";
    return [];
  }
  if (rows.length > 50) {
    fields.variants = "لا يمكن تجاوز ٥٠ متغيراً للمنتج.";
    return [];
  }

  const seenSku = new Set<string>();
  const seenKey = new Set<string>();
  const variants: AdminVariantInput[] = [];

  rows.forEach((entry, index) => {
    const row = (entry ?? {}) as Record<string, unknown>;
    const sku = str(row.sku, 64);
    const variantKey = str(row.variantKey, 60) || sku.toLowerCase();
    const price = money(row.price);

    if (!SKU_RE.test(sku)) {
      fields[`variants.${index}.sku`] = "SKU غير صالح (أحرف/أرقام/شرطات، ٢–٦٤).";
    } else if (seenSku.has(sku.toUpperCase())) {
      fields[`variants.${index}.sku`] = "SKU مكرر داخل نفس المنتج.";
    }
    seenSku.add(sku.toUpperCase());

    if (!variantKey) {
      fields[`variants.${index}.variantKey`] = "مفتاح المتغير مطلوب.";
    } else if (seenKey.has(variantKey)) {
      fields[`variants.${index}.variantKey`] = "مفتاح المتغير مكرر داخل نفس المنتج.";
    }
    seenKey.add(variantKey);

    if (price !== null && Number.isNaN(price)) {
      fields[`variants.${index}.price`] = "سعر غير صالح.";
    }

    const compareAt = money(row.compareAtPrice);
    if (compareAt !== null && Number.isNaN(compareAt)) {
      fields[`variants.${index}.compareAtPrice`] = "سعر المقارنة غير صالح.";
    }

    const colorHex = str(row.colorHex, 7);
    if (colorHex && !HEX_RE.test(colorHex)) {
      fields[`variants.${index}.colorHex`] = "اللون يجب أن يكون بصيغة #RRGGBB.";
    }

    variants.push({
      ...(typeof row.id === "string" && row.id ? { id: row.id } : {}),
      sku,
      variantKey,
      colorName: str(row.colorName, 60),
      colorHex,
      sizeLabel: str(row.sizeLabel, 30),
      lensColor: str(row.lensColor, 60),
      price: price === null || Number.isNaN(price) ? "" : price.toFixed(2),
      compareAtPrice:
        compareAt === null || Number.isNaN(compareAt) ? "" : compareAt.toFixed(2),
      stockQuantity: integer(row.stockQuantity, 0, 0, 100_000),
      lowStockThreshold: integer(row.lowStockThreshold, 3, 0, 10_000),
      isActive: row.isActive !== false,
    });
  });

  return variants;
}

function parseImages(input: unknown, fields: Record<string, string>): AdminImageInput[] {
  const rows = Array.isArray(input) ? input : [];
  if (rows.length > 12) fields.images = "الحد الأقصى ١٢ صورة للمنتج.";

  return rows.slice(0, 12).flatMap((entry, index) => {
    const row = (entry ?? {}) as Record<string, unknown>;
    const url = str(row.url, 500);
    if (!url) return [];
    const isAllowed = url.startsWith("/") || /^https?:\/\//i.test(url);
    if (!isAllowed) {
      fields[`images.${index}.url`] = "الرابط يجب أن يبدأ بـ / أو https://";
      return [];
    }
    return [
      {
        url,
        altAr: str(row.altAr, 160),
        sortOrder: integer(row.sortOrder, index, 0, 99),
        isPrimary: row.isPrimary === true,
      },
    ];
  });
}

function parseSpecs(input: unknown): Prisma.InputJsonValue {
  const rows = Array.isArray(input) ? input : [];
  const record: Record<string, string> = {};
  for (const entry of rows) {
    const row = (entry ?? {}) as Record<string, unknown>;
    const key = str(row.key, 60);
    const value = str(row.value, 200);
    if (key && value) record[key] = value;
  }
  return record;
}

export function parseProductInput(input: AdminProductInput): {
  data: {
    nameAr: string;
    nameEn: string | null;
    slug: string;
    categoryId: string;
    productType: AdminProductInput["productType"];
    status: AdminProductInput["status"];
    basePrice: string;
    compareAtPrice: string | null;
    shortDescription: string | null;
    description: string | null;
    isFeatured: boolean;
    returnWindowDays: number;
    metaTitle: string | null;
    metaDescription: string | null;
    specs: Prisma.InputJsonValue;
  };
  variants: AdminVariantInput[];
  images: AdminImageInput[];
  badgeIds: string[];
} {
  const fields: Record<string, string> = {};

  const nameAr = str(input.nameAr, 120);
  if (nameAr.length < 2) fields.nameAr = "الاسم العربي مطلوب (٢ أحرف على الأقل).";

  const slug = str(input.slug, 80).toLowerCase();
  if (!SLUG_RE.test(slug)) fields.slug = "الرابط بأحرف إنجليزية صغيرة وأرقام وشرطات.";

  const categoryId = str(input.categoryId, 40);
  if (!categoryId) fields.categoryId = "اختر التصنيف.";

  const basePrice = money(input.basePrice);
  if (basePrice === null || Number.isNaN(basePrice) || basePrice <= 0) {
    fields.basePrice = "السعر الأساسي مطلوب وأكبر من صفر.";
  }

  const compareAt = money(input.compareAtPrice);
  if (compareAt !== null && Number.isNaN(compareAt)) {
    fields.compareAtPrice = "سعر المقارنة غير صالح.";
  } else if (compareAt !== null && basePrice !== null && compareAt <= basePrice) {
    fields.compareAtPrice = "سعر المقارنة يجب أن يكون أعلى من السعر الأساسي.";
  }

  const variants = parseVariants(input.variants, fields);
  const images = parseImages(input.images, fields);
  const badgeIds = Array.isArray(input.badgeIds)
    ? input.badgeIds.filter((id): id is string => typeof id === "string").slice(0, 6)
    : [];

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "يرجى تصحيح حقول المنتج.", 400, fields);
  }

  const status = ["draft", "active", "archived"].includes(input.status)
    ? input.status
    : "draft";

  return {
    data: {
      nameAr,
      nameEn: str(input.nameEn, 120) || null,
      slug,
      categoryId,
      productType: ["sunglasses", "clothing", "accessory"].includes(input.productType)
        ? input.productType
        : "sunglasses",
      status,
      basePrice: (basePrice as number).toFixed(2),
      compareAtPrice: compareAt === null ? null : compareAt.toFixed(2),
      shortDescription: str(input.shortDescription, 300) || null,
      description: str(input.description, 4000) || null,
      isFeatured: input.isFeatured === true,
      returnWindowDays: integer(input.returnWindowDays, 14, 0, 365),
      metaTitle: str(input.metaTitle, 160) || null,
      metaDescription: str(input.metaDescription, 300) || null,
      specs: parseSpecs(input.specs),
    },
    variants,
    images,
    badgeIds,
  };
}

function uniqueError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new AppError(
      "VALIDATION_ERROR",
      "يوجد تعارض في قيمة فريدة (الرابط أو SKU مستخدم مسبقاً).",
      409,
    );
  }
  throw error;
}

export async function createProduct(input: AdminProductInput) {
  const { data, variants, images, badgeIds } = parseProductInput(input);

  try {
    return await prisma.product.create({
      data: {
        ...data,
        publishedAt: data.status === "active" ? new Date() : null,
        variants: {
          create: variants.map((variant) => ({
            sku: variant.sku,
            variantKey: variant.variantKey,
            colorName: variant.colorName || null,
            colorHex: variant.colorHex || null,
            sizeLabel: variant.sizeLabel || null,
            lensColor: variant.lensColor || null,
            price: variant.price || null,
            compareAtPrice: variant.compareAtPrice || null,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: variant.lowStockThreshold,
            isActive: variant.isActive,
          })),
        },
        images: {
          create: images.map((image) => ({
            url: image.url,
            altAr: image.altAr || null,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
        },
        badges: {
          create: badgeIds.map((badgeId, index) => ({ badgeId, sortOrder: index })),
        },
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    uniqueError(error);
  }
}

export async function updateProduct(id: string, input: AdminProductInput) {
  const { data, variants, images, badgeIds } = parseProductInput(input);

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, publishedAt: true, status: true },
  });
  if (!existing) throw new AppError("NOT_FOUND", "المنتج غير موجود.", 404);

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          publishedAt:
            data.status === "active" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        },
      });

      // المتغيرات: تحديث الموجود، إنشاء الجديد، وتعطيل المحذوف (لا حذف فعلي
      // لأن بنود الطلبات القديمة تشير إليه)
      const keepIds: string[] = [];
      for (const variant of variants) {
        const payload = {
          sku: variant.sku,
          variantKey: variant.variantKey,
          colorName: variant.colorName || null,
          colorHex: variant.colorHex || null,
          sizeLabel: variant.sizeLabel || null,
          lensColor: variant.lensColor || null,
          price: variant.price || null,
          compareAtPrice: variant.compareAtPrice || null,
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: variant.lowStockThreshold,
          isActive: variant.isActive,
        };

        if (variant.id) {
          await tx.productVariant.update({ where: { id: variant.id }, data: payload });
          keepIds.push(variant.id);
        } else {
          const created = await tx.productVariant.create({
            data: { ...payload, productId: id },
            select: { id: true },
          });
          keepIds.push(created.id);
        }
      }

      await tx.productVariant.updateMany({
        where: { productId: id, id: { notIn: keepIds } },
        data: { isActive: false },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image) => ({
            productId: id,
            url: image.url,
            altAr: image.altAr || null,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
        });
      }

      await tx.productBadge.deleteMany({ where: { productId: id } });
      if (badgeIds.length > 0) {
        await tx.productBadge.createMany({
          data: badgeIds.map((badgeId, index) => ({
            productId: id,
            badgeId,
            sortOrder: index,
          })),
        });
      }

      return { id, slug: data.slug };
    });
  } catch (error) {
    uniqueError(error);
  }
}

/** حذف ناعم: يختفي من المتجر ويبقى مرجعاً لبنود الطلبات. */
export async function softDeleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) throw new AppError("NOT_FOUND", "المنتج غير موجود.", 404);

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), status: "archived", isFeatured: false },
  });

  return { id };
}

export type AdminProductRow = {
  id: string;
  nameAr: string;
  slug: string;
  status: string;
  basePrice: string;
  variantsCount: number;
  totalStock: number;
  imageUrl: string | null;
};

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      variants: { select: { stockQuantity: true } },
      images: { select: { url: true, isPrimary: true }, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
    },
  });

  return products.map((product) => ({
    id: product.id,
    nameAr: product.nameAr,
    slug: product.slug,
    status: product.status,
    basePrice: product.basePrice.toFixed(2),
    variantsCount: product.variants.length,
    totalStock: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    imageUrl: product.images[0]?.url ?? null,
  }));
}

export async function getProductForAdmin(id: string): Promise<AdminProductInitial | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { variantKey: "asc" } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      badges: { select: { badgeId: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) return null;

  const specs = (product.specs ?? {}) as Record<string, unknown>;

  return {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn ?? "",
    slug: product.slug,
    categoryId: product.categoryId,
    productType: product.productType,
    status: product.status,
    basePrice: product.basePrice.toFixed(2),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toFixed(2) : "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    isFeatured: product.isFeatured,
    returnWindowDays: product.returnWindowDays,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    specs: Object.entries(specs).map(([key, value]) => ({ key, value: String(value) })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      variantKey: variant.variantKey,
      colorName: variant.colorName ?? "",
      colorHex: variant.colorHex ?? "",
      sizeLabel: variant.sizeLabel ?? "",
      lensColor: variant.lensColor ?? "",
      price: variant.price ? variant.price.toFixed(2) : "",
      compareAtPrice: variant.compareAtPrice ? variant.compareAtPrice.toFixed(2) : "",
      stockQuantity: variant.stockQuantity,
      lowStockThreshold: variant.lowStockThreshold,
      isActive: variant.isActive,
    })),
    images: product.images.map((image) => ({
      url: image.url,
      altAr: image.altAr ?? "",
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    })),
    badgeIds: product.badges.map((badge) => badge.badgeId),
  };
}

export async function listCategoryOptions(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { nameAr: "asc" },
    select: { id: true, nameAr: true, slug: true },
  });
  return categories;
}

export async function listBadgeOptions(): Promise<BadgeOption[]> {
  const badges = await prisma.badge.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { labelAr: "asc" }],
    select: { id: true, labelAr: true, slug: true },
  });
  return badges;
}
