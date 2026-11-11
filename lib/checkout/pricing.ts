/**
 * حساب التسعير المشترك بين صفحة الدفع والخادم.
 * الأسعار شاملة ضريبة القيمة المضافة، والشحن مبلغ قابل للضبط من الإعدادات.
 *
 * تحذير: نتائج هذه الدالة على العميل للعرض فقط.
 * الخادم يعيد حساب كل شيء من أسعار قاعدة البيانات وإعدادات المتجر قبل إنشاء الطلب.
 */

export type PricingRules = {
  /** نسبة الضريبة ككسر (0.15 = ١٥٪) */
  vatRate: number;
  /** رسوم الشحن الثابتة بالريال */
  flatShippingSar: number;
  /** الحد الذي يصبح فوقه الشحن مجانياً */
  freeShippingThresholdSar: number;
};

/** قيم افتراضية تُستخدم إن تعذّر قراءة الإعدادات (لا تتغيّر من هنا). */
export const VAT_RATE = 0.15;
export const SHIPPING_FLAT_SAR = 25;
export const FREE_SHIPPING_THRESHOLD_SAR = 300;

export const DEFAULT_PRICING: PricingRules = {
  vatRate: VAT_RATE,
  flatShippingSar: SHIPPING_FLAT_SAR,
  freeShippingThresholdSar: FREE_SHIPPING_THRESHOLD_SAR,
};

export type OrderTotals = {
  subtotalCents: number;
  /** مبلغ الخصم المطبّق (كوبون أو تعديل إداري) — لا يتجاوز المجموع الفرعي. */
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  /** الجزء الضريبي المستخرج من الإجمالي (وليس مضافاً فوقه). */
  vatCents: number;
  /** المبلغ المتبقي للوصول إلى الشحن المجاني (صفر إذا تحقق). */
  freeShippingRemainingCents: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  vat: number;
};

const toSar = (cents: number): number => Math.round(cents) / 100;

export const toSarString = (cents: number): string => (Math.round(cents) / 100).toFixed(2);

export function computeTotals(
  subtotalSar: number,
  rules: PricingRules = DEFAULT_PRICING,
  discountSar = 0,
): OrderTotals {
  return computeTotalsFromCents(
    Math.round(Math.max(subtotalSar, 0) * 100),
    rules,
    Math.round(Math.max(discountSar, 0) * 100),
  );
}

/**
 * الحساب الرسمي: يُطبَّق الخصم على قيمة البضاعة أولاً، ثم يُحسب الشحن على
 * الصافي (فالكوبون قد يُسقط الطلب تحت حد الشحن المجاني)، والضريبة تُستخرج
 * من الإجمالي النهائي لأن الأسعار شاملة لها.
 */
export function computeTotalsFromCents(
  subtotalCentsInput: number,
  rules: PricingRules = DEFAULT_PRICING,
  discountCentsInput = 0,
): OrderTotals {
  const subtotalCents = Math.max(Math.round(subtotalCentsInput), 0);
  const discountCents = Math.min(Math.max(Math.round(discountCentsInput), 0), subtotalCents);
  const netCents = subtotalCents - discountCents;
  const thresholdCents = Math.max(Math.round(rules.freeShippingThresholdSar), 0) * 100;

  // لا شحن على سلة فارغة، ومجاني عند بلوغ الحد (أو إذا كان الحد صفراً)
  const shippingCents =
    netCents === 0 || netCents >= thresholdCents
      ? 0
      : Math.max(Math.round(rules.flatShippingSar), 0) * 100;

  const totalCents = netCents + shippingCents;
  const vatCents = Math.round(totalCents - totalCents / (1 + rules.vatRate));

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents,
    vatCents,
    freeShippingRemainingCents: Math.max(thresholdCents - netCents, 0),
    subtotal: toSar(subtotalCents),
    discount: toSar(discountCents),
    shipping: toSar(shippingCents),
    total: toSar(totalCents),
    vat: toSar(vatCents),
  };
}
