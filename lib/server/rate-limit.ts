import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/**
 * حد معدل موزّع على جدول rate_limits.
 *
 * لماذا قاعدة البيانات وليس الذاكرة؟ Vercel يشغّل عدة نسخ بلا حالة مشتركة،
 * وعدّاد في الذاكرة يسمح بمضاعفة الحدود مع كل نسخة (وبإعادة التشغيل يصفر).
 * صف واحد لكل مفتاح (IP/إجراء) ونافذة زمنية ثابتة، والزيادة ذرّية في SQL
 * حتى لا يفلت طلبان متزامنان.
 */

export async function enforceRateLimit(input: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<void> {
  const key = input.key.slice(0, 190);
  const windowSeconds = Math.max(1, Math.trunc(input.windowSeconds));

  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO rate_limits (key, window_start, count, updated_at)
    VALUES (${key}, now(), 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN now()
        ELSE rate_limits.window_start
      END,
      updated_at = now()
    RETURNING count
  `;

  const count = Number(rows[0]?.count ?? 1);
  if (count > input.limit) {
    throw new AppError(
      "RATE_LIMITED",
      "عدد المحاولات كبير — يرجى الانتظار قليلاً ثم المحاولة مجدداً.",
      429,
    );
  }
}

/** عنوان العميل: أول عنوان في x-forwarded-for (Vercel)، وإلا ترويسة المنصة. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
