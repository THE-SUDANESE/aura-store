/**
 * أنواع استجابة الكتالوج المشتركة بين الخادم والواجهة.
 * هي نفس الشكل الذي يعيده /api/products و /api/products/:slug، وتُستهلك
 * مباشرة في مكوّنات العميل والسلة.
 */

export type ProductType = "sunglasses" | "clothing" | "accessory";

export type MoneyDto = {
  amount: string;
  compareAt: string | null;
};

export type ProductImageDto = {
  url: string;
  alt: string | null;
  isPrimary: boolean;
  variantId: string | null;
};

export type ProductVariantDto = {
  id: string;
  sku: string;
  label: string;
  key: string;
  attributes: {
    colorName: string | null;
    colorHex: string | null;
    lensColor: string | null;
    sizeLabel: string | null;
    frameWidthMm: number | null;
  };
  price: MoneyDto;
  stockQuantity: number;
  inStock: boolean;
};

export type ProductCategoryDto = {
  id: string;
  slug: string;
  name: { ar: string; en: string | null };
};

export type ProductBadgeDto = {
  slug: string;
  label: string;
  style: "solid" | "outline" | "soft";
  colorHex: string | null;
};

export type ProductPriceDto = {
  amount: string;
  compareAt: string | null;
  currency: string;
  vatIncluded: true;
  vatRate: number;
};

export type ProductSummaryDto = {
  id: string;
  slug: string;
  name: { ar: string; en: string | null };
  type: ProductType;
  category: ProductCategoryDto;
  badges: ProductBadgeDto[];
  shortDescription: string | null;
  price: ProductPriceDto;
  returnWindowDays: number;
  inStock: boolean;
  totalStock: number;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
};

export type ProductDetailDto = ProductSummaryDto & {
  description: string | null;
  specs: Record<string, unknown>;
};

export type ProductListDto = {
  items: ProductSummaryDto[];
  total: number;
  page: number;
  pageSize: number;
};
