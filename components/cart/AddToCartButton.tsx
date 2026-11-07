"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { captureAnalyticsEvent } from "@/lib/analytics/posthog";
import { useCartStore } from "@/lib/cart/store";
import type { ProductSummaryDto } from "@/lib/types/product";

/**
 * يضيف أول متغير متوفر إلى السلة — يُستخدم داخل بطاقة المنتج
 * حيث لا يوجد اختيار لون/مقاس. الاختيار الدقيق يتم في صفحة المنتج.
 */
export function AddToCartButton({ product }: { product: ProductSummaryDto }) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  // نضيف أرخص متغير متوفر، حتى يطابق سعر السلة السعر المعروض على البطاقة
  const variant =
    product.variants
      .filter((entry) => entry.inStock)
      .sort((a, b) => Number(a.price.amount) - Number(b.price.amount))[0] ?? null;
  const isSoldOut = !variant;

  const handleClick = () => {
    if (!variant) return;

    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name.ar,
        variantLabel: variant.label,
        sku: variant.sku,
        unitPrice: Number(variant.price.amount),
        image: product.images[0]?.url ?? null,
        maxQuantity: variant.stockQuantity,
      },
      1,
    );

    setJustAdded(true);

    captureAnalyticsEvent("product_added_to_cart", {
      product_id: product.id,
      product_name: product.name.ar,
      product_slug: product.slug,
      variant_id: variant.id,
      variant_label: variant.label,
      sku: variant.sku,
      price: Number(variant.price.amount),
      currency: "SAR",
      quantity: 1,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      fullWidth
      className="mt-4"
      disabled={isSoldOut}
      onClick={handleClick}
      aria-label={isSoldOut ? `${product.name} غير متوفر` : `إضافة ${product.name} إلى السلة`}
    >
      {isSoldOut ? "غير متوفر" : justAdded ? "تمت الإضافة ✓" : "أضف إلى السلة"}
    </Button>
  );
}
