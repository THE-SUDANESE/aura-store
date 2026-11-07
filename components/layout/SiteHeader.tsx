"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { selectItemCount, useCartStore } from "@/lib/cart/store";
import { formatNumber } from "@/lib/format";
import { DEFAULT_SETTINGS, type NavLink } from "@/lib/types/settings";

/**
 * روابط التنقل تأتي من إعدادات الموقع، فإضافة قسم جديد لا تحتاج كوداً.
 * المسارات الافتراضية موجودة فعلياً: /shop و/cart و/account و/pages/*
 */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true">
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

const iconButtonClasses =
  "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500";

export function SiteHeader({ nav = DEFAULT_SETTINGS.nav }: { nav?: NavLink[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // السلة تُقرأ من localStorage، فنؤجل عرض العداد حتى يكتمل الترطيب (hydration)
  const [isMounted, setIsMounted] = useState(false);
  const itemCount = useCartStore(selectItemCount);

  useEffect(() => setIsMounted(true), []);

  const visibleItemCount = isMounted ? itemCount : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-sand-50/90 backdrop-blur">
      <div className="shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* الشعار */}
        <Link
          href="/"
          className="flex items-baseline gap-1 text-xl font-semibold tracking-brand text-ink-900"
          aria-label="AURA — الصفحة الرئيسية"
        >
          AURA
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
        </Link>

        {/* التنقل — سطح المكتب */}
        <nav aria-label="التنقل الرئيسي" className="hidden md:flex md:justify-center">
          <ul className="flex items-center gap-7">
            {nav.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-700 underline-offset-8 transition-colors hover:text-ink-900 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* الأدوات */}
        <div className="flex items-center gap-1">
          <Link href="/shop" className={iconButtonClasses} aria-label="تصفّح المتجر">
            <SearchIcon />
          </Link>

          <Link href="/auth/login" className={iconButtonClasses} aria-label="تسجيل الدخول">
            <UserIcon />
          </Link>

          <Link
            href="/cart"
            className={iconButtonClasses}
            aria-label={`سلة المشتريات، ${formatNumber(visibleItemCount)} قطعة`}
          >
            <BagIcon />
            {visibleItemCount > 0 && (
              <span className="absolute -left-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-semibold leading-none text-white">
                {formatNumber(visibleItemCount)}
              </span>
            )}
          </Link>

          {/* زر القائمة — الجوال */}
          <button
            type="button"
            className={`${iconButtonClasses} md:hidden`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <MenuIcon open={isMenuOpen} />
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-ink-100 bg-sand-50 md:hidden">
          <nav aria-label="التنقل على الجوال" className="shell py-2">
            <ul className="flex flex-col">
              {nav.map((link) => (
                <li key={`m-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="block border-b border-ink-100/70 py-3 text-sm text-ink-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cart"
                  className="block border-b border-ink-100/70 py-3 text-sm text-ink-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  سلة المشتريات
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="block py-3 text-sm text-ink-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  حسابي
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
