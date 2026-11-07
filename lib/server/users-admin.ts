import type { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/** إدارة مستخدمي المتجر وأدوارهم — لمالك المتجر فقط (فحص الدور في الصفحة والإجراء). */

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: "عميل",
  catalog_manager: "مشرف محتوى",
  store_admin: "مدير متجر",
  owner: "مالك",
};

const ROLES: UserRole[] = ["customer", "catalog_manager", "store_admin", "owner"];

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  ordersCount: number;
};

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    take: 300,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      _count: { select: { orders: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.fullName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    ordersCount: user._count.orders,
  }));
}

export async function updateUserRole(input: {
  userId: string;
  role: unknown;
  actorId: string;
}): Promise<void> {
  if (input.userId === input.actorId) {
    throw new AppError("VALIDATION_ERROR", "لا يمكنك تغيير دور حسابك الحالي.", 400);
  }

  if (typeof input.role !== "string" || !ROLES.includes(input.role as UserRole)) {
    throw new AppError("VALIDATION_ERROR", "الدور غير صالح.", 400);
  }

  const role = input.role as UserRole;
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true },
  });

  if (!user) throw new AppError("NOT_FOUND", "المستخدم غير موجود.", 404);

  if (user.role === "owner" && role !== "owner") {
    const owners = await prisma.user.count({
      where: { role: "owner", isActive: true, deletedAt: null },
    });
    if (owners <= 1) {
      throw new AppError("VALIDATION_ERROR", "لا يمكن ترك المتجر بلا مالك — أضف مالكاً آخر أولاً.", 400);
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { role } });
  revalidatePath("/admin/users");
}

export async function setUserActive(input: {
  userId: string;
  isActive: boolean;
  actorId: string;
}): Promise<void> {
  if (input.userId === input.actorId) {
    throw new AppError("VALIDATION_ERROR", "لا يمكنك إيقاف حسابك الحالي.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) throw new AppError("NOT_FOUND", "المستخدم غير موجود.", 404);

  if (!input.isActive && user.role === "owner") {
    const owners = await prisma.user.count({
      where: { role: "owner", isActive: true, deletedAt: null },
    });
    if (owners <= 1) {
      throw new AppError("VALIDATION_ERROR", "لا يمكن إيقاف آخر مالك للمتجر.", 400);
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { isActive: input.isActive } });
  revalidatePath("/admin/users");
}
