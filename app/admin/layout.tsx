import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/roles";

/**
 * حماية واحدة لكل صفحات /admin (كل الصفحات الفرعية ترثها).
 * الطبقة الأولى في middleware تغطي /api/admin فقط، لذلك هذا الحاجز ضروري
 * لصفحات الواجهة، وكل صفحة تحتفظ بفحصها الداخلي كطبقة ثانية.
 */
export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?redirect=/admin");

  try {
    await requireAdmin();
  } catch {
    return (
      <div className="shell py-24 text-center">
        <h1 className="font-display text-2xl text-ink-900">لا تملك صلاحية الوصول</h1>
        <p className="mt-3 text-sm text-ink-500">
          هذه المنطقة مخصّصة لمالك المتجر أو مدير المتجر فقط.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-accent-700 underline underline-offset-4"
        >
          العودة إلى المتجر
        </Link>
      </div>
    );
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
