-- =====================================================================
--  AURA — إعدادات الموقع وصفحات المحتوى وحد المعدل
--  Migration: 006_settings_pages.sql
--  ملاحظة: مُطبَّقة عبر `prisma db execute` لأن المشروع أُنشئ بـ SQL يدوي
--  و`prisma db push` يرى انحرافاً في أسماء الفهارس.
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "site_settings" (
  "key"        text PRIMARY KEY,
  "value"      jsonb NOT NULL,
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_by" uuid
);

CREATE TABLE IF NOT EXISTS "pages" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug"       text NOT NULL UNIQUE,
  "title"      text NOT NULL,
  "intro"      text NOT NULL,
  "sections"   jsonb NOT NULL DEFAULT '[]'::jsonb,
  "is_active"  boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "rate_limits" (
  "key"          text PRIMARY KEY,
  "window_start" timestamptz(6) NOT NULL,
  "count"        integer NOT NULL DEFAULT 0,
  "updated_at"   timestamptz(6) NOT NULL DEFAULT now()
);

-- ---------- المفاتيح الأجنبية الناقصة (تُضاف فقط إذا لا توجد قيم يتيمة) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_images_variant_id_fkey')
     AND NOT EXISTS (
       SELECT 1 FROM product_images i
       WHERE i.variant_id IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.id = i.variant_id)
     )
  THEN
    ALTER TABLE "product_images"
      ADD CONSTRAINT "product_images_variant_id_fkey"
      FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_order_id_fkey')
     AND NOT EXISTS (
       SELECT 1 FROM reviews r
       WHERE r.order_id IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = r.order_id)
     )
  THEN
    ALTER TABLE "reviews"
      ADD CONSTRAINT "reviews_order_id_fkey"
      FOREIGN KEY ("order_id") REFERENCES "orders"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------- زرع الصفحات الأربع الحالية (نفس نصوصها) ----------
INSERT INTO "pages" ("slug", "title", "intro", "sections", "sort_order") VALUES
(
  'about',
  'قصتنا',
  'AURA براند سعودي يقدّم نظارات شمسية وأزياء بتصميم هادئ وتفاصيل جريئة — قطع مختارة بعناية، ومصنوعة لتدوم.',
  '[
    {"heading":"الفكرة","body":"بدأنا من سؤال واحد: لماذا تكون القطعة الجميلة معقّدة؟ لذلك نبني مجموعة صغيرة ومختارة، نركّز فيها على الخامة والقصّة والتفاصيل التي تُلمس لا التي تُروى فقط."},
    {"heading":"الجودة","body":"عدسات تحجب ١٠٠٪ من الأشعة فوق البنفسجية في كل موديل، وأقمشة تتحمّل الاستخدام اليومي والغسيل المتكرر. كل قطعة تُفحص قبل التغليف."},
    {"heading":"التغليف","body":"علبة صلبة للنظارات مع قماشة تنظيف، وتغليف ورقي بسيط للأزياء — بلا بلاستيك غير ضروري."}
  ]'::jsonb,
  1
),
(
  'shipping-returns',
  'الشحن والاستبدال',
  'نشحن لكل مدن المملكة العربية السعودية. التوصيل خلال ٢–٤ أيام عمل، والدفع عند الاستلام متاح.',
  '[
    {"heading":"تكلفة الشحن","body":"رسوم ثابتة ٢٥ ر.س للطلبات الأقل من ٣٠٠ ر.س، والشحن مجاني تماماً للطلبات التي تبلغ ٣٠٠ ر.س أو أكثر. الأسعار شاملة ضريبة القيمة المضافة ١٥٪."},
    {"id":"returns","heading":"سياسة الإرجاع (١٤ يوماً)","body":"يمكنك طلب الإرجاع أو الاستبدال خلال ١٤ يوماً من استلام الطلب، بشرط أن تكون القطعة بحالتها الأصلية مع علبتها وبطاقتها. تواصل معنا عبر واتساب وسنرتّب عملية الاستلام."},
    {"heading":"المنتجات غير القابلة للإرجاع","body":"لا يمكن إرجاع القطع التي تظهر عليها آثار استخدام أو تلف، أو التي أُزيلت بطاقتها الأصلية."}
  ]'::jsonb,
  2
),
(
  'privacy',
  'سياسة الخصوصية',
  'نحتفظ بالحد الأدنى من بياناتك اللازمة لإتمام الطلب والتواصل معك، ولا نبيعها لأي جهة.',
  '[
    {"heading":"البيانات التي نجمعها","body":"الاسم، رقم الجوال، البريد الإلكتروني، وعنوان التوصيل — لإتمام الطلب والتوصيل. وكلمة المرور تُحفظ مشفّرة ولا يمكن لأي أحد قراءتها."},
    {"heading":"كيف نستخدم البيانات","body":"لتنفيذ الطلبات، وإرسال تحديثات الطلب، والرد على استفساراتك. لا نستخدمها في تسويق غير موافق عليه."},
    {"heading":"حقوقك","body":"يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذف حسابك بمراسلتنا على hello@aura.sa."}
  ]'::jsonb,
  3
),
(
  'terms',
  'الشروط والأحكام',
  'باستخدامك متجر AURA فإنك توافق على الشروط التالية. الأسعار معروضة بالريال السعودي وشاملة ضريبة القيمة المضافة ١٥٪.',
  '[
    {"heading":"الطلبات","body":"يُعد الطلب مؤكداً بعد نجاح إنشائه في النظام. نحتفظ بحق إلغاء أي طلب في حال عدم توفر المخزون، مع إبلاغك وإعادة أي مبالغ مدفوعة."},
    {"heading":"الدفع","body":"الطريقة المتاحة حالياً هي الدفع عند الاستلام (COD). نعمل على إضافة بوابات الدفع الإلكتروني قريباً."},
    {"heading":"المسؤولية","body":"نحرص على دقة أوصاف المنتجات وألوانها، وقد تختلف درجات الألوان قليلاً بسبب اختلاف الشاشات."}
  ]'::jsonb,
  4
)
ON CONFLICT ("slug") DO NOTHING;

COMMIT;
