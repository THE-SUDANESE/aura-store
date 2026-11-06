import type { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/auth.config";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

/**
 * يعيد المستخدم الحالي أو يرمي 401.
 *
 * لماذا نقرأ الدور من قاعدة البيانات وليس من التوكن فقط؟
 * لأن الجلسة JWT تحمل لقطة من الدور وقت الدخول؛ فلو أُوقف حساب موظف أو
 * خُفِّض دوره فلن يتغيّر التوكن حتى انتهاء صلاحيته أو تحديثه. هذه القراءة
 * تجعل سحب الصلاحية فورياً (ثمنها استعلام واحد على المفتاح الأساسي).
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await auth();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    throw new AppError("UNAUTHORIZED", "يجب تسجيل الدخول للمتابعة.", 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: sessionUserId, isActive: true, deletedAt: null },
    select: { id: true, email: true, fullName: true, role: true },
  });

  if (!user) {
    throw new AppError("UNAUTHORIZED", "الجلسة غير صالحة أو الحساب موقوف.", 401);
  }

  return { id: user.id, email: user.email, name: user.fullName, role: user.role };
}

/** يتحقق من الدور ويعيد المستخدم، أو يرمي 403. */
export async function requireRole(allowed: readonly UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();

  if (!allowed.includes(user.role)) {
    throw new AppError("FORBIDDEN", "لا تملك صلاحية للوصول إلى هذا المورد.", 403);
  }

  return user;
}

/** اختصار: owner أو store_admin (للمشرف على المحتوى لا يستخدمها). */
export function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole(ADMIN_ROLES);
}

/** اختصار: owner فقط (الإعدادات وإدارة مستخدمي الإدارة). */
export function requireOwner(): Promise<AuthenticatedUser> {
  return requireRole(["owner"]);
}
