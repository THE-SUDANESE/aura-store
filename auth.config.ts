import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * الإعداد المشترك بين الـ middleware (Edge) وخادم Node.
 * ممنوع هنا أي استيراد لـ Prisma أو bcrypt: الـ middleware يعمل على Edge runtime
 * ولا يستطيع تشغيل تلك المكتبات.
 *
 * الأدوار الإدارية المسموح لها بالوصول إلى /api/admin/*
 */
export const ADMIN_ROLES: readonly UserRole[] = ["owner", "store_admin"];

/**
 * كل قيم enum UserRole في prisma/schema.prisma.
 * مكرّرة هنا عن قصد: هذا الملف يُستورد في Edge حيث لا يمكن تحميل Prisma.
 * عند إضافة دور جديد في المخطط أضفه هنا أيضاً.
 */
const USER_ROLES = [
  "customer",
  "catalog_manager",
  "store_admin",
  "owner",
] as const satisfies readonly UserRole[];

/** تضييق آمن لأي قيمة قادمة من التوكن إلى UserRole. */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

/** هل هذه القيمة دور إداري (owner أو store_admin)؟ */
export function isAdminRole(value: unknown): value is UserRole {
  return isUserRole(value) && ADMIN_ROLES.includes(value);
}

export const authConfig = {
  // في هذه النسخة لا نملك صفحة واجهة، لكن مسار الدخول محدد للاستخدام لاحقاً
  pages: { signIn: "/auth/login" },

  session: {
    // JWT: الجلسة تُقرأ من الكوكي المُوقّع بلا استعلام قاعدة بيانات في كل طلب
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 أيام
    updateAge: 60 * 60 * 24, // يُعاد إصدار التوكن مرة يومياً
  },

  // مطلوب عند التشغيل خلف وكيل عكسي موثوق (Vercel / Nginx)
  trustHost: true,

  // يُستبدل في auth.ts بمزوّد Credentials (الذي يحتاج Node)
  providers: [],

  callbacks: {
    /**
     * يُنفَّذ عند إنشاء الجلسة وعند تحديثها.
     * ننسخ id و role إلى التوكن حتى لا نحتاج استعلاماً لكل طلب.
     *
     * ملاحظة أنواع: واجهة JWT في Auth.js v5 مفتوحة (Record<string, unknown>)،
     * ولذلك تظهر قيمها هنا كـ unknown حتى مع توسيع الأنواع في types/next-auth.d.ts.
     * نتحقق من النوع وقت التشغيل بدل الاعتماد على التحويل الأعمى.
     */
    async jwt({ token, user }) {
      if (user) {
        if (typeof user.id === "string") token.id = user.id;
        if (isUserRole(user.role)) token.role = user.role;
      }
      return token;
    },

    /** نقل الحقول من التوكن إلى كائن الجلسة المتاح للخادم والواجهة. */
    async session({ session, token }) {
      if (!session.user) return session;

      // token.sub هو معرّف المستخدم القياسي في JWT؛ نستخدمه كخطة بديلة
      const userId =
        typeof token.id === "string"
          ? token.id
          : typeof token.sub === "string"
            ? token.sub
            : null;

      if (userId) {
        session.user.id = userId;
      }

      if (isUserRole(token.role)) {
        session.user.role = token.role;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
