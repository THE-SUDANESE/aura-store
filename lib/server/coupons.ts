import type { CouponType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/**
 * كوبونات الخصم — مصدر واحد للحقيقة.
 *
 * التحقق يتم على الخادم دائماً وبعد حساب المجموع الفرعي من أسعار قاعدة البيانات،
 * ثم يُستهلك الكود ذرّياً داخل نفس Transaction التي تنشئ الطلب: لا يمكن أن
 * يتجاوز عدد الاستخدامات الحد حتى لو أرسل عميلان الطلب في نفس اللحظة.
 */

const CODE_RE = /^[A-Z0-9_-]{3,32}$/;

export function normalizeCouponCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toUpperCase() : "";
}

type CouponForEvaluation = {
  code: string;
  type: CouponType;
  value: Prisma.Decimal | number;
  minSubtotal: Prisma.Decimal | number;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
};

const codeError = (message: string): AppError =>
  new AppError("VALIDATION_ERROR", message, 400, { discountCode: message });

/** يحسب مبلغ الخصم بالهللات أو يرمي خطأ مفهوماً للعميل. */
export function evaluateCoupon(coupon: CouponForEvaluation, subtotalCents: number): number {
  const now = new Date();

  if (!coupon.isActive) throw codeError("كود الخصم غير متاح حالياً.");
  if (coupon.startsAt && coupon.startsAt > now) throw codeError("لم يبدأ سريان كود الخصم بعد.");
  if (coupon.expiresAt && coupon.expiresAt < now) throw codeError("انتهت صلاحية كود الخصم.");
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw codeError("تم استهلاك كود الخصم بالكامل.");
  }

  const minCents = Math.round(Number(coupon.minSubtotal) * 100);
  if (subtotalCents < minCents) {
    throw codeError(
      `هذا الكود يتطلب حداً أدنى للطلب بقيمة ${(minCents / 100).toLocaleString("en-US")} ر.س.`,
    );
  }

  const value = Number(coupon.value);
  const rawDiscount = coupon.type === "percent" ? (subtotalCents * value) / 100 : value * 100;

  return Math.min(Math.max(Math.round(rawDiscount), 1), subtotalCents);
}

/** قراءة الكود داخل Transaction الطلب (نفس القارئ الذي سيستهلكه). */
export async function resolveCoupon(
  client: Prisma.TransactionClient,
  rawCode: string,
  subtotalCents: number,
): Promise<{ code: string; discountCents: number }> {
  const code = normalizeCouponCode(rawCode);
  if (!CODE_RE.test(code)) throw codeError("كود الخصم غير صحيح.");

  const coupon = await client.coupon.findUnique({ where: { code } });
  if (!coupon) throw codeError("كود الخصم غير صحيح.");

  return { code: coupon.code, discountCents: evaluateCoupon(coupon, subtotalCents) };
}

/**
 * استهلاك الكود ذرّياً. يعيد الخطأ نفسه إن كان قد استُنفد بين القراءة والكتابة.
 */
export async function redeemCoupon(client: Prisma.TransactionClient, code: string): Promise<void> {
  const rows = await client.$queryRaw<Array<{ id: string }>>`
    UPDATE coupons
    SET used_count = used_count + 1, updated_at = now()
    WHERE code = ${code}
      AND is_active = true
      AND (max_uses IS NULL OR used_count < max_uses)
    RETURNING id
  `;

  if (rows.length !== 1) throw codeError("تم استهلاك كود الخصم بالكامل.");
}

/* ------------------------------ إدارة اللوحة ------------------------------ */

export type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

export type CouponInput = {
  code: string;
  description?: string | null;
  type: string;
  value: number;
  minSubtotal?: number;
  maxUses?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

const toDto = (coupon: {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: Prisma.Decimal;
  minSubtotal: Prisma.Decimal;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}): AdminCoupon => ({
  id: coupon.id,
  code: coupon.code,
  description: coupon.description,
  type: coupon.type,
  value: Number(coupon.value),
  minSubtotal: Number(coupon.minSubtotal),
  maxUses: coupon.maxUses,
  usedCount: coupon.usedCount,
  startsAt: coupon.startsAt?.toISOString() ?? null,
  expiresAt: coupon.expiresAt?.toISOString() ?? null,
  isActive: coupon.isActive,
});

export async function listCoupons(): Promise<AdminCoupon[]> {
  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return coupons.map(toDto);
}

function parseDate(value: unknown, field: string): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new AppError("VALIDATION_ERROR", "تاريخ غير صالح.", 400, { [field]: "تاريخ غير صالح." });
  }
  return date;
}

