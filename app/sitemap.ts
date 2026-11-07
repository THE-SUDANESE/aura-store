import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { listInfoPages } from "@/lib/server/settings";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * خريطة الموقع: الصفحات الثابتة + المنتجات المنشورة + صفحات المعلومات.
 * تبقى ديناميكية أثناء البناء (force-dynamic) فلا يلزم إعادة نشر عند إضافة منتج.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, pages] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null, status: "active" },
      orderBy: { updatedAt: "desc" },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    listInfoPages(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE}/shop`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/pages/about`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/pages/shipping-returns`, priority: 0.5, changeFrequency: "monthly" },
  ];

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${BASE}/product/${product.slug}`,
      lastModified: product.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
    ...pages
      .filter((page) => page.isActive)
      .map((page) => ({
        url: `${BASE}/pages/${page.slug}`,
        priority: 0.4,
        changeFrequency: "monthly" as const,
      })),
  ];
}
