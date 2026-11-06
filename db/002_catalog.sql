-- =====================================================================
--  AURA — Catalog Tables
--  Migration: 002_catalog.sql
--  ينشئ: categories, collections, collection_products, product_images,
--        inventory_movements — ويضيف FK لـ products.category_id
--  يُشغَّل بعد 001_core_tables.sql
-- =====================================================================

BEGIN;

-- ---------- الفئات (هرمية) ----------
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_ar     text NOT NULL,
  name_en     text,
  slug        text NOT NULL,
  description text,
  image_url   text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories (parent_id);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- اكتمال العلاقة categories 1:N products (كانت مؤجلة في 001)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_fkey') THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- ---------- المجموعات التسويقية (M:N مع المنتجات) ----------
CREATE TABLE IF NOT EXISTS collections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL,
  title_ar       text NOT NULL,
  title_en       text,
  description    text,
  hero_image_url text,
  starts_at      timestamptz,
  ends_at        timestamptz,
  is_active      boolean NOT NULL DEFAULT true,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_slug_unique UNIQUE (slug)
);

CREATE TRIGGER collections_set_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS collection_products (
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS collection_products_product_idx
  ON collection_products (product_id);

-- ---------- صور المنتجات ----------
CREATE TABLE IF NOT EXISTS product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  url        text NOT NULL,
  alt_ar     text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_sort_idx
  ON product_images (product_id, sort_order);

-- صورة رئيسية واحدة فقط لكل منتج
CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_idx
  ON product_images (product_id) WHERE is_primary;

-- ---------- سجل حركة المخزون ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_reason') THEN
    CREATE TYPE inventory_reason AS ENUM (
      'purchase', 'cancel', 'return', 'restock', 'manual_adjustment'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  delta      integer NOT NULL CHECK (delta <> 0),
  reason     inventory_reason NOT NULL,
  order_id   uuid REFERENCES orders(id) ON DELETE SET NULL,
  note       text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_movements_variant_idx
  ON inventory_movements (variant_id, created_at DESC);

COMMIT;
