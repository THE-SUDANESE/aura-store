/**
 * تنسيق مشترك بين الخادم والواجهة.
 * الأرقام بالصيغة العربية (٠١٢٣) لتتوافق مع بقية نصوص المتجر.
 */

const sarFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("ar-SA");

/** 349 → "٣٤٩ ر.س." */
export function formatSAR(amount: number): string {
  return sarFormatter.format(amount);
}

/** 3 → "٣" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** نسبة الخصم مقرّبة: (429، 349) → 19 */
export function discountPercent(price: number, compareAtPrice: number): number {
  if (compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
