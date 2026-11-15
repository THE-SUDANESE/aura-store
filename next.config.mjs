/**
 * رؤوس أمان موحّدة لكل المسارات.
 *
 * CSP هنا مبنيّ على السماح بـ«unsafe-inline» للسكربتات لأن Next.js يضخّ
 * بيانات RSC داخل وسوم inline؛ البديل الأقوى هو nonce عبر middleware،
 * ويُترك كتحسين لاحق. حتى بهذا الشكل نمنع تحميل أي سكربت من نطاق خارجي
 * غير PostHog، ونمنع تأطير الموقع (clickjacking) وقراءة CSS كمصدر.
 */
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://us.i.posthog.com https://eu.i.posthog.com`,
  "style-src 'self' 'unsafe-inline'",
  // صور المنتجات قد تكون على CDN خارجي (UploadThing) أو لصق روابط قديمة
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://us.i.posthog.com https://eu.i.posthog.com https://*.ufs.sh",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // HSTS على localhost يخزّنه المتصفح ويصعّب التطوير، لذلك للإنتاج فقط
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // لا نكشف إصدار الإطار في الترويسات
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
