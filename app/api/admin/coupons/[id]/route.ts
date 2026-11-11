import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { deleteCoupon, updateCoupon } from "@/lib/server/coupons";

/** PATCH/DELETE /api/admin/coupons/:id — تعطيل/تعديل أو حذف كوبون. */
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();
  try {
    await requireAdmin();
    const { id } = await context.params;
    if (!UUID_RE.test(id)) throw new AppError("INVALID_REQUEST", "معرّف غير صالح.", 400);

    const body = (await request.json().catch(() => null)) as
      | { isActive?: unknown; maxUses?: unknown; expiresAt?: unknown; description?: unknown }
      | null;
    if (!body) throw new AppError("INVALID_REQUEST", "لا يوجد تغيير مطلوب.", 400);

    const coupon = await updateCoupon(id, {
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
      maxUses: body.maxUses === undefined ? undefined : (body.maxUses as number | null),
      expiresAt: body.expiresAt === undefined ? undefined : (body.expiresAt as string | null),
      description: body.description === undefined ? undefined : (body.description as string | null),
    });
    return ok(coupon, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();
  try {
    await requireAdmin();
    const { id } = await context.params;
    if (!UUID_RE.test(id)) throw new AppError("INVALID_REQUEST", "معرّف غير صالح.", 400);
    await deleteCoupon(id);
    return ok({ deleted: true }, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
