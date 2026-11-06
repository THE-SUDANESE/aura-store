import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VAT_RATE } from "@/lib/checkout/pricing";

/**
 * سلة عالمية على العميل (Zustand + localStorage).
 * الحساب المالي هنا للعرض فقط؛ الإجماليات النهائية تُحسب على الخادم
 * عند إنشاء الطلب (لا يُقبل سعر من العميل).
 */

// معاد التصدير للتوافق مع مكوّنات السلة الموجودة
export { VAT_RATE };

export const STORAGE_KEY = "aura-cart";


export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  sku: string;
  unitPrice: number;
  image: string | null;
  maxQuantity: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const clampQuantity = (quantity: number, maxQuantity: number): number => {
  const upperBound = Math.max(Math.trunc(maxQuantity), 0);
  return Math.min(Math.max(Math.trunc(quantity), 0), upperBound);
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.variantId === item.variantId);

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.variantId === item.variantId
                  ? { ...entry, quantity: clampQuantity(entry.quantity + quantity, entry.maxQuantity) }
                  : entry,
              ),
            };
          }

          const initialQuantity = clampQuantity(quantity, item.maxQuantity);
          // لا نضيف شيئاً نافد المخزون
          if (initialQuantity === 0) return state;

          return { items: [...state.items, { ...item, quantity: initialQuantity }] };
        }),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.flatMap((entry) => {
            if (entry.variantId !== variantId) return [entry];

            const nextQuantity = clampQuantity(quantity, entry.maxQuantity);
            return nextQuantity === 0 ? [] : [{ ...entry, quantity: nextQuantity }];
          }),
        })),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((entry) => entry.variantId !== variantId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/* ---------- Selectors (تُستخدم مع useCartStore(selector)) ---------- */

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const selectItemCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

/** الإجمالي شامل ضريبة القيمة المضافة ١٥٪. */
export const selectSubtotal = (state: CartState): number =>
  round2(state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));

/** الجزء الضريبي المستخرج من الإجمالي (وليس مضافاً فوقه). */
export const selectVatPortion = (state: CartState): number => {
  const subtotal = selectSubtotal(state);
  return round2(subtotal - subtotal / (1 + VAT_RATE));
};

export const selectTotalQuantityForVariant =
  (variantId: string) =>
  (state: CartState): number =>
    state.items.find((item) => item.variantId === variantId)?.quantity ?? 0;
