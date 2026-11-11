import { UTApi } from "uploadthing/server";
import { AppError } from "@/lib/http";

/**
 * رفع صور المنتجات إلى تخزين خارجي (UploadThing).
 *
 * لماذا خارجي؟ Vercel يمنع الكتابة على القرص، والملفات المحلية تختفي مع كل
 * نشر. التخزين الخارجي يعطي رابطاً دائماً عبر CDN — وهو ما يُخزَّن في حقل URL
 * للمنتج، لذلك لا تتغير بقية المنظومة.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function isUploadConfigured(): boolean {
  return Boolean(process.env.UPLOADTHING_TOKEN?.trim());
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!isUploadConfigured()) {
    throw new AppError(
      "INTERNAL_ERROR",
      "رفع الصور غير مفعّل بعد. أضف UPLOADTHING_TOKEN في متغيرات البيئة ثم أعد المحاولة.",
      503,
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new AppError("VALIDATION_ERROR", "الصيغة المدعومة: JPG أو PNG أو WebP أو AVIF.", 400, {
      file: "الصيغة غير مدعومة.",
    });
  }

  if (file.size === 0) {
    throw new AppError("VALIDATION_ERROR", "الملف فارغ.", 400, { file: "الملف فارغ." });
  }

  if (file.size > MAX_BYTES) {
    throw new AppError("VALIDATION_ERROR", "حجم الصورة يجب أن يكون أقل من ٤ ميجابايت.", 400, {
      file: "الحجم أكبر من ٤ ميجابايت.",
    });
  }

  const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
  const result = await utapi.uploadFiles(file);

  if (result.error || !result.data) {
    throw new AppError(
      "INTERNAL_ERROR",
      result.error?.message ?? "تعذّر رفع الصورة إلى التخزين. حاول مجدداً.",
      502,
    );
  }

  return result.data.ufsUrl;
}
