import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { getProductDetail } from "@/lib/server/products";

/**
 * GET /api/products/:slug
 * يقبل slug (مثال: aura-aviator-onyx) أو UUID للمنتج.
 * منطق الاستعلام نفسه المستخدم في صفحة المنتج (lib/server/products.ts).
 */
export const dynamic = "force-dynamic";

const MAX_KEY_LENGTH = 120;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const requestId = randomUUID();

  try {
    const { slug } = await context.params;
    // Next.js يفكّ ترميز المسار مسبقاً، فلا نعيد decode.
    const key = (slug ?? "").trim();

    if (key.length === 0 || key.length > MAX_KEY_LENGTH) {
      throw new AppError("INVALID_REQUEST", "معرّف المنتج غير صالح.", 400);
    }

    const product = await getProductDetail(key);

    if (!product) {
      throw new AppError(
        "PRODUCT_NOT_FOUND",
        "المنتج المطلوب غير موجود أو لم يعد متاحاً.",
        404,
      );
    }

    return ok(product, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
