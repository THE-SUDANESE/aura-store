import Link from "next/link";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/types/settings";

const SHOP_LINKS = [
  { href: "/shop?category=sunglasses", label: "النظارات الشمسية" },
  { href: "/shop?category=clothing", label: "الأزياء" },
  { href: "/shop", label: "كل المنتجات" },
  { href: "/cart", label: "سلة المشتريات" },
] as const;

const HELP_LINKS = [
  { href: "/pages/shipping-returns", label: "الشحن والاستبدال" },
  { href: "/pages/shipping-returns#returns", label: "سياسة الإرجاع (١٤ يوماً)" },
  { href: "/account", label: "طلباتي" },
] as const;

const LEGAL_LINKS = [
  { href: "/pages/privacy", label: "سياسة الخصوصية" },
  { href: "/pages/terms", label: "الشروط والأحكام" },
] as const;

const SOCIAL_LABELS: Array<{ key: keyof SiteSettings["social"]; label: string }> = [
  { key: "instagram", label: "إنستغرام" },
  { key: "tiktok", label: "تيك توك" },
  { key: "snapchat", label: "سناب شات" },
  { key: "x", label: "X" },
  { key: "facebook", label: "فيسبوك" },
  { key: "youtube", label: "يوتيوب" },
];

export function SiteFooter({ settings = DEFAULT_SETTINGS }: { settings?: SiteSettings }) {
  const year = new Date().getFullYear();
  const { contact, footer, shipping } = settings;
  const whatsappHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    "مرحباً AURA 👋 أرغب في الاستفسار عن منتجاتكم.",
  )}`;
  const socialLinks = SOCIAL_LABELS.filter(({ key }) => settings.social[key].length > 0);

  return (
    <footer className="mt-auto border-t border-ink-800 bg-ink-950 text-sand-100">
      <div className="shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-lg font-semibold tracking-brand text-white">AURA</p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-ink-300">{footer.tagline}</p>
          <p className="mt-6 text-xs text-ink-400">
            الأسعار تشمل ضريبة القيمة المضافة {shipping.vatRatePercent}٪ — العملة: ر.س
          </p>
        </div>

        <nav aria-label="روابط التسوق">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">تسوّق</h2>
          <ul className="mt-4 space-y-3">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-sand-100 transition-colors hover:text-accent-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="روابط المساعدة">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">المساعدة</h2>
          <ul className="mt-4 space-y-3">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-sand-100 transition-colors hover:text-accent-300">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sand-100 transition-colors hover:text-accent-300"
              >
                تواصل معنا
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">تواصل</h2>
          <ul className="mt-4 space-y-3 text-sm text-sand-100">
            <li>
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent-300">
                {contact.email}
              </a>
            </li>
            <li dir="ltr" className="text-start">
              <a href={`tel:+${contact.whatsapp}`} className="transition-colors hover:text-accent-300">
                {contact.phoneDisplay}
              </a>
            </li>
            <li className="text-ink-400">{contact.address}</li>
          </ul>

          {socialLinks.length > 0 && (
            <ul aria-label="حسابات التواصل الاجتماعي" className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map(({ key, label }) => (
                <li key={key}>
                  <a
                    href={settings.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-ink-700 px-3 py-1 text-[11px] text-ink-300 transition-colors hover:border-accent-300 hover:text-accent-300"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-6 flex gap-4">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-xs text-ink-400 underline-offset-4 hover:text-sand-100 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800/80">
        {/* مساحة سفلية إضافية حتى لا يغطي زر واتساب العائم النص على الجوال */}
        <div className="shell flex flex-col items-center justify-between gap-3 pb-20 pt-6 text-xs text-ink-400 sm:flex-row sm:py-6">
          <p>© {year} AURA. جميع الحقوق محفوظة.</p>
          <p>{footer.paymentNote}</p>
        </div>
      </div>
    </footer>
  );
}
