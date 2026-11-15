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

/**
 * بصمة النوع من أول بايتات الملف (magic bytes).
 *
 * لا نعتمد على `file.type` القادم من المتصفح: يمكن تسمية أي ملف كصورة
 * بسهولة. نقرأ أول ١٦ بايتاً ونتأكد أن التوقيع يطابق النوع المُعلن، وإلا
 * نرفض الملف بقسوة (ملف تنفيذي أو HTML مُسمّى image/png مثلاً).
 */
function detectImageType(head: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | "image/avif" | null {
  const at = (offset: number, bytes: number[]): boolean =>
    bytes.every((byte, index) => head[offset + index] === byte);

  if (at(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  // "RIFF....WEBP"
  if (at(0, [0x52, 0x49, 0x46, 0x46]) && at(8, [0x57, 0x45, 0x42, 0x50])) return "image/webp";
  // صناديق ISOBMFF: "....ftyp" ويكفي أن يبدأ به الملف لصور AVIF/HEIF
  if (at(4, [0x66, 0x74, 0x79, 0x70])) return "image/avif";

  return null;
}

async function assertRealImage(file: File): Promise<void> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const detected = detectImageType(head);

  if (!detected) {
    throw new AppError(
      "VALIDATION_ERROR",
      "الملف ليس صورة صالحة. المسموح: JPG أو PNG أو WebP أو AVIF.",
      400,
      { file: "محتوى الملف لا يطابق صيغة صورة." },
    );
  }

  const declared = file.type;
  const compatible =
    detected === declared || (detected === "image/avif" && declared === "image/heic");

  if (!compatible) {
    throw new AppError("VALIDATION_ERROR", "نوع الملف لا يطابق محتواه.", 400, {
      file: "نوع الملف لا يطابق محتواه.",
    });
  }
}

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

  await assertRealImage(file);

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
