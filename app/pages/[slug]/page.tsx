import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInfoPage } from "@/lib/server/settings";

/**
 * صفحات المعلومات (قصتنا، الشحن والإرجاع، الخصوصية، الشروط).
 * محتواها في جدول pages ويُحرَّر من /admin/pages — بلا تعديل كود ولا نشر.
 */

type InfoPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getInfoPage(slug);
  if (!page) return { title: "الصفحة غير موجودة" };
  return { title: page.title, description: page.intro };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;
  const page = await getInfoPage(slug);

  if (!page) notFound();

  return (
    <div className="shell py-10 lg:py-14">
      <header className="border-b border-ink-100 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-700">AURA</p>
        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-ink-600">{page.intro}</p>
      </header>

      <div className="mt-10 max-w-2xl space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading} id={section.id} className="scroll-mt-24">
            <h2 className="text-base font-semibold text-ink-900">{section.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-8 text-ink-600">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
