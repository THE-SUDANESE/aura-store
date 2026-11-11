"use client";

import Link from "next/link";
import { useState } from "react";

type ReviewFormProps = {
  productId: string;
  isAuthenticated: boolean;
  loginHref: string;
};

const inputClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-ink-900";

/** نموذج تقييم العميل: التقييم يصل للمراجعة أولاً ولا يظهر مباشرة. */
export function ReviewForm({ productId, isAuthenticated, loginHref }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 p-5 text-center">
        <p className="text-sm text-ink-600">شاركنا رأيك في هذا المنتج بعد التجربة.</p>
        <Link
          href={loginHref}
          className="mt-3 inline-block rounded-full bg-ink-900 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ink-800"
        >
          سجّل الدخول لتكتب تقييماً
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5 text-center">
        <p className="text-sm font-medium text-accent-700">شكراً لك — وصل تقييمك.</p>
        <p className="mt-2 text-xs text-ink-500">
          سيظهر بعد مراجعته من فريق المتجر خلال ٢٤ ساعة.
        </p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    setFormError(null);

    if (rating < 1) {
      setErrors({ rating: "اختر عدد النجوم أولاً." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        if (payload?.error?.fields) setErrors(payload.error.fields);
        setFormError(payload?.error?.message ?? "تعذّر إرسال التقييم. حاول مجدداً.");
        return;
      }

      setIsDone(true);
    } catch {
      setFormError("تعذّر الاتصال بالخادم. تحقق من الشبكة وحاول مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 bg-white p-5">
      <h3 className="text-sm font-semibold text-ink-900">اكتب تقييمك</h3>

      <fieldset className="mt-3">
        <legend className="text-xs text-ink-600">تقييمك</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="عدد النجوم">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} من ٥`}
              onClick={() => setRating(star)}
              className={
                star <= rating
                  ? "text-2xl leading-none text-accent-600"
                  : "text-2xl leading-none text-ink-200 transition-colors hover:text-accent-300"
              }
            >
              ★
            </button>
          ))}
        </div>
        {errors.rating && (
          <p role="alert" className="mt-1 text-xs text-warning-700">
            {errors.rating}
          </p>
        )}
      </fieldset>

      <div className="mt-4">
        <label htmlFor="review-title" className="mb-1.5 block text-xs font-medium text-ink-700">
          عنوان مختصر (اختياري)
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
          placeholder="مثال: جودة ممتازة"
          className={inputClasses}
        />
      </div>

      <div className="mt-3">
        <label htmlFor="review-body" className="mb-1.5 block text-xs font-medium text-ink-700">
          تجربتك مع المنتج (اختياري)
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="المقاس، الخامة، سرعة التوصيل…"
          className={`${inputClasses} resize-y`}
        />
        {errors.body && (
          <p role="alert" className="mt-1 text-xs text-warning-700">
            {errors.body}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="mt-3 rounded-xl border border-warning-300 bg-warning-50 px-3 py-2 text-xs text-warning-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-full bg-ink-900 px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
      >
        {isSubmitting ? "جارٍ الإرسال…" : "إرسال التقييم"}
      </button>
    </form>
  );
}
