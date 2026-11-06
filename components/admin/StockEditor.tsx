"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type StockEditorProps = {
  variantId: string;
  sku: string;
  stockQuantity: number;
};

export function StockEditor({ variantId, sku, stockQuantity }: StockEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(String(stockQuantity));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const parsed = Number(value);
  const isValid = value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0;
  const isDirty = isValid && parsed !== stockQuantity;

  async function handleSave() {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: parsed }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setMessage({
          type: "error",
          text: payload?.error?.message ?? "تعذّر حفظ الكمية.",
        });
        return;
      }

      setMessage({ type: "ok", text: "تم الحفظ" });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label htmlFor={`stock-${variantId}`} className="sr-only">
          كمية المخزون للمتغير {sku}
        </label>
        <input
          id={`stock-${variantId}`}
          type="number"
          min={0}
          max={100000}
          step={1}
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setMessage(null);
          }}
          aria-invalid={!isValid || undefined}
          className="h-9 w-20 rounded-lg border border-ink-200 bg-white px-2 text-center text-sm text-ink-900 outline-none transition focus:border-ink-900 aria-[invalid=true]:border-warning-600"
        />

        <Button
          size="sm"
          variant="outline"
          disabled={!isDirty}
          isLoading={isSaving}
          onClick={handleSave}
        >
          حفظ
        </Button>
      </div>

      {message && (
        <span
          role={message.type === "error" ? "alert" : undefined}
          className={message.type === "error" ? "text-[11px] text-warning-700" : "text-[11px] text-ink-500"}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
