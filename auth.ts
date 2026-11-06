import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { authConfig } from "./auth.config";

/**
 * إعداد Auth.js v5 الكامل — يعمل على Node runtime فقط (Prisma + bcrypt).
 * الملفات القابلة للاستيراد من الـ middleware هي auth.config.ts وحدها.
 */

/**
 * حساب وهمي يُقارَن به عند عدم وجود المستخدم، حتى يبقى زمن الاستجابة
 * متقارباً ولا نكشف أي بريد مسجّل عبر فرق التوقيت (user enumeration).
 */
let dummyHashPromise: Promise<string> | null = null;

async function burnVerificationTime(password: string): Promise<void> {
  dummyHashPromise ??= hashPassword("aura-dummy-password-not-used");
  await verifyPassword(password, await dummyHashPromise);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },

      async authorize(rawCredentials) {
        const email =
          typeof rawCredentials?.email === "string"
            ? rawCredentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof rawCredentials?.password === "string" ? rawCredentials.password : "";

        if (!email || !password) return null;

        // القيد users_email_lowercase في قاعدة البيانات يضمن تخزين البريد بحروف صغيرة
        const user = await prisma.user.findFirst({
          where: { email, isActive: true, deletedAt: null },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            passwordHash: true,
          },
        });

        // مستخدم غير موجود أو مسجّل اجتماعياً فقط: نُنفّذ مقارنة وهمية ثم نفشل
        if (!user || !user.passwordHash) {
          await burnVerificationTime(password);
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        // تسجيل وقت آخر دخول لا يجب أن يُفشل المصادقة نفسها
        await prisma.user
          .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          .catch((error) => {
            console.error(
              JSON.stringify({ level: "warn", action: "lastLoginAt.update", userId: user.id, message: String(error) }),
            );
          });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
});
