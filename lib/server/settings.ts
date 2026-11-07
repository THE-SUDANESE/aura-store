import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  type PageSection,
  type SiteSettings,
} from "@/lib/types/settings";

/**
 * قراءة/كتابة إعدادات الموقع وصفحات المعلومات.
 *
 * الكاش مُعلَّم (tag) وليس زمنياً فقط: كل حفظ من لوحة التحكم يستدعي
 * revalidateTag فيرى الزائر التغيير فوراً، وبقية الوقت لا نلمس قاعدة البيانات.
 */

export const SETTINGS_TAG = "site-settings";
export const PAGES_TAG = "site-pages";
const SETTINGS_KEY = "site";

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    return row ? normalizeSettings(row.value) : DEFAULT_SETTINGS;
  },
  ["site-settings-v1"],
  { tags: [SETTINGS_TAG], revalidate: 300 },
);

export async function updateSiteSettings(input: unknown, actorId: string): Promise<SiteSettings> {
  const settings = normalizeSettings(input);

  await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: settings, updatedBy: actorId },
    create: { key: SETTINGS_KEY, value: settings, updatedBy: actorId },
  });

  revalidateTag(SETTINGS_TAG);
  // الصفحات الثابتة تعيد بناء الهيكل الذي يحتوي الهيدر/الفوتر
  revalidatePath("/", "layout");
  return settings;
}

/* ------------------------------- الصفحات ------------------------------- */

export type InfoPageRecord = {
  slug: string;
  title: string;
  intro: string;
  sections: PageSection[];
  isActive: boolean;
  sortOrder: number;
};

function parseSections(value: unknown): PageSection[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const record = entry as Record<string, unknown>;
      const heading = typeof record.heading === "string" ? record.heading.trim() : "";
      const body = typeof record.body === "string" ? record.body.trim() : "";
      if (!heading || !body) return null;
      const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : undefined;
      return { ...(id ? { id } : {}), heading, body };
    })
    .filter((entry): entry is PageSection => entry !== null);
}

function toRecord(page: {
  slug: string;
  title: string;
  intro: string;
  sections: unknown;
  isActive: boolean;
  sortOrder: number;
}): InfoPageRecord {
  return {
    slug: page.slug,
    title: page.title,
    intro: page.intro,
    sections: parseSections(page.sections),
    isActive: page.isActive,
    sortOrder: page.sortOrder,
  };
}

export const listInfoPages = unstable_cache(
  async (): Promise<InfoPageRecord[]> => {
    const pages = await prisma.page.findMany({
      orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    });
    return pages.map(toRecord);
  },
  ["site-pages-v1"],
  { tags: [PAGES_TAG], revalidate: 300 },
);

export const getInfoPage = unstable_cache(
  async (slug: string): Promise<InfoPageRecord | null> => {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page || !page.isActive) return null;
    return toRecord(page);
  },
  ["site-page-v1"],
  { tags: [PAGES_TAG], revalidate: 300 },
);

export async function upsertInfoPage(
  slug: string,
  input: { title: unknown; intro: unknown; sections: unknown; isActive?: unknown; sortOrder?: unknown },
): Promise<InfoPageRecord> {
  const cleanSlug = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{2,60}$/.test(cleanSlug)) {
    throw new AppError("VALIDATION_ERROR", "رابط الصفحة يجب أن يكون أحرفاً إنجليزية وأرقاماً وشرطات.", 400, {
      slug: "صيغة غير صالحة.",
    });
  }

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const intro = typeof input.intro === "string" ? input.intro.trim() : "";
  const sections = parseSections(input.sections);
  const fields: Record<string, string> = {};

  if (title.length < 2 || title.length > 120) fields.title = "العنوان مطلوب (٢–١٢٠ حرفاً).";
  if (intro.length < 2 || intro.length > 600) fields.intro = "المقدمة مطلوبة (٢–٦٠٠ حرف).";
  if (sections.length === 0) fields.sections = "أضف قسماً واحداً على الأقل (عنوان ونص).";

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "يرجى تصحيح حقول الصفحة.", 400, fields);
  }

  const isActive = input.isActive !== false;
  const sortOrder = Number.isFinite(Number(input.sortOrder)) ? Math.trunc(Number(input.sortOrder)) : 0;

  const page = await prisma.page.upsert({
    where: { slug: cleanSlug },
    update: { title, intro, sections, isActive, sortOrder },
    create: { slug: cleanSlug, title, intro, sections, isActive, sortOrder },
  });

  revalidateTag(PAGES_TAG);
  revalidatePath("/", "layout");
  return toRecord(page);
}

export async function deleteInfoPage(slug: string): Promise<void> {
  await prisma.page.delete({ where: { slug } }).catch(() => {
    throw new AppError("NOT_FOUND", "الصفحة غير موجودة.", 404);
  });
  revalidateTag(PAGES_TAG);
  revalidatePath("/", "layout");
}
