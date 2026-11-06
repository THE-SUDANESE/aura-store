"use client";

import type { PostHog } from "posthog-js";

/**
 * غلاف صغير حول PostHog (posthog-js) للواجهة العامة.
 *
 * قواعد ثابتة هنا:
 * - لا تحميل للمكتبة ولا إرسال أي حدث قبل موافقة صريحة من الزائر على التحليلات.
 * - بلا NEXT_PUBLIC_POSTHOG_KEY كل الدوال تصبح بلا أثر (no-op)، فلا يتعطّل المتجر.
 * - المكتبة تُحمَّل عند الحاجة (dynamic import) حتى لا تدخل في الحزمة الأساسية.
 */

export const ANALYTICS_CONSENT_KEY = "aura-analytics-consent";

/** آخر مستخدم عُرِّف في PostHog — نحتاجه لقطع الربط بعد تسجيل الخروج. */
const IDENTIFIED_USER_KEY = "aura-analytics-user";

export type AnalyticsConsent = "granted" | "denied";

type AnalyticsProperties = Record<string, unknown>;

const projectKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let client: PostHog | null = null;
let clientPromise: Promise<PostHog | null> | null = null;
/** يُطلب حين نقطع الربط قبل تحميل المكتبة: يُنفَّذ فور التهيئة. */
let resetBeforeInit = false;

/** هل مفتاح المشروع مضبوط؟ بدونه لا نعرض لافتة الموافقة أصلاً. */
export function isAnalyticsConfigured(): boolean {
  return Boolean(projectKey);
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    // وضع التصفح الخاص قد يمنع التخزين — نعاملها كعدم موافقة
    return null;
  }
}

export function writeAnalyticsConsent(consent: AnalyticsConsent): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // لا شيء نفعله: الجلسة الحالية ستبقى بلا تحليلات
  }
}

/** يحمّل PostHog ويهيّئه، ويعيد null إن لم توجد موافقة أو مفتاح. */
async function loadAnalytics(): Promise<PostHog | null> {
  if (typeof window === "undefined" || !projectKey) return null;
  if (readAnalyticsConsent() !== "granted") return null;
  if (client) return client;

  const key = projectKey;

  clientPromise ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: apiHost,
        // المشاهدات تُلتقط يدوياً لأن App Router لا يعيد تحميل الصفحة
        capture_pageview: false,
        capture_pageleave: false,
        // ملفات الأشخاص تُنشأ للمستخدمين المعرّفين فقط
        person_profiles: "identified_only",
        // لا تسجيل للجلسات (session replay) في هذه المرحلة
        disable_session_recording: true,
        respect_dnt: true,
        defaults: "2025-05-24",
      });

      // طُلب قطع الربط قبل التهيئة (تسجيل خروج في أول زيارة):
      // نمسح الهوية المحفوظة قبل أي حدث
      if (resetBeforeInit) {
        posthog.reset();
        resetBeforeInit = false;
      }

      client = posthog;
      return posthog;
    })
    .catch(() => {
      // فشل تحميل المكتبة يجب ألا يكسر الواجهة
      clientPromise = null;
      return null;
    });

  return clientPromise;
}

/** معرّف آخر مستخدم عُرِّف في PostHog (يبقى بعد إعادة تحميل الصفحة). */
export function readIdentifiedAnalyticsUser(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(IDENTIFIED_USER_KEY);
  } catch {
    return null;
  }
}

/** يرسل حدثاً — لا يفعل شيئاً قبل الموافقة. */
export function captureAnalyticsEvent(
  event: string,
  properties?: AnalyticsProperties,
): void {
  void loadAnalytics().then((posthog) => {
    if (!posthog) return;
    posthog.capture(event, properties);
  });
}

/**
 * يربط الأحداث الحالية بالمستخدم المسجّل، ويضبط خصائصه في PostHog.
 * نحفظ المعرّف محلياً حتى نعرف أن الزائر كان معرَّفاً بعد إعادة تحميل الصفحة.
 */
export function identifyAnalyticsUser(
  distinctId: string,
  properties?: AnalyticsProperties,
): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(IDENTIFIED_USER_KEY, distinctId);
    } catch {
      // بلا تخزين نبقى قادرين على التعريف داخل هذه الجلسة
    }
  }

  // تعريف صريح يلغي أي طلب قطع ربط سابق لم يُنفَّذ بعد
  resetBeforeInit = false;

  void loadAnalytics().then((posthog) => {
    if (!posthog) return;
    posthog.identify(distinctId, properties);
  });
}

/**
 * قطع الربط عند تسجيل الخروج: يمسح المعرّف المحفوظ ويطلب من PostHog
 * بدء هوية مجهولة جديدة، حتى لا تُنسَب أحداث الزائر التالي إلى الحساب السابق.
 */
export function resetAnalyticsUser(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(IDENTIFIED_USER_KEY);
    } catch {
      // لا شيء نفعله: التخزين غير متاح
    }
  }

  if (!client) {
    // المكتبة لم تُحمّل بعد: نؤجّل القطع إلى ما بعد التهيئة
    resetBeforeInit = true;
    return;
  }

  client.reset();
}
