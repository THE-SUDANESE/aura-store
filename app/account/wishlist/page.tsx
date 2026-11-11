import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { productInclude, toProductSummary } from "@/lib/server/products";

export const metadata: Metadata = {
  title: "مفضلتي",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?redirect=/account/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: {
      userId: session.user.id,
      product: { deletedAt: null, status: "active" },
    },
    orderBy: { createdAt: "desc" },
    include: { product: { include: productInclude } },
  });

  const products = items.map((item) => toProductSummary(item.product));

  return (
    <div className="shell py-10 lg:py-14">
      <nav className="text-xs text-ink-500">
        <Link href="/account" className="underline underline-offset-4 hover:text-ink-900">
          حسابي
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">مفضلتي</span>
      </nav>

      <header className="mt-4 border-b border-ink-100 pb-6">
        <h1 className="font-display text-3xl text-ink-900">مفضلتي</h1>
        <p className="mt-2 text-xs text-ink-500">
          {products.length === 0
            ? "احفظ القطع التي تعجبك لتعود إليها لاحقاً."
            : `${products.length} قطعة محفوظة — أضفها للسلة قبل نفاد المخزون.`}
        </p>
      </header>

      {products.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-ink-200 px-6 py-16 text-center">
          <p className="text-sm text-ink-600">قائمتك فارغة حالياً.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-ink-900 px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-ink-800"
          >
            تسوّق الآن
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
