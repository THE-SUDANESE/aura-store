import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { isOrderStatus } from "@/lib/admin/order-status";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { updateOrderStatus } from "@/lib/server/admin";
import { applyOrderAdjustments } from "@/lib/server/orders-admin";

/**
 * PATCH /api/admin/orders/:id
 * { status } لتغيير الحالة، و/أو { adminNote, discountTotal } لتعديل الطلب.
 * owner أو store_admin فقط.
 */
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = randomUUID();

  try {
    // حماية مزدوجة: middleware + تحقق من الدور من قاعدة البيانات
    await requireAdmin();

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      throw new AppError("INVALID_REQUEST", "معرّف الطلب غير صالح.", 400);
    }

    const body = (await request.json().catch(() => null)) as
      | { status?: unknown; adminNote?: unknown; discountTotal?: unknown }
      | null;

    const hasStatus = body?.status !== undefined;
    const hasAdjustments = body?.adminNote !== undefined || body?.discountTotal !== undefined;

    if (!hasStatus && !hasAdjustments) {
      throw new AppError("INVALID_REQUEST", "لا يوجد تغيير مطلوب.", 400);
    }

    if (hasAdjustments) {
      await applyOrderAdjustments({
        orderId: id,
        adminNote: body?.adminNote ?? null,
        discountTotal: body?.discountTotal ?? null,
      });
    }

    if (hasStatus) {
      if (!isOrderStatus(body?.status)) {
        throw new AppError("VALIDATION_ERROR", "حالة الطلب غير صالحة.", 400, {
          status: "اختر حالة صحيحة.",
        });
      }

      const order = await updateOrderStatus({ orderId: id, nextStatus: body.status });
      return ok(order, requestId);
    }

    return ok({ id }, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
