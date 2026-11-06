import Link from "next/link";

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
  { href: "https://wa.me/966500000000", label: "تواصل معنا" },
] as const;

const LEGAL_LINKS = [
  { href: "/pages/privacy", label: "سياسة الخصوصية" },
  { href: "/pages/terms", label: "الشروط والأحكام" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink-800 bg-ink-950 text-sand-100">
      <div className="shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-lg font-semibold tracking-brand text-white">AURA</p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-ink-300">
            نظارات وأزياء بتصميم هادئ وتفاصيل جريئة. مختارة بعناية، ومصممة لتدوم.
          </p>
          <p className="mt-6 text-xs text-ink-400">
            الأسعار تشمل ضريبة القيمة المضافة ١٥٪ — العملة: ر.س
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
                {link.href.startsWith("/") ? (
                  <Link href={link.href} className="text-sm text-sand-100 transition-colors hover:text-accent-300">
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sand-100 transition-colors hover:text-accent-300"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">تواصل</h2>
          <ul className="mt-4 space-y-3 text-sm text-sand-100">
            <li>
              <a href="mailto:hello@aura.sa" className="transition-colors hover:text-accent-300">
                hello@aura.sa
              </a>
            </li>
            <li dir="ltr" className="text-start">
              <a href="tel:+966500000000" className="transition-colors hover:text-accent-300">
                +966 50 000 0000
              </a>
            </li>
            <li className="text-ink-400">الرياض، المملكة العربية السعودية</li>
          </ul>

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
          <p>الدفع عند الاستلام متاح — بطاقات الدفع قريباً</p>
        </div>
      </div>
    </footer>
  );
}
