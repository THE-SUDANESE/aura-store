/**
 * حساب التسعير المشترك بين صفحة الدفع والخادم.
 * الأسعار شاملة ضريبة القيمة المضافة، والشحن مبلغ ثابت.
 *
 * تحذير: نتائج هذه الدالة على العميل للعرض فقط.
 * الخادم يعيد حساب كل شيء من أسعار قاعدة البيانات قبل إنشاء الطلب.
 */

export const VAT_RATE = 0.15;
/** رسوم الشحن الثابتة للطلبات الأقل من حد الشحن المجاني. */
export const SHIPPING_FLAT_SAR = 25;
/** فوق هذا المبلغ يكون الشحن مجانياً. */
export const FREE_SHIPPING_THRESHOLD_SAR = 300;

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

export function computeTotals(subtotalSar: number): OrderTotals {
  return computeTotalsFromCents(Math.round(Math.max(subtotalSar, 0) * 100));
}

export function computeTotalsFromCents(subtotalCentsInput: number): OrderTotals {
  const subtotalCents = Math.max(Math.round(subtotalCentsInput), 0);
  const thresholdCents = FREE_SHIPPING_THRESHOLD_SAR * 100;

  // لا شحن على سلة فارغة، ومجاني عند بلوغ الحد
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= thresholdCents ? 0 : SHIPPING_FLAT_SAR * 100;
  const totalCents = subtotalCents + shippingCents;
  const vatCents = Math.round(totalCents - totalCents / (1 + VAT_RATE));

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
