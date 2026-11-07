import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "إعدادات الموقع",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">إعدادات الموقع</h1>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-ink-500">
          كل ما تحفظه هنا يظهر في المتجر فوراً بلا تعديل كود ولا نشر — الشريط العلوي، البانر
          الرئيسي، بيانات التواصل، قواعد الشحن والضريبة، ونصوص الفوتر.
        </p>
      </header>

      <SettingsForm initial={settings} />
    </div>
  );
}
