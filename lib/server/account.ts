import { hashPassword, isPasswordAcceptable, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/**
 * تغيير كلمة مرور المستخدم الحالي.
 *
 * يتطلّب كلمة المرور الحالية حتى لو كانت الجلسة مسروقة لا تكفي لتغيير الكلمة،
 * ويُرفض تكرار الكلمة نفسها حتى لا يبدو التغيير ناجحاً بلا أثر فعلي.
 * الكلمة الجديدة تُجزَّأ بـ bcrypt قبل الحفظ ولا تُسجَّل في أي مكان.
 */
export async function changeOwnPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { id: input.userId, isActive: true, deletedAt: null },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    throw new AppError("UNAUTHORIZED", "الجلسة غير صالحة أو الحساب موقوف.", 401);
  }

  if (!user.passwordHash) {
    throw new AppError(
      "VALIDATION_ERROR",
      "هذا الحساب لا يستخدم كلمة مرور. تواصل مع المالك لضبط واحدة له.",
      400,
    );
  }

  const currentIsValid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!currentIsValid) {
    throw new AppError("VALIDATION_ERROR", "كلمة المرور الحالية غير صحيحة.", 400, {
      currentPassword: "كلمة المرور الحالية غير صحيحة.",
    });
  }

  if (!isPasswordAcceptable(input.newPassword)) {
    throw new AppError("VALIDATION_ERROR", "كلمة المرور الجديدة غير مقبولة.", 400, {
      newPassword: "استخدم من ٨ إلى ٧٢ حرفاً على الأقل.",
    });
  }

  if (input.newPassword === input.currentPassword) {
    throw new AppError("VALIDATION_ERROR", "كلمة المرور الجديدة مطابقة للحالية.", 400, {
      newPassword: "اختر كلمة مرور مختلفة عن الحالية.",
    });
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
}
