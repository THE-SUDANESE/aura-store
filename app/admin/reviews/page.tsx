import type { Metadata } from "next";
import type { ReviewStatus } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AppError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/roles";
import {
  countReviewsByStatus,
  deleteReview,
  listReviewsForAdmin,
  REVIEW_STATUS_LABELS,
  setReviewStatus,
} from "@/lib/server/reviews";

export const metadata: Metadata = {
  title: "التقييمات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "border-warning-300 bg-warning-50 text-warning-700",
  approved: "border-accent-200 bg-accent-50 text-accent-700",
  rejected: "border-ink-200 bg-ink-100 text-ink-500",
};

async function moderate(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/reviews"));

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");

  try {
    if (action === "delete") {
      await deleteReview(id);
    } else if (action === "approve" || action === "reject" || action === "pending") {
      await setReviewStatus(id, action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending");
    }
  } catch (error) {
    redirect(
      `/admin/reviews?error=${encodeURIComponent(
        error instanceof AppError ? error.message : "تعذّر تنفيذ العملية.",
      )}`,
    );
  }

  revalidatePath("/admin/reviews");
  redirect("/admin/reviews?saved=1");
}

const TABS = [
  { key: "", label: "الكل", countKey: "all" },
  { key: "pending", label: "بانتظار المراجعة", countKey: "pending" },
  { key: "approved", label: "منشورة", countKey: "approved" },
  { key: "rejected", label: "مرفوضة", countKey: "rejected" },
] as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const filter =
    params.filter === "pending" || params.filter === "approved" || params.filter === "rejected"
      ? (params.filter as ReviewStatus)
      : undefined;

  const [reviews, counts] = await Promise.all([
    listReviewsForAdmin(filter),
    countReviewsByStatus(),
  ]);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">التقييمات</h1>
        <p className="mt-2 text-xs text-ink-500">
          لا يظهر أي تقييم في صفحة المنتج قبل اعتماده هنا.
        </p>
      </header>

      {(params.saved || params.error) && (
        <p
          role={params.error ? "alert" : "status"}
          className={
            params.error
              ? "mt-5 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-xs text-warning-700"
              : "mt-5 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800"
          }
        >
          {params.error ?? "تم تنفيذ العملية."}
        </p>
      )}

      <nav aria-label="تصفية التقييمات" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = (params.filter ?? "") === tab.key;
          return (
            <Link
              key={tab.key || "all"}
              href={tab.key ? `/admin/reviews?filter=${tab.key}` : "/admin/reviews"}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-full bg-ink-900 px-4 py-2 text-xs text-white"
                  : "rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-700 hover:border-ink-400"
              }
            >
              {tab.label} ({counts[tab.countKey]})
            </Link>
          );
        })}
      </nav>

      <section className="mt-6 space-y-3">
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500">
            لا توجد تقييمات في هذا التصنيف.
          </p>
        )}

        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${STATUS_STYLES[review.status]}`}>
                {REVIEW_STATUS_LABELS[review.status]}
              </span>
              <span className="text-sm font-medium text-ink-900">{review.authorName}</span>
              <span className="text-xs text-accent-700">{review.rating}/5</span>
              {review.isVerifiedPurchase && (
                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] text-accent-800">
                  شراء موثّق
                </span>
              )}
              <time className="ms-auto text-[11px] text-ink-400">
                {new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
                  dateStyle: "medium",
                }).format(new Date(review.createdAt))}
              </time>
            </div>

            <p className="mt-3 text-xs text-ink-500">
              على{" "}
              <Link
                href={`/product/${review.productSlug}`}
                className="text-ink-800 underline underline-offset-4"
              >
                {review.productName}
              </Link>
            </p>

            {review.title && <p className="mt-2 text-sm font-semibold text-ink-900">{review.title}</p>}
            {review.body && <p className="mt-1 text-sm leading-7 text-ink-600">{review.body}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {review.status !== "approved" && (
                <form action={moderate}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="action" value="approve" />
                  <Button type="submit" size="sm">اعتماد</Button>
                </form>
              )}
              {review.status !== "rejected" && (
                <form action={moderate}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="action" value="reject" />
                  <Button type="submit" size="sm" variant="outline">رفض</Button>
                </form>
              )}
              {review.status !== "pending" && (
                <form action={moderate}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="action" value="pending" />
                  <Button type="submit" size="sm" variant="outline">إعادة للمراجعة</Button>
                </form>
              )}
              <form action={moderate}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="action" value="delete" />
                <Button type="submit" size="sm" variant="outline">حذف</Button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
