import { prisma } from "@/lib/db";

/** أرقام المبيعات والمخزون للوحة التحكم — مصادرها الطلبات الفعلية لا تقديرات. */

const REVENUE_STATUSES = ["confirmed", "shipped", "delivered"] as const;

export type LowStockVariant = {
  variantId: string;
  productName: string;
  sku: string;
  stockQuantity: number;
  threshold: number;
};

export type SalesSummary = {
  revenue30d: number;
  orders30d: number;
  averageOrder: number;
  revenueToday: number;
  ordersToday: number;
  pendingOrders: number;
  lowStock: LowStockVariant[];
  lowStockCount: number;
};

export async function getSalesSummary(): Promise<SalesSummary> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [month, today, pendingOrders, lowStockRows, lowStockCount] = await Promise.all([
    prisma.order.aggregate({
      where: { placedAt: { gte: since }, status: { in: [...REVENUE_STATUSES] } },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { placedAt: { gte: startOfToday }, status: { in: [...REVENUE_STATUSES] } },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.productVariant.findMany({
      where: {
        isActive: true,
        product: { deletedAt: null, status: "active" },
        stockQuantity: { lte: prisma.productVariant.fields.lowStockThreshold },
      },
      select: {
        id: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        product: { select: { nameAr: true } },
      },
      orderBy: { stockQuantity: "asc" },
      take: 10,
    }),
    prisma.productVariant.count({
      where: {
        isActive: true,
        product: { deletedAt: null, status: "active" },
        stockQuantity: { lte: prisma.productVariant.fields.lowStockThreshold },
      },
    }),
  ]);

  const revenue30d = Number(month._sum.grandTotal ?? 0);
  const orders30d = month._count._all;

  return {
    revenue30d,
    orders30d,
    averageOrder: orders30d === 0 ? 0 : revenue30d / orders30d,
    revenueToday: Number(today._sum.grandTotal ?? 0),
    ordersToday: today._count._all,
    pendingOrders,
    lowStock: lowStockRows.map((row) => ({
      variantId: row.id,
      productName: row.product.nameAr,
      sku: row.sku,
      stockQuantity: row.stockQuantity,
      threshold: row.lowStockThreshold,
    })),
    lowStockCount,
  };
}
