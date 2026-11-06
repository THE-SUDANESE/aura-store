import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AURA — نظارات شمسية وأزياء",
    template: "%s | AURA",
  },
  description:
    "AURA — براند نظارات شمسية وأزياء بتصميم هادئ وتفاصيل جريئة. شحن مجاني للطلبات فوق ٣٠٠ ر.س وإرجاع خلال ١٤ يوماً.",
  applicationName: "AURA",
  openGraph: {
    title: "AURA — نظارات شمسية وأزياء",
    description: "نظارات وأزياء بتصميم هادئ وتفاصيل جريئة.",
    locale: "ar_SA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-dvh flex-col font-sans">
        {/* رابط تجاوز التنقل لمستخدمي لوحة المفاتيح وقارئات الشاشة */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          تخطَّ إلى المحتوى
        </a>

        <AnnouncementBar />
        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />
        <WhatsAppButton />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
