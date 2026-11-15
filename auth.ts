import { createHash } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { authConfig } from "./auth.config";

/**
 * إعداد Auth.js v5 الكامل — يعمل على Node runtime فقط (Prisma + bcrypt).
 * الملفات القابلة للاستيراد من الـ middleware هي auth.config.ts وحدها.
 */

/**
 * حساب وهمي يُقارَن به عند عدم وجود المستخدم، حتى يبقى زمن الاستجابة
 * متقارباً ولا نكشف أي بريد مسجّل عبر فرق التوقيت (user enumeration).
 */
/**
 * حدّ محاولات الدخول: ١٠ محاولات كل ٥ دقائق لكل بريد.
 * العدّاد في قاعدة البيانات (لا في ذاكرة النسخة) لأن Vercel يشغّل عدة نسخ.
 * المفتاح يستخدم بصمة البريد لا البريد نفسه حتى لا يُخزَّن بريد العملاء
 * كنص صريح في جدول rate_limits.
 */
const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 5 * 60;

function emailFingerprint(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 16);
}

/** تسجيل نشاط مشبوه بلا بيانات شخصية صريحة (بصمة بريد فقط). */
function logAuthEvent(event: Record<string, unknown>): void {
  console.warn(JSON.stringify({ level: "warn", channel: "auth", ...event }));
}

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

        const fingerprint = emailFingerprint(email);

        try {
          await enforceRateLimit({
            key: `login:${fingerprint}`,
            limit: LOGIN_ATTEMPT_LIMIT,
            windowSeconds: LOGIN_ATTEMPT_WINDOW_SECONDS,
          });
        } catch {
          logAuthEvent({ action: "login.rate_limited", emailHash: fingerprint });
          return null;
        }

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
          logAuthEvent({
            action: "login.failed",
            emailHash: fingerprint,
            reason: user ? "no_password" : "unknown_account",
          });
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          logAuthEvent({ action: "login.failed", emailHash: fingerprint, reason: "bad_password" });
          return null;
        }

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
