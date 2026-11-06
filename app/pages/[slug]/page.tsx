import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * صفحات المعلومات التي يشير إليها الهيدر والفوتر.
 * تُبنى من مصدر واحد حتى لا يبقى أي رابط داخلي يشير إلى صفحة غير موجودة (404).
 */

type InfoPage = {
  title: string;
  intro: string;
  sections: Array<{ id?: string; heading: string; body: string }>;
};

const INFO_PAGES: Record<string, InfoPage> = {
  about: {
    title: "قصتنا",
    intro:
      "AURA براند سعودي يقدّم نظارات شمسية وأزياء بتصميم هادئ وتفاصيل جريئة — قطع مختارة بعناية، ومصنوعة لتدوم.",
    sections: [
      {
        heading: "الفكرة",
        body: "بدأنا من سؤال واحد: لماذا تكون القطعة الجميلة معقّدة؟ لذلك نبني مجموعة صغيرة ومختارة، نركّز فيها على الخامة والقصّة والتفاصيل التي تُلمس لا التي تُروى فقط.",
      },
      {
        heading: "الجودة",
        body: "عدسات تحجب ١٠٠٪ من الأشعة فوق البنفسجية في كل موديل، وأقمشة تتحمّل الاستخدام اليومي والغسيل المتكرر. كل قطعة تُفحص قبل التغليف.",
      },
      {
        heading: "التغليف",
        body: "علبة صلبة للنظارات مع قماشة تنظيف، وتغليف ورقي بسيط للأزياء — بلا بلاستيك غير ضروري.",
      },
    ],
  },
  "shipping-returns": {
    title: "الشحن والاستبدال",
    intro:
      "نشحن لكل مدن المملكة العربية السعودية. التوصيل خلال ٢–٤ أيام عمل، والدفع عند الاستلام متاح.",
    sections: [
      {
        heading: "تكلفة الشحن",
        body: "رسوم ثابتة ٢٥ ر.س للطلبات الأقل من ٣٠٠ ر.س، والشحن مجاني تماماً للطلبات التي تبلغ ٣٠٠ ر.س أو أكثر. الأسعار شاملة ضريبة القيمة المضافة ١٥٪.",
      },
      {
        id: "returns",
        heading: "سياسة الإرجاع (١٤ يوماً)",
        body: "يمكنك طلب الإرجاع أو الاستبدال خلال ١٤ يوماً من استلام الطلب، بشرط أن تكون القطعة بحالتها الأصلية مع علبتها وبطاقتها. تواصل معنا عبر واتساب وسنرتّب عملية الاستلام.",
      },
      {
        heading: "المنتجات غير القابلة للإرجاع",
        body: "لا يمكن إرجاع القطع التي تظهر عليها آثار استخدام أو تلف، أو التي أُزيلت بطاقتها الأصلية.",
      },
    ],
  },
  privacy: {
    title: "سياسة الخصوصية",
    intro:
      "نحتفظ بالحد الأدنى من بياناتك اللازمة لإتمام الطلب والتواصل معك، ولا نبيعها لأي جهة.",
    sections: [
      {
        heading: "البيانات التي نجمعها",
        body: "الاسم، رقم الجوال، البريد الإلكتروني، وعنوان التوصيل — لإتمام الطلب والتوصيل. وكلمة المرور تُحفظ مشفّرة ولا يمكن لأي أحد قراءتها.",
      },
      {
        heading: "كيف نستخدم البيانات",
        body: "لتنفيذ الطلبات، وإرسال تحديثات الطلب، والرد على استفساراتك. لا نستخدمها في تسويق غير موافق عليه.",
      },
      {
        heading: "حقوقك",
        body: "يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذف حسابك بمراسلتنا على hello@aura.sa.",
      },
    ],
  },
  terms: {
    title: "الشروط والأحكام",
    intro:
      "باستخدامك متجر AURA فإنك توافق على الشروط التالية. الأسعار معروضة بالريال السعودي وشاملة ضريبة القيمة المضافة ١٥٪.",
    sections: [
      {
        heading: "الطلبات",
        body: "يُعد الطلب مؤكداً بعد نجاح إنشائه في النظام. نحتفظ بحق إلغاء أي طلب في حال عدم توفر المخزون، مع إبلاغك وإعادة أي مبالغ مدفوعة.",
      },
      {
        heading: "الدفع",
        body: "الطريقة المتاحة حالياً هي الدفع عند الاستلام (COD). نعمل على إضافة بوابات الدفع الإلكتروني قريباً.",
      },
      {
        heading: "المسؤولية",
        body: "نحرص على دقة أوصاف المنتجات وألوانها، وقد تختلف درجات الألوان قليلاً بسبب اختلاف الشاشات.",
      },
    ],
  },
};

type InfoPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(INFO_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = INFO_PAGES[slug];
  if (!page) return { title: "الصفحة غير موجودة" };
  return { title: page.title, description: page.intro };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;
  const page = INFO_PAGES[slug];

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
            <p className="mt-3 text-sm leading-8 text-ink-600">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
