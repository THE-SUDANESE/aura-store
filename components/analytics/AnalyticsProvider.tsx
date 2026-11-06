"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
  isAnalyticsConfigured,
  readAnalyticsConsent,
  readIdentifiedAnalyticsUser,
  resetAnalyticsUser,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/posthog";

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

/**
 * يهيّئ PostHog بعد موافقة الزائر فقط، ويسجّل مشاهدة الصفحات
 * وتعريف المستخدم المسجّل (حتى تعمل التقارير والقُمع والمتابعة عبر الأجهزة).
 *
 * ملاحظة: تُقرأ الموافقة من localStorage بعد الترطيب، لذا لا يوجد اختلاف
 * بين HTML الخادم والعميل.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  // هل حُسِمت هوية الزائر لهذه الزيارة؟ لا نرسل أي مشاهدة صفحة قبلها،
  // حتى لا تُنسَب أول مشاهدة إلى الحساب السابق بعد تسجيل الخروج
  const [identityResolved, setIdentityResolved] = useState(false);
  const identifiedUserId = useRef<string | null>(null);
  const hadAnonymousVisit = useRef(false);
  const firstSessionRead = useRef(true);

  useEffect(() => {
    setConsent(readAnalyticsConsent());
    setIsHydrated(true);
  }, []);

  // مشاهدة صفحة عند كل تنقّل (App Router لا يعيد تحميل الصفحة)
  useEffect(() => {
    if (consent !== "granted" || !identityResolved) return;
    captureAnalyticsEvent("$pageview", { $current_url: window.location.href });
  }, [consent, identityResolved, pathname]);

  // تعريف المستخدم المسجّل بعد كل تنقّل (الجلسة تتغيّر بعد تسجيل الدخول)
  useEffect(() => {
    if (consent !== "granted") return;
    // بعد تعريف المستخدم لا داعي لطلب الجلسة في كل تنقّل
    if (identifiedUserId.current) {
      setIdentityResolved(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/auth/session").catch(() => null);
      const session: { user?: SessionUser } | null = response?.ok
        ? await response.json().catch(() => null)
        : null;
      if (cancelled) return;

      const user = session?.user;
      const isFirstRead = firstSessionRead.current;
      firstSessionRead.current = false;

      if (!user?.id) {
        hadAnonymousVisit.current = true;

        // زيارة بلا جلسة بعد تعريف سابق = تسجيل خروج (أو انتهاء الجلسة):
        // نقطع الربط كي لا تُنسَب الأحداث القادمة إلى الحساب السابق
        if (identifiedUserId.current || readIdentifiedAnalyticsUser()) {
          resetAnalyticsUser();
          identifiedUserId.current = null;
        }

        setIdentityResolved(true);
        return;
      }

      if (identifiedUserId.current !== user.id) {
        identifyAnalyticsUser(user.id, {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role ?? undefined,
        });
        identifiedUserId.current = user.id;

        // زيارة كانت مجهولة ثم صارت مسجّلة = تسجيل دخول فعلي (لا مجرد استعادة جلسة)
        if (!isFirstRead && hadAnonymousVisit.current) {
          captureAnalyticsEvent("user_signed_in", { method: "credentials" });
        }
      }

      setIdentityResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [consent, pathname]);

  if (!isHydrated || !isAnalyticsConfigured() || consent !== null) return null;

  const decide = (value: AnalyticsConsent) => {
    writeAnalyticsConsent(value);
    setConsent(value);
  };

  return (
    <div
      role="dialog"
      aria-label="تفضيلات التحليلات"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-3xl border border-ink-100 bg-sand-50/95 p-5 shadow-soft backdrop-blur sm:inset-x-6"
    >
      <p className="text-sm font-medium text-ink-900">نحترم خصوصيتك</p>
      <p className="mt-1.5 text-xs leading-6 text-ink-600">
        نستخدم PostHog لفهم كيفية استخدام المتجر (زيارات الصفحات، إضافة للسلة، إتمام
        الطلب) لنحسّن تجربتك. لا نرسل أي بيانات قبل موافقتك.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="rounded-full bg-ink-900 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ink-700"
        >
          أوافق على التحليلات
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="text-xs text-ink-600 underline underline-offset-4 transition-colors hover:text-ink-900"
        >
          لا، شكراً
        </button>
      </div>
    </div>
  );
}
