"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart/store";
import { formatNumber } from "@/lib/format";
import type { ProductDetailDto, ProductVariantDto } from "@/lib/types/product";

type VariantPickerProps = {
  product: ProductDetailDto;
  colorLabel?: string;
  sizeLabel?: string;
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function VariantPicker({
  product,
  colorLabel = "اللون",
  sizeLabel = "المقاس",
}: VariantPickerProps) {
  const addItem = useCartStore((state) => state.addItem);
  const variants = product.variants;
  const [justAdded, setJustAdded] = useState(false);

  /* ---------- استخراج الخيارات من المتغيرات الحقيقية ---------- */

  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const variant of variants) {
      const name = variant.attributes.colorName;
      if (name && !map.has(name)) map.set(name, variant.attributes.colorHex);
    }
    return [...map.entries()].map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    for (const variant of variants) {
      if (variant.attributes.sizeLabel) set.add(variant.attributes.sizeLabel);
    }
    return [...set];
  }, [variants]);

  // نبدأ بأول متغير متوفر بدل أول متغير في القائمة
  const firstAvailable = variants.find((variant) => variant.inStock) ?? variants[0] ?? null;
  const [selectedColorName, setSelectedColorName] = useState<string | null>(
    firstAvailable?.attributes.colorName ?? null,
  );
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string | null>(
    firstAvailable?.attributes.sizeLabel ?? null,
  );

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const matchesSelection = (
    variant: ProductVariantDto,
    colorName: string | null,
    sizeLabelValue: string | null,
  ): boolean =>
    (colors.length === 0 || variant.attributes.colorName === colorName) &&
    (sizes.length === 0 || variant.attributes.sizeLabel === sizeLabelValue);

  const selectedVariant =
    variants.find((variant) =>
      matchesSelection(variant, selectedColorName, selectedSizeLabel),
    ) ?? null;

  /** أعلى كمية متاحة لأي متغير يطابق اللون والمقاس المعطيين. */
  const maxStockFor = (colorName: string | null, sizeLabelValue: string | null): number =>
    variants
      .filter((variant) => matchesSelection(variant, colorName, sizeLabelValue))
      .reduce((max, variant) => Math.max(max, variant.stockQuantity), 0);

  const selectedStock = selectedVariant?.stockQuantity ?? 0;
  const isAvailable = selectedStock > 0;
  const isLowStock = isAvailable && selectedStock <= 2;

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) return;

    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name.ar,
        variantLabel: selectedVariant.label,
        sku: selectedVariant.sku,
        unitPrice: Number(selectedVariant.price.amount),
        image: product.images[0]?.url ?? null,
        maxQuantity: selectedVariant.stockQuantity,
      },
      1,
    );

    setJustAdded(true);
  };

  return (
    <div className="space-y-7">
      {/* اللون */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-600">
              {colorLabel}
            </h2>
            <span className="text-xs text-ink-500">{selectedColorName}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3" role="group" aria-label={colorLabel}>
            {colors.map((color) => {
              const isSelected = color.name === selectedColorName;
              const isSoldOut = variants
                .filter((variant) => variant.attributes.colorName === color.name)
                .every((variant) => variant.stockQuantity === 0);

              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColorName(color.name)}
                  aria-label={`${color.name}${isSoldOut ? " — غير متوفر" : ""}`}
                  aria-pressed={isSelected}
                  title={color.name}
                  className={cn(
                    "relative h-9 w-9 rounded-full border border-ink-200 transition",
                    isSelected && "ring-2 ring-ink-900 ring-offset-2 ring-offset-sand-50",
                    isSoldOut && "opacity-40",
                  )}
                  style={{ backgroundColor: color.hex ?? "#E4D5BF" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* المقاس */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-600">
              {sizeLabel}
            </h2>
            <span className="text-xs text-ink-500">{selectedSizeLabel}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={sizeLabel}>
            {sizes.map((size) => {
              const isSelected = size === selectedSizeLabel;
              const isSoldOut = maxStockFor(selectedColorName, size) === 0;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => setSelectedSizeLabel(size)}
                  aria-pressed={isSelected}
                  aria-label={`${size}${isSoldOut ? " — نفد المخزون" : ""}`}
                  className={cn(
                    "h-10 min-w-16 rounded-full border px-4 text-sm transition",
                    isSelected
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 text-ink-800 hover:border-ink-400",
                    isSoldOut &&
                      "cursor-not-allowed border-ink-100 text-ink-300 line-through hover:border-ink-100",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* حالة المخزون */}
      <p
        className={cn(
          "text-xs",
          !isAvailable && "text-warning-700",
          isLowStock && "text-warning-700",
          isAvailable && !isLowStock && "text-ink-500",
        )}
      >
        {!isAvailable
          ? "هذا الاختيار غير متوفر حالياً — جرّب لوناً أو مقاساً آخر."
          : isLowStock
            ? `آخر ${formatNumber(selectedStock)} قطع في هذا الاختيار.`
            : "متوفر — يُشحن خلال ٢٤ ساعة."}
      </p>

      {/* زر الإضافة للسلة */}
      <Button
        size="lg"
        fullWidth
        disabled={!isAvailable}
        onClick={handleAddToCart}
        aria-label={`إضافة ${product.name.ar} إلى السلة`}
      >
        {!isAvailable ? "غير متوفر" : justAdded ? "تمت الإضافة ✓" : "أضف إلى السلة"}
      </Button>

      <p className="text-center text-[11px] text-ink-400">
        شحن مجاني للطلبات فوق ٣٠٠ ر.س — إرجاع خلال ١٤ يوماً
      </p>
    </div>
  );
}
