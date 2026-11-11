import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { uploadProductImage } from "@/lib/server/uploads";
import { enforceRateLimit } from "@/lib/server/rate-limit";

/** POST /api/admin/uploads — رفع صورة منتج من جهاز المشرف (multipart). */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);
    const admin = await requireAdmin();
    await enforceRateLimit({ key: `upload:${admin.id}`, limit: 40, windowSeconds: 600 });

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");

    if (!(file instanceof File)) {
      throw new AppError("INVALID_REQUEST", "لم يصل أي ملف.", 400, { file: "اختر صورة أولاً." });
    }

    const url = await uploadProductImage(file);
    return ok({ url }, requestId, 201);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