function validateInput(input: CouponInput) {
  const fields: Record<string, string> = {};

  const code = normalizeCouponCode(input.code);
  if (!CODE_RE.test(code)) {
    fields.code = "الكود ٣ إلى ٣٢ حرفاً: A-Z وأرقام و - أو _ فقط.";
  }

  if (input.type !== "percent" && input.type !== "fixed") {
    fields.type = "اختر نوع الخصم.";
  }

  const value = Number(input.value);
  if (!Number.isFinite(value) || value <= 0) {
    fields.value = "قيمة الخصم يجب أن تكون أكبر من صفر.";
  } else if (input.type === "percent" && value > 100) {
    fields.value = "النسبة لا تتجاوز ١٠٠٪.";
  } else if (input.type === "fixed" && value > 100000) {
    fields.value = "المبلغ كبير جداً.";
  }

  const minSubtotal = Number(input.minSubtotal ?? 0);
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
    fields.minSubtotal = "الحد الأدنى غير صالح.";
  }

  const maxUses = input.maxUses === null || input.maxUses === undefined ? null : Number(input.maxUses);
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    fields.maxUses = "عدد الاستخدامات يجب أن يكون ١ أو أكثر (أو اتركه فارغاً بلا حد).";
  }

  const startsAt = parseDate(input.startsAt, "startsAt");
  const expiresAt = parseDate(input.expiresAt, "expiresAt");
  if (startsAt && expiresAt && expiresAt <= startsAt) {
    fields.expiresAt = "تاريخ الانتهاء يجب أن يكون بعد البداية.";
  }

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "يرجى تصحيح الحقول المحددة.", 400, fields);
  }

  return {
    code,
    description: typeof input.description === "string" ? input.description.trim().slice(0, 200) || null : null,
    type: input.type as CouponType,
    value,
    minSubtotal,
    maxUses,
    startsAt,
    expiresAt,
    isActive: input.isActive !== false,
  };
}

export async function createCoupon(input: CouponInput): Promise<AdminCoupon> {
  const data = validateInput(input);

  const existing = await prisma.coupon.findUnique({ where: { code: data.code }, select: { id: true } });
  if (existing) {
    throw new AppError("VALIDATION_ERROR", "هذا الكود موجود مسبقاً.", 400, {
      code: "هذا الكود موجود مسبقاً.",
    });
  }

  const coupon = await prisma.coupon.create({ data });
  revalidatePath("/admin/coupons");
  return toDto(coupon);
}

export async function updateCoupon(
  id: string,
  input: Partial<Pick<CouponInput, "isActive" | "maxUses" | "expiresAt" | "description">>,
): Promise<AdminCoupon> {
  const data: Prisma.CouponUpdateInput = {};

  if (input.isActive !== undefined) data.isActive = Boolean(input.isActive);
  if (input.maxUses !== undefined) {
    if (input.maxUses === null) data.maxUses = null;
    else {
      const maxUses = Number(input.maxUses);
      if (!Number.isInteger(maxUses) || maxUses < 1) {
        throw new AppError("VALIDATION_ERROR", "عدد الاستخدامات غير صالح.", 400, {
          maxUses: "عدد الاستخدامات يجب أن يكون ١ أو أكثر.",
        });
      }
      data.maxUses = maxUses;
    }
  }
  if (input.expiresAt !== undefined) data.expiresAt = parseDate(input.expiresAt, "expiresAt");
  if (input.description !== undefined) {
    data.description = typeof input.description === "string" ? input.description.trim().slice(0, 200) || null : null;
  }

  const coupon = await prisma.coupon
    .update({ where: { id }, data })
    .catch(() => {
      throw new AppError("NOT_FOUND", "الكوبون غير موجود.", 404);
    });

  revalidatePath("/admin/coupons");
  return toDto(coupon);
}

export async function deleteCoupon(id: string): Promise<void> {
  await prisma.coupon.delete({ where: { id } }).catch(() => {
    throw new AppError("NOT_FOUND", "الكوبون غير موجود.", 404);
  });

  revalidatePath("/admin/coupons");
}
