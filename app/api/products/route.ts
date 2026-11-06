import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { listProducts } from "@/lib/server/products";

/**
 * GET /api/products?category=sunglasses&page=1&pageSize=24
 * الكتالوج المنشور فقط، مع ترقيم صفحات.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const { searchParams } = request.nextUrl;

    const category = searchParams.get("category");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "24");

    if (
      !Number.isFinite(page) ||
      !Number.isFinite(pageSize) ||
      page < 1 ||
      pageSize < 1
    ) {
      throw new AppError("INVALID_REQUEST", "قيم الترقيم غير صالحة.", 400);
    }

    const result = await listProducts({
      category: category && category.length <= 60 ? category : null,
      page,
      pageSize,
    });

    return ok(result, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
