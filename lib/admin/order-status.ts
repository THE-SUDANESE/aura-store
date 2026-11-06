import type { OrderStatus } from "@prisma/client";

/** تُستخدم في لوحة التحكم وفي مسار تعديل الحالة — مصدر واحد للحقيقة. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  returned: "مرتجع",
};

/**
 * الانتقالات المسموحة فقط.
 * لا يمكن تجاوز مرحلة، ولا الرجوع للخلف بعد الشحن، ولا تعديل طلب ملغي/مرتجع.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && value in ORDER_STATUS_LABELS;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}
