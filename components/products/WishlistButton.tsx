"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type WishlistButtonProps = {
  productId: string;
  initialInWishlist: boolean;
};

/** زر المفضلة: يتطلب تسجيل الدخول، ويحوّل الزائر لصفحة الدخول عند الحاجة. */
export function WishlistButton({ productId, initialInWishlist }: WishlistButtonProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (isBusy) return;
    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.status === 401) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        setError(payload?.error?.message ?? "تعذّر تحديث المفضلة.");
        return;
      }

      setInWishlist(Boolean(payload.data.inWishlist));
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={isBusy}
        aria-pressed={inWishlist}
        className={
          inWishlist
            ? "inline-flex items-center gap-2 rounded-full border border-accent-300 bg-accent-50 px-5 py-2.5 text-xs font-medium text-accent-800 transition-colors disabled:opacity-50"
            : "inline-flex items-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-xs text-ink-700 transition-colors hover:border-ink-400 disabled:opacity-50"
        }
      >
        <span aria-hidden>{inWishlist ? "♥" : "♡"}</span>
        {inWishlist ? "في المفضلة" : "أضف إلى المفضلة"}
      </button>
      {error ? <p className="mt-2 text-[11px] text-warning-700">{error}</p> : null}
    </div>
  );
}
