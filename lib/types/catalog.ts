/** أنواع مشتركة بين نموذج تحرير المنتج وخادم الكتالوج — بلا أي استيراد لـ Prisma. */

export type ProductTypeValue = "sunglasses" | "clothing" | "accessory";
export type ProductStatusValue = "draft" | "active" | "archived";

export type AdminVariantInput = {
  id?: string;
  sku: string;
  variantKey: string;
  colorName: string;
  colorHex: string;
  sizeLabel: string;
  lensColor: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
};

export type AdminImageInput = {
  url: string;
  altAr: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminProductInput = {
  nameAr: string;
  nameEn: string;
  slug: string;
  categoryId: string;
  productType: ProductTypeValue;
  status: ProductStatusValue;
  basePrice: string;
  compareAtPrice: string;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  returnWindowDays: number;
  metaTitle: string;
  metaDescription: string;
  specs: Array<{ key: string; value: string }>;
  variants: AdminVariantInput[];
  images: AdminImageInput[];
  badgeIds: string[];
};

export type AdminProductInitial = AdminProductInput & { id: string };

export type CategoryOption = { id: string; nameAr: string; slug: string };
export type BadgeOption = { id: string; labelAr: string; slug: string };

export const EMPTY_VARIANT: AdminVariantInput = {
  sku: "",
  variantKey: "",
  colorName: "",
  colorHex: "#000000",
  sizeLabel: "",
  lensColor: "",
  price: "",
  compareAtPrice: "",
  stockQuantity: 0,
  lowStockThreshold: 3,
  isActive: true,
};

export const EMPTY_PRODUCT: AdminProductInput = {
  nameAr: "",
  nameEn: "",
  slug: "",
  categoryId: "",
  productType: "sunglasses",
  status: "draft",
  basePrice: "",
  compareAtPrice: "",
  shortDescription: "",
  description: "",
  isFeatured: false,
  returnWindowDays: 14,
  metaTitle: "",
  metaDescription: "",
  specs: [],
  variants: [{ ...EMPTY_VARIANT }],
  images: [],
  badgeIds: [],
};
