"use client";

import type { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/lib/admin/order-status";

type OrderStatusSelectProps = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
};

export function OrderStatusSelect({ orderId, orderNumber, status }: OrderStatusSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // الحالة الحالية + الانتقالات المسموحة فقط
  const options: OrderStatus[] = [status, ...ORDER_STATUS_TRANSITIONS[status]];
  const isLocked = ORDER_STATUS_TRANSITIONS[status].length === 0;

  async function handleChange(next: OrderStatus) {
    if (next === status) return;

    setValue(next);
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setValue(status);
        setError(payload?.error?.message ?? "تعذّر تحديث الحالة.");
        return;
      }

      router.refresh();
    } catch {
      setValue(status);
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-w-40 flex-col gap-1">
      <select
        value={value}
        disabled={isLocked || isSaving}
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
        aria-label={`حالة الطلب ${orderNumber}`}
        className="h-8 rounded-full border border-ink-200 bg-white px-3 text-xs text-ink-800 outline-none transition focus:border-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>

      {isSaving && <span className="text-[11px] text-ink-400">جارٍ الحفظ…</span>}
      {error && (
        <span role="alert" className="text-[11px] text-warning-700">
          {error}
        </span>
      )}
    </div>
  );
}
