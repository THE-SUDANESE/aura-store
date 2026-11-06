import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { prisma } from "@/lib/db";
import { formatNumber, formatSAR } from "@/lib/format";

export const metadata: Metadata = {
  title: "حسابي",
  description: "بيانات حسابك وسجل طلباتك في متجر AURA.",
};

// بيانات الحساب والطلبات تتغيّر: لا نُجمّد الصفحة
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  // حماية مزدوجة: الـ middleware يحوّل الزائر، وهذا احتياط داخل الصفحة نفسها
  if (!session?.user?.id) redirect("/auth/login?redirect=/account");

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, isActive: true, deletedAt: null },
    select: {
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      orders: {
        orderBy: { placedAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          placedAt: true,
        },
      },
    },
  });

  if (!user) redirect("/auth/login?redirect=/account");

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">AURA Account</p>
          <h1 className="mt-3 font-display text-3xl text-ink-900">حسابي</h1>
          <p className="mt-2 text-sm text-ink-500">{user.email}</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline" size="md">
            تسجيل الخروج
          </Button>
        </form>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-start">
        {/* بيانات الحساب */}
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-900">البيانات الشخصية</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-ink-500">الاسم</dt>
              <dd className="mt-1 text-ink-900">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">البريد الإلكتروني</dt>
              <dd className="mt-1 text-ink-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">رقم الجوال</dt>
              <dd className="mt-1 text-ink-900" dir="ltr">
                {user.phone ?? "—"}
              </dd>
            </div>
          </dl>

          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-ink-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-800"
          >
            متابعة التسوّق
          </Link>
        </section>

        {/* سجل الطلبات */}
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink-900">سجل الطلبات</h2>
            <span className="text-xs text-ink-500">{formatNumber(user.orders.length)} طلب</span>
          </div>

          {user.orders.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">لا توجد طلبات بعد. أول طلب لك سيظهر هنا.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {user.orders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink-900" dir="ltr">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(order.placedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-sand-50 px-3 py-1 text-[11px] text-ink-700">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-sm font-semibold text-ink-900">
                      {formatSAR(Number(order.grandTotal))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
