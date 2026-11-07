import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { createOrder, parseCheckoutPayload } from "@/lib/server/orders";
import { clientIp, enforceRateLimit } from "@/lib/server/rate-limit";

/**
 * POST /api/orders
 * ينشئ طلباً للزائر أو للعميل المسجّل.
 * أي إجماليات يرسلها العميل تُهمَل تماماً؛ يُحسب كل شيء على الخادم.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    // فحص الأصل ثم حد المعدل: ١٠ طلبات كل ١٠ دقائق لكل عنوان
    assertSameOrigin(request);
    await enforceRateLimit({
      key: `orders:${clientIp(request)}`,
      limit: 10,
      windowSeconds: 600,
    });

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "صيغة JSON غير صالحة.", 400);
    }

    const parsed = parseCheckoutPayload(payload);

    // الشراء كزائر مسموح؛ نربط الطلب بالحساب فقط إذا كانت الجلسة تشير لمستخدم موجود ونشط
    let userId: string | null = null;
    const session = await auth();
    if (session?.user?.id) {
      const existingUser = await prisma.user.findFirst({
        where: { id: session.user.id, isActive: true, deletedAt: null },
        select: { id: true },
      });
      userId = existingUser?.id ?? null;
    }

    const order = await createOrder({ ...parsed, userId });

    return ok(order, requestId, 201);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
