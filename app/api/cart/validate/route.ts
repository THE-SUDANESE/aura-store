import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { computeTotals } from "@/lib/checkout/pricing";
import { prisma } from "@/lib/db";
import { AppError, assertSameOrigin, ok, toErrorResponse } from "@/lib/http";
import { clientIp, enforceRateLimit } from "@/lib/server/rate-limit";
import { getSiteSettings } from "@/lib/server/settings";
import { shippingRulesOf } from "@/lib/types/settings";

/**
 * POST /api/cart/validate
 * يعيد تسعير السلة من قاعدة البيانات: سعر المتغير الحالي، المخزون المتاح،
 * وهل ما زال المنتج معروضاً. الأسعار المخزّنة في متصفح العميل لا تُصدَّق أبداً
 * — هنا نقطة التصحيح الوحيدة قبل صفحة الدفع.
 */
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 50;

type RequestedItem = { variantId: string; quantity: number };

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);
    await enforceRateLimit({
      key: `cart-validate:${clientIp(request)}`,
      limit: 60,
      windowSeconds: 60,
    });

    const body = (await request.json().catch(() => null)) as { items?: unknown } | null;
    const rows = Array.isArray(body?.items) ? body.items : [];

    if (rows.length > MAX_ITEMS) {
      throw new AppError("VALIDATION_ERROR", "عدد القطع في السلة أكبر من المسموح.", 400);
    }

    const requested: RequestedItem[] = rows.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const record = entry as Record<string, unknown>;
      const variantId = typeof record.variantId === "string" ? record.variantId : "";
      const quantity = Number(record.quantity);
      if (!UUID_RE.test(variantId) || !Number.isFinite(quantity)) return [];
      return [{ variantId, quantity: Math.min(Math.max(Math.trunc(quantity), 1), 99) }];
    });

    if (requested.length === 0) {
      return ok({ items: [], totals: computeTotals(0), hasIssues: false }, requestId);
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: requested.map((item) => item.variantId) } },
      select: {
        id: true,
        sku: true,
        variantKey: true,
        colorName: true,
        lensColor: true,
        sizeLabel: true,
        price: true,
        stockQuantity: true,
        isActive: true,
        product: {
          select: {
            id: true,
            slug: true,
            nameAr: true,
            status: true,
            deletedAt: true,
            basePrice: true,
            images: {
              select: { url: true },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              take: 1,
            },
          },
        },
      },
    });

    const byId = new Map(variants.map((variant) => [variant.id, variant]));
    const rules = shippingRulesOf(await getSiteSettings());

    let subtotal = 0;
    let hasIssues = false;

    const items = requested.map((item) => {
      const variant = byId.get(item.variantId);

      if (!variant || variant.product.deletedAt) {
        hasIssues = true;
        return {
          variantId: item.variantId,
          available: false,
          reason: "removed" as const,
          quantity: 0,
          maxQuantity: 0,
          unitPrice: 0,
        };
      }

      const isListed = variant.product.status === "active" && variant.isActive;
      const maxQuantity = Math.max(0, variant.stockQuantity);
      const quantity = Math.min(item.quantity, maxQuantity);
      const unitPrice = Number(variant.price ?? variant.product.basePrice);

      if (!isListed || maxQuantity === 0) {
        hasIssues = true;
        return {
          variantId: variant.id,
          productId: variant.product.id,
          slug: variant.product.slug,
          name: variant.product.nameAr,
          variantLabel:
            [variant.colorName, variant.lensColor, variant.sizeLabel]
              .filter(Boolean)
              .join(" / ") || variant.sku,
          image: variant.product.images[0]?.url ?? null,
          available: false,
          reason: "out_of_stock" as const,
          quantity: 0,
          maxQuantity,
          unitPrice: Math.round(unitPrice * 100) / 100,
        };
      }

      if (quantity !== item.quantity) hasIssues = true;
      subtotal += unitPrice * quantity;

      return {
        variantId: variant.id,
        productId: variant.product.id,
        slug: variant.product.slug,
        name: variant.product.nameAr,
        variantLabel:
          [variant.colorName, variant.lensColor, variant.sizeLabel]
            .filter(Boolean)
            .join(" / ") || variant.sku,
        image: variant.product.images[0]?.url ?? null,
        available: true,
        reason: null,
        quantity,
        maxQuantity,
        unitPrice: Math.round(unitPrice * 100) / 100,
      };
    });

    return ok({ items, totals: computeTotals(subtotal, rules), hasIssues }, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
