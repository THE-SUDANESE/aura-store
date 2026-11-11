import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { evaluateCoupon, normalizeCouponCode } from "@/lib/server/coupons";
import { clientIp, enforceRateLimit } from "@/lib/server/rate-limit";

/**
 * POST /api/coupons/validate
 * معاينة فقط لصفحة الدفع: المبلغ النهائي يُعاد حسابه على الخادم عند إنشاء الطلب.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);
    await enforceRateLimit({
      key: `coupon:${clientIp(request)}`,
      limit: 20,
      windowSeconds: 600,
    });

    const body = (await request.json().catch(() => null)) as
      | { code?: unknown; subtotal?: unknown }
      | null;

    const subtotal = Number(body?.subtotal);
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      throw new AppError("VALIDATION_ERROR", "السلة فارغة.", 400);
    }

    const code = normalizeCouponCode(body?.code);
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      throw new AppError("VALIDATION_ERROR", "كود الخصم غير صحيح.", 400, {
        discountCode: "كود الخصم غير صحيح.",
      });
    }

    const discountCents = evaluateCoupon(coupon, Math.round(subtotal * 100));

    return ok(
      { code: coupon.code, discountCents, discount: discountCents / 100 },
      requestId,
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
