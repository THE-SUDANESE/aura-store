import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/auth.config";
import { AppError } from "@/lib/http";
import { requireOwner } from "@/lib/auth/roles";
import {
  listUsersForAdmin,
  setUserActive,
  updateUserRole,
  USER_ROLE_LABELS,
} from "@/lib/server/users-admin";

export const metadata: Metadata = {
  title: "المستخدمون",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function changeRole(formData: FormData) {
  "use server";
  const owner = await requireOwner().catch(() => redirect("/auth/login?redirect=/admin/users"));
  const userId = String(formData.get("userId") ?? "");

  try {
    await updateUserRole({ userId, role: formData.get("role"), actorId: owner.id });
  } catch (error) {
    redirect(
      `/admin/users?error=${encodeURIComponent(
        error instanceof AppError ? error.message : "تعذّر تحديث الدور.",
      )}`,
    );
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

async function toggleActive(formData: FormData) {
  "use server";
  const owner = await requireOwner().catch(() => redirect("/auth/login?redirect=/admin/users"));
  const userId = String(formData.get("userId") ?? "");

  try {
    await setUserActive({
      userId,
      isActive: formData.get("isActive") === "true",
      actorId: owner.id,
    });
  } catch (error) {
    redirect(
      `/admin/users?error=${encodeURIComponent(
        error instanceof AppError ? error.message : "تعذّر تحديث حالة الحساب.",
      )}`,
    );
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

const selectCls =
  "h-9 rounded-lg border border-ink-200 bg-white px-2 text-xs outline-none focus:border-ink-900";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [query, session] = await Promise.all([searchParams, auth()]);

  let isOwner = false;
  try {
    await requireOwner();
    isOwner = true;
  } catch {
    isOwner = false;
  }

  if (!isOwner) {
    const isAdmin = Boolean(
      session?.user?.role && (ADMIN_ROLES as readonly string[]).includes(session.user.role),
    );

    return (
      <div className="shell py-16 text-center">
        <h1 className="font-display text-2xl text-ink-900">
          {isAdmin ? "إدارة المستخدمين للمالك فقط" : "لا تملك صلاحية الوصول"}
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          تغيير الأدوار وإيقاف الحسابات متاح لحساب المالك فقط.
        </p>
        <Link href="/admin" className="mt-6 inline-block text-sm text-accent-700 underline underline-offset-4">
          العودة إلى لوحة التحكم
        </Link>
      </div>
    );
  }

  const users = await listUsersForAdmin();
  const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { dateStyle: "medium" });

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">المستخدمون</h1>
        <p className="mt-2 text-xs text-ink-500">
          الأدوار: عميل، مشرف محتوى، مدير متجر، مالك. لا يمكنك تعديل حسابك الحالي.
        </p>
      </header>

      {(query.saved || query.error) && (
        <p
          role={query.error ? "alert" : "status"}
          className={
            query.error
              ? "mt-5 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-xs text-warning-700"
              : "mt-5 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800"
          }
        >
          {query.error ?? "تم التحديث."}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-ink-100 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sand-50 text-[11px] uppercase tracking-wider text-ink-500">
              <th scope="col" className="px-4 py-3 text-start font-medium">المستخدم</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الطلبات</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الانضمام</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الدور</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = session?.user?.id === user.id;
              return (
                <tr key={user.id} className="border-t border-ink-100 align-top">
                  <td className="px-4 py-4">
                    <p className="text-xs font-medium text-ink-900">{user.name}</p>
                    <p dir="ltr" className="mt-1 text-[11px] text-ink-400">{user.email}</p>
                    {user.phone && <p dir="ltr" className="mt-0.5 text-[11px] text-ink-400">{user.phone}</p>}
                    {isSelf && <p className="mt-1 text-[10px] text-accent-700">حسابك</p>}
                  </td>
                  <td className="px-4 py-4 text-xs text-ink-600">{user.ordersCount}</td>
                  <td className="px-4 py-4 text-[11px] text-ink-500">
                    {dateFormatter.format(new Date(user.createdAt))}
                  </td>
                  <td className="px-4 py-4">
                    {isSelf ? (
                      <span className="text-xs text-ink-500">{USER_ROLE_LABELS[user.role]}</span>
                    ) : (
                      <form action={changeRole} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select name="role" defaultValue={user.role} className={selectCls}>
                          {(Object.keys(USER_ROLE_LABELS) as Array<keyof typeof USER_ROLE_LABELS>).map(
                            (role) => (
                              <option key={role} value={role}>
                                {USER_ROLE_LABELS[role]}
                              </option>
                            ),
                          )}
                        </select>
                        <Button type="submit" size="sm" variant="outline">حفظ</Button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-2">
                      <span
                        className={
                          user.isActive
                            ? "rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] text-accent-800"
                            : "rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] text-ink-500"
                        }
                      >
                        {user.isActive ? "نشط" : "موقوف"}
                      </span>
                      {!isSelf && (
                        <form action={toggleActive}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="isActive" value={user.isActive ? "false" : "true"} />
                          <Button type="submit" size="sm" variant="outline">
                            {user.isActive ? "إيقاف" : "تفعيل"}
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
