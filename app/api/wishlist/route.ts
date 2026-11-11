import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";

/** POST /api/wishlist — إضافة/إزالة منتج من مفضلة العميل المسجّل. */
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);

    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError("UNAUTHORIZED", "سجّل الدخول لحفظ المنتجات في المفضلة.", 401);
    }
    const userId = session.user.id;

    await enforceRateLimit({ key: `wishlist:${userId}`, limit: 60, windowSeconds: 600 });

    const body = (await request.json().catch(() => null)) as { productId?: unknown } | null;
    const productId = typeof body?.productId === "string" ? body.productId : "";
    if (!UUID_RE.test(productId)) {
      throw new AppError("INVALID_REQUEST", "المنتج غير صالح.", 400);
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "active", deletedAt: null },
      select: { slug: true },
    });
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", "المنتج غير موجود.", 404);

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlistItem.create({ data: { userId, productId } });
    }

    revalidatePath("/account/wishlist");
    return ok({ inWishlist: !existing }, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
