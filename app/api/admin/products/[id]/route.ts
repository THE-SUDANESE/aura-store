import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { softDeleteProduct, updateProduct } from "@/lib/server/catalog-admin";
import type { AdminProductInput } from "@/lib/types/catalog";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

async function idOf(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    throw new AppError("INVALID_REQUEST", "معرّف المنتج غير صالح.", 400);
  }
  return id;
}

export async function PATCH(request: NextRequest, context: Context) {
  const requestId = randomUUID();

  try {
    await requireAdmin();
    const id = await idOf(context);

    const body = (await request.json().catch(() => null)) as
      | { product?: AdminProductInput }
      | null;
    if (!body?.product) {
      throw new AppError("INVALID_REQUEST", "صيغة المنتج غير صالحة.", 400);
    }

    return ok(await updateProduct(id, body.product), requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

/** حذف ناعم (الحذف النهائي ممنوع لأن بنود الطلبات تشير للمنتج). */
export async function DELETE(_request: NextRequest, context: Context) {
  const requestId = randomUUID();

  try {
    await requireAdmin();
    const id = await idOf(context);
    return ok(await softDeleteProduct(id), requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
