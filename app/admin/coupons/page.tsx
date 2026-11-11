import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AppError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/roles";
import { createCoupon, deleteCoupon, listCoupons, updateCoupon } from "@/lib/server/coupons";
import { formatNumber, formatSAR } from "@/lib/format";

export const metadata: Metadata = {
  title: "الكوبونات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type CouponsPageProps = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

async function createCouponAction(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/coupons"));

  try {
    await createCoupon({
      code: String(formData.get("code") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      type: String(formData.get("type") ?? "percent"),
      value: Number(formData.get("value") ?? 0),
      minSubtotal: Number(formData.get("minSubtotal") ?? 0),
      maxUses: String(formData.get("maxUses") ?? "").trim()
        ? Number(formData.get("maxUses"))
        : null,
      startsAt: String(formData.get("startsAt") ?? "") || null,
      expiresAt: String(formData.get("expiresAt") ?? "") || null,
    });
  } catch (error) {
    const message = error instanceof AppError ? error.message : "تعذّر إنشاء الكوبون.";
    const fields = error instanceof AppError && error.fields ? Object.values(error.fields)[0] : "";
    redirect(`/admin/coupons?error=${encodeURIComponent(fields || message)}`);
  }

  redirect("/admin/coupons?ok=" + encodeURIComponent("تم إنشاء الكوبون."));
}

async function couponAction(formData: FormData) {
  "use server";
  await requireAdmin().catch(() => redirect("/auth/login?redirect=/admin/coupons"));

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");

  try {
    if (action === "delete") {
      await deleteCoupon(id);
    } else if (action === "toggle") {
      await updateCoupon(id, { isActive: String(formData.get("isActive")) === "true" });
    }
  } catch (error) {
    const message = error instanceof AppError ? error.message : "تعذّر تنفيذ العملية.";
    redirect(`/admin/coupons?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/coupons?ok=" + encodeURIComponent("تم التحديث."));
}

const inputClasses =
  "h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-ink-900";

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { dateStyle: "medium" });

export default async function CouponsPage({ searchParams }: CouponsPageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/auth/login?redirect=/admin/coupons");
  }

  const [{ error, ok: success }, coupons] = await Promise.all([searchParams, listCoupons()]);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            AURA Admin
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">كوبونات الخصم</h1>
          <p className="mt-2 text-xs text-ink-500">
            نسبة مئوية أو مبلغ ثابت، مع حد أدنى للطلب وحد أقصى للاستخدام وتاريخ انتهاء.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-700 transition-colors hover:border-ink-400"
        >
          العودة للوحة
        </Link>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-xs text-warning-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-4 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-700">
          {success}
        </p>
      )}

      {/* إنشاء كوبون */}
      <section className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">كوبون جديد</h2>

        <form action={createCouponAction} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-xs font-medium text-ink-700">
              الكود <span className="text-warning-700">*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              maxLength={32}
              placeholder="AURA10"
              className={`${inputClasses} uppercase`}
            />
            <p className="mt-1 text-[11px] text-ink-400">حروف إنجليزية وأرقام و - أو _ (٣–٣٢).</p>
          </div>

          <div>
            <label htmlFor="type" className="mb-1.5 block text-xs font-medium text-ink-700">
              النوع <span className="text-warning-700">*</span>
            </label>
            <select id="type" name="type" className={inputClasses} defaultValue="percent">
              <option value="percent">نسبة مئوية ٪</option>
              <option value="fixed">مبلغ ثابت (ر.س)</option>
            </select>
          </div>

          <div>
            <label htmlFor="value" className="mb-1.5 block text-xs font-medium text-ink-700">
              القيمة <span className="text-warning-700">*</span>
            </label>
            <input
              id="value"
              name="value"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="10"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="minSubtotal" className="mb-1.5 block text-xs font-medium text-ink-700">
              حد أدنى للطلب (ر.س)
            </label>
            <input
              id="minSubtotal"
              name="minSubtotal"
              type="number"
              min="0"
              step="1"
              defaultValue={0}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="maxUses" className="mb-1.5 block text-xs font-medium text-ink-700">
              أقصى عدد استخدامات
            </label>
            <input
              id="maxUses"
              name="maxUses"
              type="number"
              min="1"
              step="1"
              placeholder="بلا حد"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="expiresAt" className="mb-1.5 block text-xs font-medium text-ink-700">
              تاريخ الانتهاء
            </label>
            <input id="expiresAt" name="expiresAt" type="datetime-local" className={inputClasses} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-ink-700">
              وصف داخلي (اختياري)
            </label>
            <input
              id="description"
              name="description"
              maxLength={200}
              placeholder="حملة إنستغرام نوفمبر"
              className={inputClasses}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit">إنشاء الكوبون</Button>
          </div>
        </form>
      </section>

      {/* القائمة */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-ink-900">الكوبونات ({formatNumber(coupons.length)})</h2>

        {coupons.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-ink-200 px-4 py-10 text-center text-sm text-ink-500">
            لا توجد كوبونات بعد — أنشئ أول كوبون من النموذج أعلاه.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {coupons.map((coupon) => {
              const remaining =
                coupon.maxUses === null ? null : Math.max(coupon.maxUses - coupon.usedCount, 0);

              return (
                <li
                  key={coupon.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-semibold text-white" dir="ltr">
                        {coupon.code}
                      </span>
                      <span className="text-sm text-ink-900">
                        {coupon.type === "percent"
                          ? `${formatNumber(coupon.value)}٪`
                          : formatSAR(coupon.value)}
                      </span>
                      <span
                        className={
                          coupon.isActive
                            ? "rounded-full border border-accent-200 bg-accent-50 px-2 py-0.5 text-[11px] text-accent-700"
                            : "rounded-full border border-ink-200 bg-ink-100 px-2 py-0.5 text-[11px] text-ink-500"
                        }
                      >
                        {coupon.isActive ? "نشط" : "موقوف"}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-ink-500">
                      استُخدم {formatNumber(coupon.usedCount)}
                      {remaining === null ? " مرة (بلا حد)" : ` من ${formatNumber(coupon.maxUses ?? 0)}`}
                      {coupon.minSubtotal > 0 ? ` — حد أدنى ${formatSAR(coupon.minSubtotal)}` : ""}
                      {coupon.expiresAt ? ` — ينتهي ${dateFormatter.format(new Date(coupon.expiresAt))}` : ""}
                    </p>

                    {coupon.description ? (
                      <p className="mt-1 text-[11px] text-ink-400">{coupon.description}</p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <form action={couponAction}>
                      <input type="hidden" name="id" value={coupon.id} />
                      <input type="hidden" name="action" value="toggle" />
                      <input type="hidden" name="isActive" value={coupon.isActive ? "false" : "true"} />
                      <button
                        type="submit"
                        className="h-9 rounded-full border border-ink-200 px-4 text-xs text-ink-700 transition-colors hover:border-ink-400"
                      >
                        {coupon.isActive ? "إيقاف" : "تفعيل"}
                      </button>
                    </form>

                    <form action={couponAction}>
                      <input type="hidden" name="id" value={coupon.id} />
                      <input type="hidden" name="action" value="delete" />
                      <button
                        type="submit"
                        className="h-9 rounded-full border border-warning-300 px-4 text-xs text-warning-700 transition-colors hover:bg-warning-50"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
