import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { ok, toErrorResponse } from "@/lib/http";
import { createCoupon, listCoupons, type CouponInput } from "@/lib/server/coupons";

/** GET/POST /api/admin/coupons — عرض الكوبونات وإنشاء كوبون جديد. */
export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = randomUUID();
  try {
    await requireAdmin();
    return ok(await listCoupons(), requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    await requireAdmin();
    const body = (await request.json().catch(() => null)) as CouponInput | null;
    if (!body) {
      return toErrorResponse(new Error("empty"), requestId);
    }
    const coupon = await createCoupon(body);
    return ok(coupon, requestId, 201);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
