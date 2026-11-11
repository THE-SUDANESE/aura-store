/**
 * شكل إعدادات الموقع القابلة للتحرير من لوحة التحكم.
 * تُخزَّن كـ JSON في جدول site_settings، وتُطبَّع دائماً قبل الاستخدام
 * حتى لا يُفسد صفٌّ ناقص أو خاطئ الواجهة العامة.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  announcement: {
    enabled: boolean;
    text: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  contact: {
    /** بصيغة دولية بلا + وبلا مسافات، مثال: 966500000000 */
    whatsapp: string;
    email: string;
    phoneDisplay: string;
    address: string;
  };
  shipping: {
    /** نسبة ضريبة القيمة المضافة بالمئة (15 = ١٥٪) */
    vatRatePercent: number;
    /** رسوم الشحن الثابتة بالريال */
    flatSar: number;
    /** حد الشحن المجاني بالريال */
    freeThresholdSar: number;
  };
  footer: {
    tagline: string;
    paymentNote: string;
  };
  /** روابط حسابات المتجر — أي رابط فارغ لا يظهر في الفوتر. */
  social: {
    instagram: string;
    tiktok: string;
    snapchat: string;
    x: string;
    facebook: string;
    youtube: string;
  };
  nav: NavLink[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: {
    enabled: true,
    text: "شحن مجاني للطلبات فوق ٣٠٠ ر.س — وإرجاع خلال ١٤ يوماً",
  },
  hero: {
    eyebrow: "أهلاً بك في متجر AURA",
    title: "نظارات بتصميم لا يُنسى",
    subtitle:
      "نختار لك أفضل النظارات الشمسية بألوان العدسة الأكثر أناقة، مع حماية ١٠٠٪ من الأشعة فوق البنفسجية.",
    ctaLabel: "تسوّق العروض",
    ctaHref: "/shop?category=sunglasses",
  },
  contact: {
    whatsapp: "966500000000",
    email: "hello@aura.sa",
    phoneDisplay: "+966 50 000 0000",
    address: "الرياض، المملكة العربية السعودية",
  },
  shipping: {
    vatRatePercent: 15,
    flatSar: 25,
    freeThresholdSar: 300,
  },
  footer: {
    tagline: "نظارات وأزياء بتصميم هادئ وتفاصيل جريئة. مختارة بعناية، ومصممة لتدوم.",
    paymentNote: "الدفع عند الاستلام متاح — بطاقات الدفع قريباً",
  },
  social: {
    instagram: "",
    tiktok: "",
    snapchat: "",
    x: "",
    facebook: "",
    youtube: "",
  },
  nav: [
    { label: "نظارات شمسية", href: "/shop?category=sunglasses" },
    { label: "أزياء", href: "/shop?category=clothing" },
    { label: "كل المنتجات", href: "/shop" },
    { label: "قصتنا", href: "/pages/about" },
  ],
};

const MAX_TEXT = 300;
const MAX_LONG_TEXT = 1000;
const MAX_NAV_LINKS = 8;

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown, fallback: string, maxLength = MAX_TEXT): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.length === 0) return fallback;
  return trimmed.slice(0, maxLength);
}

function numberInRange(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/** يمنع javascript: و data: في أي رابط قابل للتحرير. */
export function sanitizeHref(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.length === 0) return fallback;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(mailto:|tel:)/i.test(trimmed)) return trimmed;
  return fallback;
}

/** رابط حساب اجتماعي: https فقط، وغير الصالح يُحذف بدل كسر الفوتر. */
function socialUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed.slice(0, 300);
}

function normalizeNav(value: unknown): NavLink[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.nav;

  const links = value
    .map((entry) => {
      const item = record(entry);
      const label = text(item.label, "", 40);
      if (!label) return null;
      return { label, href: sanitizeHref(item.href, "/shop") };
    })
    .filter((entry): entry is NavLink => entry !== null)
    .slice(0, MAX_NAV_LINKS);

  return links.length > 0 ? links : DEFAULT_SETTINGS.nav;
}

/** دمج آمن مع القيم الافتراضية: أي حقل ناقص أو خاطئ يعود للافتراضي. */
export function normalizeSettings(input: unknown): SiteSettings {
  const root = record(input);
  const announcement = record(root.announcement);
  const hero = record(root.hero);
  const contact = record(root.contact);
  const shipping = record(root.shipping);
  const footer = record(root.footer);
  const social = record(root.social);

  return {
    announcement: {
      enabled: announcement.enabled !== false,
      text: text(announcement.text, DEFAULT_SETTINGS.announcement.text, 200),
    },
    hero: {
      eyebrow: text(hero.eyebrow, DEFAULT_SETTINGS.hero.eyebrow, 80),
      title: text(hero.title, DEFAULT_SETTINGS.hero.title, 120),
      subtitle: text(hero.subtitle, DEFAULT_SETTINGS.hero.subtitle, 300),
      ctaLabel: text(hero.ctaLabel, DEFAULT_SETTINGS.hero.ctaLabel, 40),
      ctaHref: sanitizeHref(hero.ctaHref, DEFAULT_SETTINGS.hero.ctaHref),
    },
    contact: {
      whatsapp: text(contact.whatsapp, DEFAULT_SETTINGS.contact.whatsapp, 20).replace(/\D/g, ""),
      email: text(contact.email, DEFAULT_SETTINGS.contact.email, 120),
      phoneDisplay: text(contact.phoneDisplay, DEFAULT_SETTINGS.contact.phoneDisplay, 30),
      address: text(contact.address, DEFAULT_SETTINGS.contact.address, 120),
    },
    shipping: {
      vatRatePercent: numberInRange(
        shipping.vatRatePercent,
        DEFAULT_SETTINGS.shipping.vatRatePercent,
        0,
        50,
      ),
      flatSar: numberInRange(shipping.flatSar, DEFAULT_SETTINGS.shipping.flatSar, 0, 1000),
      freeThresholdSar: numberInRange(
        shipping.freeThresholdSar,
        DEFAULT_SETTINGS.shipping.freeThresholdSar,
        0,
        100000,
      ),
    },
    footer: {
      tagline: text(footer.tagline, DEFAULT_SETTINGS.footer.tagline, 300),
      paymentNote: text(footer.paymentNote, DEFAULT_SETTINGS.footer.paymentNote, 200),
    },
    social: {
      instagram: socialUrl(social.instagram),
      tiktok: socialUrl(social.tiktok),
      snapchat: socialUrl(social.snapchat),
      x: socialUrl(social.x),
      facebook: socialUrl(social.facebook),
      youtube: socialUrl(social.youtube),
    },
    nav: normalizeNav(root.nav),
  };
}

/** إعدادات الشحن بصيغة محسوبة (رسوم/حد/نسبة ككسر). */
export function shippingRulesOf(settings: SiteSettings) {
  return {
    vatRate: settings.shipping.vatRatePercent / 100,
    flatShippingSar: settings.shipping.flatSar,
    freeShippingThresholdSar: settings.shipping.freeThresholdSar,
  };
}

/** قسم داخل صفحة معلومات (عنوان + نص، ومعرّف اختياري لمرساة). */
export type PageSection = {
  id?: string;
  heading: string;
  body: string;
};
