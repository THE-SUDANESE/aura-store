import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";
import { SETTINGS_TAG } from "@/lib/server/settings";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;

function str(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function refreshCatalog() {
  revalidateTag(SETTINGS_TAG);
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export type AdminCategoryRow = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  productsCount: number;
};

export async function listCategoriesForAdmin(): Promise<AdminCategoryRow[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return categories.map((category) => ({
    id: category.id,
    nameAr: category.nameAr,
    nameEn: category.nameEn,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productsCount: category._count.products,
  }));
}

export async function upsertCategory(
  input: {
    id?: string;
    nameAr: unknown;
    nameEn: unknown;
    slug: unknown;
    description: unknown;
    sortOrder: unknown;
    isActive: unknown;
  },
): Promise<void> {
  const nameAr = str(input.nameAr, 80);
  const slug = str(input.slug, 60).toLowerCase();
  const fields: Record<string, string> = {};

  if (nameAr.length < 2) fields.nameAr = "الاسم العربي مطلوب.";
  if (!SLUG_RE.test(slug)) fields.slug = "الرابط بأحرف إنجليزية صغيرة وأرقام وشرطات.";

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "يرجى تصحيح حقول التصنيف.", 400, fields);
  }

  const data = {
    nameAr,
    nameEn: str(input.nameEn, 80) || null,
    slug,
    description: str(input.description, 400) || null,
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Math.trunc(Number(input.sortOrder)) : 0,
    isActive: input.isActive !== false,
  };

  try {
    if (input.id) {
      await prisma.category.update({ where: { id: input.id }, data });
    } else {
      await prisma.category.create({ data });
    }
  } catch {
    throw new AppError("VALIDATION_ERROR", "الرابط مستخدم مسبقاً أو التصنيف غير موجود.", 409, {
      slug: "قيمة مكررة.",
    });
  }

  refreshCatalog();
}

export async function deleteCategory(id: string): Promise<void> {
  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "لا يمكن حذف تصنيف يحتوي منتجات — انقل المنتجات أو أخفِ التصنيف بدلاً من حذفه.",
      409,
    );
  }

  await prisma.category.delete({ where: { id } }).catch(() => {
    throw new AppError("NOT_FOUND", "التصنيف غير موجود.", 404);
  });

  refreshCatalog();
}

/* --------------------------------- الشارات --------------------------------- */

export type AdminBadgeRow = {
  id: string;
  slug: string;
  labelAr: string;
  labelEn: string | null;
  style: "solid" | "outline" | "soft";
  colorHex: string | null;
  sortOrder: number;
  isActive: boolean;
  productsCount: number;
};

export async function listBadgesForAdmin(): Promise<AdminBadgeRow[]> {
  const badges = await prisma.badge.findMany({
    orderBy: [{ sortOrder: "asc" }, { labelAr: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return badges.map((badge) => ({
    id: badge.id,
    slug: badge.slug,
    labelAr: badge.labelAr,
    labelEn: badge.labelEn,
    style: badge.style,
    colorHex: badge.colorHex,
    sortOrder: badge.sortOrder,
    isActive: badge.isActive,
    productsCount: badge._count.products,
  }));
}

export async function upsertBadge(input: {
  id?: string;
  labelAr: unknown;
  labelEn: unknown;
  slug: unknown;
  style: unknown;
  colorHex: unknown;
  sortOrder: unknown;
  isActive: unknown;
}): Promise<void> {
  const labelAr = str(input.labelAr, 40);
  const slug = str(input.slug, 60).toLowerCase();
  const colorHex = str(input.colorHex, 7);
  const fields: Record<string, string> = {};

  if (labelAr.length < 2) fields.labelAr = "نص الشارة مطلوب.";
  if (!SLUG_RE.test(slug)) fields.slug = "الرابط بأحرف إنجليزية صغيرة وأرقام وشرطات.";
  if (colorHex && !HEX_RE.test(colorHex)) fields.colorHex = "اللون بصيغة #RRGGBB.";

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "يرجى تصحيح حقول الشارة.", 400, fields);
  }

  const style = ["solid", "outline", "soft"].includes(String(input.style))
    ? (String(input.style) as "solid" | "outline" | "soft")
    : "solid";

  const data = {
    labelAr,
    labelEn: str(input.labelEn, 40) || null,
    slug,
    style,
    colorHex: colorHex || null,
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Math.trunc(Number(input.sortOrder)) : 0,
    isActive: input.isActive !== false,
  };

  try {
    if (input.id) {
      await prisma.badge.update({ where: { id: input.id }, data });
    } else {
      await prisma.badge.create({ data });
    }
  } catch {
    throw new AppError("VALIDATION_ERROR", "الرابط مستخدم مسبقاً أو الشارة غير موجودة.", 409, {
      slug: "قيمة مكررة.",
    });
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function deleteBadge(id: string): Promise<void> {
  await prisma.badge.delete({ where: { id } }).catch(() => {
    throw new AppError("NOT_FOUND", "الشارة غير موجودة.", 404);
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");
}
