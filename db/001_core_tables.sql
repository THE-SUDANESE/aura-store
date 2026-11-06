-- =====================================================================
--  AURA — Core Tables (PostgreSQL 15+)
--  Migration: 001_core_tables.sql
--  ينشئ: users, products, product_variants, orders, order_items
--  ملاحظات:
--   * كل المبالغ numeric(10,2) وشاملة ضريبة القيمة المضافة 15%.
--   * order_items مضمّن لأنه الجدول الرابط الضروري لعلاقة M:N
--     بين orders و product_variants.
--   * categories تُنشأ في 002_catalog.sql؛ لذلك category_id يبقى
--     uuid بدون FK هنا (تُضاف القيود في الهجرة التالية).
-- =====================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- الأنواع (Enums) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'catalog_manager', 'store_admin', 'owner');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('sunglasses', 'clothing', 'accessory');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('cod', 'online');
  END IF;
END $$;

-- ---------- دالة تحديث updated_at ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- 1) users
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text NOT NULL,
  password_hash     text,                                  -- NULL = دخول اجتماعي فقط
  full_name         text NOT NULL,
  phone             text,                                  -- E.164: +9665XXXXXXXX
  role              user_role NOT NULL DEFAULT 'customer',
  email_verified_at timestamptz,
  is_active         boolean NOT NULL DEFAULT true,
  marketing_opt_in  boolean NOT NULL DEFAULT false,
  last_login_at     timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,
  CONSTRAINT users_email_shape CHECK (position('@' IN email) > 1),
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

-- المنع الحقيقي للتكرار: فريد بغض النظر عن حالة الأحرف
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (lower(email));
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role) WHERE deleted_at IS NULL;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 2) products
-- =====================================================================
CREATE TABLE IF NOT EXISTS products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- FK إلى categories(id) ON DELETE RESTRICT تُضاف في 002_catalog.sql
  category_id       uuid NOT NULL,
  name_ar           text NOT NULL,
  name_en           text,
  slug              text NOT NULL,
  product_type      product_type NOT NULL,
  short_description text,
  description       text,
  base_price        numeric(10,2) NOT NULL CHECK (base_price >= 0),  -- شامل VAT
  compare_at_price  numeric(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  currency          char(3) NOT NULL DEFAULT 'SAR',
  status            product_status NOT NULL DEFAULT 'draft',
  is_featured       boolean NOT NULL DEFAULT false,
  return_window_days smallint NOT NULL DEFAULT 14 CHECK (return_window_days BETWEEN 0 AND 90),
  specs             jsonb NOT NULL DEFAULT '{}'::jsonb,   -- frame_shape, uv, material ...
  meta_title        text,
  meta_description  text,
  published_at      timestamptz,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS products_category_status_idx
  ON products (category_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS products_featured_idx
  ON products (is_featured) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS products_specs_gin_idx
  ON products USING gin (specs);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 3) product_variants  — الوحدة القابلة للبيع + المخزون
-- =====================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku                 text NOT NULL,
  variant_key         text NOT NULL,          -- بصمة السمات: black/green/52
  color_name          text,
  color_hex           char(7) CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  size_label          text,
  frame_width_mm      smallint CHECK (frame_width_mm IS NULL OR frame_width_mm BETWEEN 80 AND 200),
  lens_color          text,
  price               numeric(10,2) CHECK (price IS NULL OR price >= 0),  -- NULL = base_price
  compare_at_price    numeric(10,2),
  stock_quantity      integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  weight_grams        integer CHECK (weight_grams IS NULL OR weight_grams > 0),
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_sku_unique UNIQUE (sku),
  CONSTRAINT product_variants_product_key_unique UNIQUE (product_id, variant_key),
  CONSTRAINT product_variants_compare_price_check
    CHECK (compare_at_price IS NULL OR price IS NULL OR compare_at_price >= price)
);

CREATE INDEX IF NOT EXISTS product_variants_product_active_idx
  ON product_variants (product_id, is_active);
