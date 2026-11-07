import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";
import { prisma } from "@/lib/db";
import type { PageSection } from "@/lib/types/settings";

export const metadata: Metadata = {
  title: "تحرير صفحة",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function sectionsOf(value: unknown): PageSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const heading = typeof record.heading === "string" ? record.heading : "";
    const body = typeof record.body === "string" ? record.body : "";
    if (!heading && !body) return [];
    const id = typeof record.id === "string" ? record.id : undefined;
    return [{ ...(id ? { id } : {}), heading, body }];
  });
}

export default async function AdminPageEditorPage({ params }: Props) {
  const { slug } = await params;
  const isNew = slug === "new";
  const page = isNew ? null : await prisma.page.findUnique({ where: { slug } });

  if (!isNew && !page) notFound();

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">
          AURA Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink-900">
          {isNew ? "صفحة جديدة" : `تحرير: ${page?.title}`}
        </h1>
        <p className="mt-2 text-xs text-ink-500">
          المحتوى يظهر على المسار <span dir="ltr" className="font-mono">/pages/&#123;slug&#125;</span>.
        </p>
      </header>

      <PageEditor
        initial={
          page
            ? {
                slug: page.slug,
                title: page.title,
                intro: page.intro,
                sections: sectionsOf(page.sections),
                isActive: page.isActive,
                sortOrder: page.sortOrder,
              }
            : null
        }
      />
    </div>
  );
}
