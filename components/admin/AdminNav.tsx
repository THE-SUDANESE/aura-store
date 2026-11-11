import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "الطلبات والمخزون" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/badges", label: "الشارات" },
  { href: "/admin/reviews", label: "التقييمات" },
  { href: "/admin/coupons", label: "الكوبونات" },
  { href: "/admin/pages", label: "الصفحات" },
  { href: "/admin/settings", label: "الإعدادات" },
  { href: "/admin/users", label: "المستخدمون" },
] as const;

/** شريط تنقل موحّد لكل صفحات لوحة التحكم. */
export function AdminNav({ current }: { current?: string }) {
  return (
    <nav aria-label="أقسام لوحة التحكم" className="border-b border-ink-100 bg-sand-50/70">
      <div className="shell flex gap-1 overflow-x-auto py-2">
        {LINKS.map((link) => {
          const isActive = current === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "whitespace-nowrap rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white"
                  : "whitespace-nowrap rounded-full px-4 py-2 text-xs text-ink-700 transition-colors hover:bg-ink-100"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
