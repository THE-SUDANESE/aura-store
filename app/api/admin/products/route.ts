import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { createProduct } from "@/lib/server/catalog-admin";
import type { AdminProductInput } from "@/lib/types/catalog";

export const dynamic = "force-dynamic";

/** POST /api/admin/products — إنشاء منتج مع متغيراته وصوره وشاراته. */
export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    await requireAdmin();

    const body = (await request.json().catch(() => null)) as
      | { product?: AdminProductInput }
      | null;
    if (!body?.product) {
      throw new AppError("INVALID_REQUEST", "صيغة المنتج غير صالحة.", 400);
    }

    const product = await createProduct(body.product);
    return ok(product, requestId, 201);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
