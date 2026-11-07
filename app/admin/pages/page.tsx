import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "الصفحات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function sectionsCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    select: { slug: true, title: true, sections: true, isActive: true, sortOrder: true },
  });

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
            AURA Admin
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-900">صفحات المعلومات</h1>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-ink-500">
            قصتنا، الشحن والإرجاع، الخصوصية، الشروط — كل نصوصها هنا. أي تعديل يظهر في المتجر فوراً.
          </p>
        </div>

        <Link
          href="/admin/pages/new"
          className="rounded-full bg-ink-900 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-ink-800"
        >
          + صفحة جديدة
        </Link>
      </header>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-ink-100 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sand-50 text-[11px] uppercase tracking-wider text-ink-500">
              <th scope="col" className="px-4 py-3 text-start font-medium">الصفحة</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الرابط</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الأقسام</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">الحالة</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">تعديل</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-500">
                  لا توجد صفحات بعد — أنشئ واحدة.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.slug} className="border-t border-ink-100">
                  <td className="px-4 py-4 text-xs font-medium text-ink-900">{page.title}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      dir="ltr"
                      className="font-mono text-[11px] text-accent-700 underline underline-offset-4"
                    >
                      /pages/{page.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-xs text-ink-600">
                    {formatNumber(sectionsCount(page.sections))}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    {page.isActive ? (
                      <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-accent-700">منشورة</span>
                    ) : (
                      <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-ink-500">مخفية</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="text-xs text-ink-700 underline underline-offset-4 hover:text-ink-900"
                    >
                      تحرير
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