-- استعلامات "نفد المخزون"/"مخزون منخفض" في لوحة التحكم
CREATE INDEX IF NOT EXISTS product_variants_low_stock_idx
  ON product_variants (stock_quantity)
  WHERE is_active AND stock_quantity <= low_stock_threshold;

CREATE TRIGGER product_variants_set_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 4) orders
-- =====================================================================
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text NOT NULL,                    -- AURA-2026-000123
  user_id          uuid REFERENCES users(id) ON DELETE SET NULL,  -- NULL = زائر
  guest_email      text,
  guest_phone      text,
  status           order_status NOT NULL DEFAULT 'pending',
  payment_status   payment_status NOT NULL DEFAULT 'unpaid',
  payment_method   payment_method NOT NULL DEFAULT 'cod',
  subtotal         numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_total   numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  shipping_total   numeric(10,2) NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
  tax_total        numeric(10,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),  -- جزء VAT المستخرج
  grand_total      numeric(10,2) NOT NULL CHECK (grand_total >= 0),
  currency         char(3) NOT NULL DEFAULT 'SAR',
  vat_rate         numeric(5,4) NOT NULL DEFAULT 0.1500 CHECK (vat_rate >= 0 AND vat_rate < 1),
  discount_code    text,
  shipping_address jsonb NOT NULL,        -- لقطة: {recipient_name, phone, city, district, street, ...}
  billing_address  jsonb,
  customer_note    text,
  admin_note       text,
  idempotency_key  text,                  -- منع تكرار الطلب عند إعادة الإرسال
  placed_at        timestamptz NOT NULL DEFAULT now(),
  confirmed_at     timestamptz,
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  cancelled_at     timestamptz,
  returned_at      timestamptz,
  cancel_reason    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_number_unique UNIQUE (order_number),
  -- الزائر يجب أن يترك وسيلة تواصل واحدة على الأقل
  CONSTRAINT orders_guest_contact
    CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL OR guest_phone IS NOT NULL),
  -- الأسعار شاملة VAT: الإجمالي = الفرعي − الخصم + الشحن
  CONSTRAINT orders_totals_consistent
    CHECK (grand_total = subtotal - discount_total + shipping_total),
  -- جزء الضريبة لا يمكن أن يتجاوز الإجمالي
  CONSTRAINT orders_tax_within_total
    CHECK (tax_total <= grand_total),
  -- الخصم لا يتجاوز قيمة البنود
  CONSTRAINT orders_discount_within_subtotal
    CHECK (discount_total <= subtotal)
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_unique_idx
  ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_placed_idx
  ON orders (user_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_placed_idx
  ON orders (status, placed_at DESC);
CREATE INDEX IF NOT EXISTS orders_guest_email_idx
  ON orders (lower(guest_email)) WHERE guest_email IS NOT NULL;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 5) order_items — حلقة الوصل M:N بين orders و product_variants
-- =====================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id               uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  -- مرجع حي اختياري: يبقى NULL إذا حُذف المتغير، والبيانات محفوظة بالـ Snapshot
  variant_id             uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_id             uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot  text NOT NULL,
  variant_label_snapshot text,                        -- "أسود / عدسة خضراء / 52mm"
  sku_snapshot           text NOT NULL,
  unit_price             numeric(10,2) NOT NULL CHECK (unit_price >= 0),  -- شامل VAT
  quantity               integer NOT NULL CHECK (quantity > 0),
  line_discount          numeric(10,2) NOT NULL DEFAULT 0 CHECK (line_discount >= 0),
  line_total             numeric(10,2) NOT NULL CHECK (line_total >= 0),
  returned_quantity      integer NOT NULL DEFAULT 0 CHECK (returned_quantity >= 0),
  created_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_line_total_consistent
    CHECK (line_total = (unit_price * quantity) - line_discount),
  CONSTRAINT order_items_returned_within_quantity
    CHECK (returned_quantity <= quantity)
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_variant_idx ON order_items (variant_id);

COMMIT;
