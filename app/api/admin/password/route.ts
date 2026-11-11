import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { changeOwnPassword } from "@/lib/server/account";
import { enforceRateLimit } from "@/lib/server/rate-limit";

/**
 * POST /api/admin/password — يغيّر كلمة مرور المشرف الحالي.
 * محمي بأربع طبقات: نفس الأصل، جلسة إدارية، حدّ معدل لكل مستخدم،
 * وتحقّق من كلمة المرور الحالية داخل changeOwnPassword.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);
    const admin = await requireAdmin();

    // 6 محاولات كل ١٥ دقيقة: يمنع تخمين الكلمة الحالية عبر جلسة مفتوحة
    await enforceRateLimit({ key: `password:${admin.id}`, limit: 6, windowSeconds: 900 });

    const body = (await request.json().catch(() => null)) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    } | null;

    if (!body || typeof body !== "object") {
      throw new AppError("INVALID_REQUEST", "صيغة الطلب غير صالحة.", 400);
    }

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      throw new AppError("VALIDATION_ERROR", "أدخل كلمة المرور الحالية والجديدة.", 400);
    }

    await changeOwnPassword({ userId: admin.id, currentPassword, newPassword });

    return ok({ changed: true }, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
