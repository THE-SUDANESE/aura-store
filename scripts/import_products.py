"""
استيراد المنتجات من docs/products-import.csv إلى قاعدة PostgreSQL.

الاستخدام:
    python scripts/import_products.py                # يطبّق التغييرات على قاعدة البيانات
    python scripts/import_products.py --dry-run      # يعرض الخطة فقط بلا كتابة
    python scripts/import_products.py --sql          # يكتب db/005_real_products.sql بدل التنفيذ

الأعمدة المطلوبة في CSV:
    slug, name_ar, name_en, price, stock, image, color_ar, color_en, description
وأعمدة اختيارية: compare_at, status, featured

سلوك التحديث:
    - المنتج موجود (نفس slug)  → تُحدَّث الأسماء والسعر والوصف والحالة.
    - المتغير موجود (نفس sku)  → يُحدَّث لونه فقط، **ولا تُمس كمية المخزون**
      حتى لا نطمس تعديلات لوحة التحكم.
    - الصورة موجودة             → لا تُكرَّر.
"""

from __future__ import annotations

import argparse
import csv
import json
import pathlib
import re
import sys

CSV_PATH = pathlib.Path("docs/products-import.csv")
SQL_PATH = pathlib.Path("db/005_real_products.sql")
CATEGORY_SLUG = "sunglasses"


