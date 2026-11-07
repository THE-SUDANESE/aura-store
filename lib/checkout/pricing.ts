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
  shippingCents: number;
  totalCents: number;
  /** الجزء الضريبي المستخرج من الإجمالي (وليس مضافاً فوقه). */
  vatCents: number;
  /** المبلغ المتبقي للوصول إلى الشحن المجاني (صفر إذا تحقق). */
  freeShippingRemainingCents: number;
  subtotal: number;
  shipping: number;
  total: number;
  vat: number;
};

const toSar = (cents: number): number => Math.round(cents) / 100;

export const toSarString = (cents: number): string => (Math.round(cents) / 100).toFixed(2);

export function computeTotals(
  subtotalSar: number,
  rules: PricingRules = DEFAULT_PRICING,
): OrderTotals {
  return computeTotalsFromCents(Math.round(Math.max(subtotalSar, 0) * 100), rules);
}

export function computeTotalsFromCents(
  subtotalCentsInput: number,
  rules: PricingRules = DEFAULT_PRICING,
): OrderTotals {
  const subtotalCents = Math.max(Math.round(subtotalCentsInput), 0);
  const thresholdCents = Math.max(Math.round(rules.freeShippingThresholdSar), 0) * 100;

  // لا شحن على سلة فارغة، ومجاني عند بلوغ الحد (أو إذا كان الحد صفراً)
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= thresholdCents
      ? 0
      : Math.max(Math.round(rules.flatShippingSar), 0) * 100;

  const totalCents = subtotalCents + shippingCents;
  const vatCents = Math.round(totalCents - totalCents / (1 + rules.vatRate));

  return {
    subtotalCents,
    shippingCents,
    totalCents,
    vatCents,
    freeShippingRemainingCents: Math.max(thresholdCents - subtotalCents, 0),
    subtotal: toSar(subtotalCents),
    shipping: toSar(shippingCents),
    total: toSar(totalCents),
    vat: toSar(vatCents),
  };
}
