import { PrismaClient } from "@prisma/client";

/**
 * عميل Prisma واحد لكل عملية تشغيل.
 * في بيئة التطوير يعيد Next.js تحميل الوحدات، فبدون هذا التجنّب
 * تُفتح اتصالات جديدة مع كل Hot Reload حتى تُستهلك حدود قاعدة البيانات.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
