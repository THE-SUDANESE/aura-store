import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { updateVariantStock } from "@/lib/server/admin";

/** PATCH /api/admin/variants/:id  { stockQuantity } — owner أو store_admin فقط */
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_STOCK = 100_000;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = randomUUID();

  try {
    const admin = await requireAdmin();

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      throw new AppError("INVALID_REQUEST", "معرّف المتغير غير صالح.", 400);
    }

    const body = (await request.json().catch(() => null)) as
      | { stockQuantity?: unknown }
      | null;

    const rawQuantity = body?.stockQuantity;
    const quantity = typeof rawQuantity === "number" ? rawQuantity : Number(rawQuantity);

    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_STOCK) {
      throw new AppError(
        "VALIDATION_ERROR",
        `الكمية يجب أن تكون عدداً صحيحاً بين ٠ و${MAX_STOCK}.`,
        400,
        { stockQuantity: "قيمة غير صالحة." },
      );
    }

    const variant = await updateVariantStock({
      variantId: id,
      stockQuantity: quantity,
      actorId: admin.id,
    });

    return ok(variant, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
