import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";

/**
 * POST /api/reviews — تقييم من عميل مسجّل.
 * لا يُنشر تلقائياً: يدخل قائمة المراجعة في اللوحة (status = pending).
 * يُعلَّم كـ«شراء موثّق» فقط إذا كان للمستخدم طلب مُسلَّم يحتوي المنتج.
 */
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);

    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError("UNAUTHORIZED", "سجّل الدخول أولاً لتتمكن من التقييم.", 401);
    }
    const userId = session.user.id;

    const user = await prisma.user.findFirst({
      where: { id: userId, isActive: true, deletedAt: null },
      select: { id: true, fullName: true, email: true },
    });
    if (!user) throw new AppError("UNAUTHORIZED", "الحساب غير متاح.", 401);

    await enforceRateLimit({ key: `review:${userId}`, limit: 5, windowSeconds: 86400 });

    const body = (await request.json().catch(() => null)) as
      | { productId?: unknown; rating?: unknown; title?: unknown; body?: unknown }
      | null;

    const productId = typeof body?.productId === "string" ? body.productId : "";
    if (!UUID_RE.test(productId)) {
      throw new AppError("INVALID_REQUEST", "المنتج غير صالح.", 400);
    }

    const fields: Record<string, string> = {};

    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      fields.rating = "اختر تقييماً من ١ إلى ٥ نجوم.";
    }

    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 80) : "";
    const text = typeof body?.body === "string" ? body.body.trim().slice(0, 1000) : "";

    if (text.length > 0 && text.length < 10) {
      fields.body = "اكتب ١٠ أحرف على الأقل، أو اترك التعليق فارغاً.";
    }

    if (Object.keys(fields).length > 0) {
      throw new AppError("VALIDATION_ERROR", "يرجى تصحيح الحقول المحددة.", 400, fields);
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "active", deletedAt: null },
      select: { id: true, slug: true },
    });
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", "المنتج غير موجود.", 404);

    const existing = await prisma.review.findFirst({
      where: { productId, userId, status: { in: ["pending", "approved"] } },
      select: { id: true },
    });
    if (existing) {
      throw new AppError("VALIDATION_ERROR", "لقد قيّمت هذا المنتج مسبقاً.", 409, {
        rating: "لقد قيّمت هذا المنتج مسبقاً.",
      });
    }

    // شراء موثّق: طلب مُسلَّم لهذا المستخدم يحتوي نفس المنتج
    const purchasedItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: "delivered" },
      },
      select: { orderId: true },
      orderBy: { createdAt: "desc" },
    });

    await prisma.review.create({
      data: {
        productId,
        userId,
        orderId: purchasedItem?.orderId ?? null,
        authorName: user.fullName?.trim() || user.email.split("@")[0] || "عميل AURA",
        rating,
        title: title || null,
        body: text || null,
        isVerifiedPurchase: Boolean(purchasedItem),
        status: "pending",
      },
    });

    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/admin/reviews");

    return ok({ status: "pending" }, requestId, 201);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
