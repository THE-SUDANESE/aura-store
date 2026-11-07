import type { ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/** إدارة التقييمات: العرض للزوار، والمراجعة من لوحة التحكم. */

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "بانتظار المراجعة",
  approved: "منشور",
  rejected: "مرفوض",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AdminReviewRow = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

export async function listReviewsForAdmin(status?: ReviewStatus): Promise<AdminReviewRow[]> {
  const reviews = await prisma.review.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { product: { select: { nameAr: true, slug: true } } },
  });

  return reviews.map((review) => ({
    id: review.id,
    productId: review.productId,
    productName: review.product.nameAr,
    productSlug: review.product.slug,
    authorName: review.authorName,
    rating: review.rating,
    title: review.title,
    body: review.body,
    status: review.status,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt.toISOString(),
  }));
}

export async function countReviewsByStatus(): Promise<Record<ReviewStatus | "all", number>> {
  const grouped = await prisma.review.groupBy({ by: ["status"], _count: { _all: true } });

  const counts: Record<ReviewStatus | "all", number> = {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const row of grouped) {
    counts[row.status] = row._count._all;
    counts.all += row._count._all;
  }

  return counts;
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  if (!UUID_RE.test(id)) throw new AppError("INVALID_REQUEST", "معرّف التقييم غير صالح.", 400);

  const review = await prisma.review
    .update({ where: { id }, data: { status }, select: { product: { select: { slug: true } } } })
    .catch(() => {
      throw new AppError("NOT_FOUND", "التقييم غير موجود.", 404);
    });

  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${review.product.slug}`);
}

export async function deleteReview(id: string): Promise<void> {
  if (!UUID_RE.test(id)) throw new AppError("INVALID_REQUEST", "معرّف التقييم غير صالح.", 400);

  const review = await prisma.review
    .delete({ where: { id }, select: { product: { select: { slug: true } } } })
    .catch(() => {
      throw new AppError("NOT_FOUND", "التقييم غير موجود.", 404);
    });

  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${review.product.slug}`);
}

/* --------------------------- عرض التقييمات للزوار --------------------------- */

export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

export type ProductReviews = {
  items: PublicReview[];
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

/** التقييمات المنشورة فقط — لا تُعرض قيد المراجعة أو المرفوضة أبداً. */
export async function getProductReviews(productId: string): Promise<ProductReviews> {
  const reviews = await prisma.review.findMany({
    where: { productId, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      authorName: true,
      rating: true,
      title: true,
      body: true,
      isVerifiedPurchase: true,
      createdAt: true,
    },
  });

  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const bucket = Math.min(5, Math.max(1, review.rating)) as 1 | 2 | 3 | 4 | 5;
    distribution[bucket] += 1;
  }

  const count = reviews.length;
  const average =
    count === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / count;

  return {
    items: reviews.map((review) => ({
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt.toISOString(),
    })),
    count,
    average: Math.round(average * 10) / 10,
    distribution,
  };
}
