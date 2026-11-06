import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { isOrderStatus } from "@/lib/admin/order-status";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { updateOrderStatus } from "@/lib/server/admin";

/** PATCH /api/admin/orders/:id  { status } — owner أو store_admin فقط */
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

    const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
    const nextStatus = body?.status;

    if (!isOrderStatus(nextStatus)) {
      throw new AppError("VALIDATION_ERROR", "حالة الطلب غير صالحة.", 400, {
        status: "اختر حالة صحيحة.",
      });
    }

    const order = await updateOrderStatus({ orderId: id, nextStatus });

    return ok(order, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
