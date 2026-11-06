import bcrypt from "bcryptjs";

/**
 * تجزئة كلمات المرور بـ bcrypt (نقي JS — لا يحتاج بناء وحدات أصلية).
 * متوافق مع سياسة الأمان في وثيقة المتطلبات (Argon2id أو bcrypt).
 * للتبديل إلى Argon2id لاحقاً يكفي تغيير هذين الدالتين دون لمس بقية الكود.
 */

const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/** حد أدنى بسيط يُطبّق في نقطة تسجيل الحساب قبل التجزئة. */
export function isPasswordAcceptable(password: string): boolean {
  return password.length >= 8 && password.length <= 72;
}