def load_env(path: pathlib.Path = pathlib.Path(".env")) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def read_rows(path: pathlib.Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as fh:
        rows = [row for row in csv.DictReader(fh) if (row.get("slug") or "").strip()]
    if not rows:
        raise SystemExit(f"ملف CSV فارغ: {path}")
    return rows


def variant_key(color_en: str) -> str:
    key = re.sub(r"[^a-z0-9]+", "-", color_en.strip().lower()).strip("-")
    return key or "default"


def sku_for(slug: str) -> str:
    return slug.upper().replace("-", "-")


def money(value: str) -> float | None:
    value = (value or "").strip()
    return float(value) if value else None


def truthy(value: str) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


PRODUCT_SQL = f"""
INSERT INTO products (
    category_id, name_ar, name_en, slug, product_type,
    short_description, description, base_price, compare_at_price,
    status, is_featured, specs, published_at
) VALUES (
    (SELECT id FROM categories WHERE slug = '{CATEGORY_SLUG}'),
    %(name_ar)s, %(name_en)s, %(slug)s, 'sunglasses',
    %(short_description)s, %(description)s, %(price)s, %(compare_at)s,
    %(status)s, %(featured)s, %(specs)s::jsonb, now()
)
ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    specs = EXCLUDED.specs,
    published_at = COALESCE(products.published_at, now()),
    updated_at = now()
RETURNING id;
"""

VARIANT_EXISTS = "SELECT id FROM product_variants WHERE sku = %(sku)s;"

VARIANT_INSERT = """
INSERT INTO product_variants (
    product_id, sku, variant_key, color_name, lens_color, stock_quantity, low_stock_threshold, is_active
) VALUES (
    %(product_id)s, %(sku)s, %(variant_key)s, %(color_ar)s, %(color_ar)s, %(stock)s, 3, true
)
ON CONFLICT (sku) DO UPDATE SET
    color_name = EXCLUDED.color_name,
    lens_color = EXCLUDED.lens_color,
    is_active = true,
    updated_at = now();
"""

VARIANT_UPDATE = """
UPDATE product_variants SET
    color_name = %(color_ar)s,
    lens_color = %(color_ar)s,
    variant_key = %(variant_key)s,
    is_active = true,
    updated_at = now()
WHERE sku = %(sku)s;
"""

IMAGE_SQL = """
INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT %(product_id)s, %(url)s, %(alt)s, 0, true
WHERE NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = %(product_id)s AND url = %(url)s
);
"""


def build_params(row: dict[str, str]) -> dict:
    slug = row["slug"].strip()
    color_ar = (row.get("color_ar") or "").strip()
    color_en = (row.get("color_en") or "").strip() or "default"
    description = (row.get("description") or "").strip() or None
    specs = json.dumps(
        {"الحماية": "UV400", "العدسة": color_ar, "الإطار": "معدن خفيف"},
        ensure_ascii=False,
    )
    return {
        "slug": slug,
        "name_ar": row["name_ar"].strip(),
        "name_en": (row.get("name_en") or "").strip() or None,
        "short_description": (row.get("short_description") or description or "").strip() or None,
        "description": description,
        "price": money(row.get("price", "")) or 0,
        "compare_at": money(row.get("compare_at", "")),
        "status": (row.get("status") or "active").strip(),
        "featured": truthy(row.get("featured", "")),
        "specs": specs,
        "sku": slug.upper(),
        "variant_key": variant_key(color_en),
        "color_ar": color_ar,
        "stock": int((row.get("stock") or "0").strip() or 0),
        "url": row["image"].strip(),
        "alt": f"{row['name_ar'].strip()} — {color_ar}",
    }


def apply_to_db(rows: list[dict[str, str]], url: str, dry_run: bool) -> int:
    import psycopg2

    inserted = updated = images_added = 0
    conn = psycopg2.connect(url, connect_timeout=20)
    try:
        with conn:  # معاملة واحدة: نجاح كامل أو لا شيء
            with conn.cursor() as cur:
                cur.execute("SELECT count(*) FROM categories WHERE slug = %s;", (CATEGORY_SLUG,))
                if cur.fetchone()[0] == 0:
                    print(f"الفئة {CATEGORY_SLUG} غير موجودة في قاعدة البيانات.", file=sys.stderr)
                    return 1

                for raw in rows:
                    params = build_params(raw)

                    cur.execute("SELECT 1 FROM products WHERE slug = %s;", (params["slug"],))
                    existed = cur.fetchone() is not None

                    if dry_run:
                        print(f"{'UPDATE' if existed else 'INSERT'} {params['slug']} — {params['color_ar']} @ {params['price']}")
                        continue

                    cur.execute(PRODUCT_SQL, params)
                    product_id = cur.fetchone()[0]

                    cur.execute(VARIANT_EXISTS, {"sku": params["sku"]})
                    variant_exists = cur.fetchone() is not None
                    cur.execute(VARIANT_UPDATE if variant_exists else VARIANT_INSERT, {**params, "product_id": product_id})

                    cur.execute("SELECT 1 FROM product_images WHERE product_id = %s AND url = %s;",
                                (product_id, params["url"]))
                    if cur.fetchone() is None:
                        cur.execute(IMAGE_SQL, {**params, "product_id": product_id, "alt": params["alt"]})
                        images_added += 1

                    if existed:
                        updated += 1
                    else:
                        inserted += 1

                if dry_run:
                    conn.rollback()
    finally:
        conn.close()

    if dry_run:
        print(f"(تجربة فقط) {len(rows)} صفاً — لم يُكتب شيء.")
    else:
        print(f"منتجات جديدة: {inserted} | محدَّثة: {updated} | صور مضافة: {images_added}")
    return 0


def write_sql(rows: list[dict[str, str]], path: pathlib.Path = SQL_PATH) -> int:
    def q(value):
        if value is None:
            return "NULL"
        return "'" + str(value).replace("'", "''") + "'"

    lines = [
        "-- =====================================================================",
        "--  AURA — منتجات حقيقية مستوردة من صور PDF (83 نظارة)",
        "--  يُشغَّل بعد 001_core_tables.sql و 002_catalog.sql. قابل لإعادة التنفيذ.",
        "--  الأسماء والأسعار قابلة للتعديل في docs/products-import.csv",
        "--  ثم أعد توليد هذا الملف بـ: python scripts/import_products.py --sql",
        "-- =====================================================================",
        "BEGIN;",
        "",
    ]
    for raw in rows:
        p = build_params(raw)
        compare = "NULL" if p["compare_at"] is None else p["compare_at"]
        lines += [
            f"-- {p['slug']}",
            "INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,",
            "                      description, base_price, compare_at_price, status, is_featured, specs, published_at)",
            f"VALUES ((SELECT id FROM categories WHERE slug = '{CATEGORY_SLUG}'), {q(p['name_ar'])}, {q(p['name_en'])}, {q(p['slug'])},",
            f"        'sunglasses', {q(p['short_description'])}, {q(p['description'])}, {p['price']}, {compare},",
            f"        {q(p['status'])}, {'true' if p['featured'] else 'false'}, {q(p['specs'])}::jsonb, now())",
            "ON CONFLICT (slug) DO UPDATE SET",
            "  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,",
            "  short_description = EXCLUDED.short_description, description = EXCLUDED.description,",
            "  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,",
            "  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,",
            "  published_at = COALESCE(products.published_at, now()), updated_at = now();",
            "",
            "INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)",
            f"VALUES ((SELECT id FROM products WHERE slug = {q(p['slug'])}), {q(p['sku'])}, {q(p['variant_key'])},",
            f"        {q(p['color_ar'])}, {q(p['color_ar'])}, {p['stock']}, true)",
            "ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,",
            "  is_active = true, updated_at = now();",
            "",
            "INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)",
            f"SELECT p.id, {q(p['url'])}, {q(p['alt'])}, 0, true FROM products p WHERE p.slug = {q(p['slug'])}",
            "AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = "
            + q(p["url"]) + ");",
            "",
        ]

    lines += ["COMMIT;", ""]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"كُتب {path} ({len(rows)} منتجاً)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default=str(CSV_PATH))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--sql", action="store_true", help="توليد ملف SQL بدل التنفيذ المباشر")
    args = parser.parse_args()

    rows = read_rows(pathlib.Path(args.csv))

    if args.sql:
        return write_sql(rows)

    env = load_env()
    url = env.get("DATABASE_URL")
    if not url:
        print("DATABASE_URL غير موجود في ملف .env", file=sys.stderr)
        return 1

    return apply_to_db(rows, url, args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
