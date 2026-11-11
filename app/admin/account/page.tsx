import type { Metadata } from "next";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/auth/roles";
import { USER_ROLE_LABELS } from "@/lib/server/users-admin";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const metadata: Metadata = {
  title: "الحساب وكلمة المرور",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  // الطبقة الثانية بعد حماية /admin في الـ layout — تمنع القراءة حتى بالخطأ
  const [admin, session] = await Promise.all([requireAdmin(), auth()]);

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">الحساب وكلمة المرور</h1>
        <p className="mt-2 text-xs text-ink-500">
          البريد: <span dir="ltr">{admin.email}</span> — الصلاحية: {USER_ROLE_LABELS[admin.role]}.
        </p>
      </header>

      <PasswordForm />

      <p className="mt-6 max-w-lg text-[11px] leading-6 text-ink-400">
        بعد التغيير تبقى جلستك الحالية مفتوحة على هذا المتصفح؛ أي دخول جديد يستخدم الكلمة الجديدة.
        إن نسيت الكلمة لاحقاً فلا توجد صفحة استعادة بريدية — يحتفظ المالك أو مدير المتجر بالقدرة
        على إعادة تعيينها من قاعدة البيانات.
      </p>
    </div>
  );
}
