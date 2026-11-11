-- كوبونات الخصم: نوعان (نسبة/مبلغ ثابت) مع حدود استخدام وتواريخ صلاحية
DO $$ BEGIN
  CREATE TYPE coupon_type AS ENUM ('percent', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  type coupon_type NOT NULL,
  value numeric(10,2) NOT NULL,
  min_subtotal numeric(10,2) NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupons_is_active_expires_at_idx ON coupons(is_active, expires_at);
