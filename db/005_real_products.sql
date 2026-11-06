-- =====================================================================
--  AURA — منتجات حقيقية مستوردة من صور PDF (83 نظارة)
--  يُشغَّل بعد 001_core_tables.sql و 002_catalog.sql. قابل لإعادة التنفيذ.
--  الأسماء والأسعار قابلة للتعديل في docs/products-import.csv
--  ثم أعد توليد هذا الملف بـ: python scripts/import_products.py --sql
-- =====================================================================
BEGIN;

-- aura-sun-01
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 01 — أزرق متدرج', 'AURA Sun 01 — Blue Gradient', 'aura-sun-01',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أزرق متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-01'), 'AURA-SUN-01', 'blue-gradient',
        'أزرق متدرج', 'أزرق متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-01.jpg', 'AURA SUN 01 — أزرق متدرج — أزرق متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-01'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-01.jpg');

-- aura-sun-02
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 02 — بني دافئ', 'AURA Sun 02 — Warm Brown', 'aura-sun-02',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بني دافئ، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بني دافئ، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بني دافئ", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-02'), 'AURA-SUN-02', 'warm-brown',
        'بني دافئ', 'بني دافئ', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-02.jpg', 'AURA SUN 02 — بني دافئ — بني دافئ', 0, true FROM products p WHERE p.slug = 'aura-sun-02'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-02.jpg');

-- aura-sun-03
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 03 — بنفسجي متدرج', 'AURA Sun 03 — Purple Gradient', 'aura-sun-03',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-03'), 'AURA-SUN-03', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-03.jpg', 'AURA SUN 03 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-03'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-03.jpg');

-- aura-sun-04
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 04 — بنفسجي متدرج', 'AURA Sun 04 — Purple Gradient', 'aura-sun-04',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-04'), 'AURA-SUN-04', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-04.jpg', 'AURA SUN 04 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-04'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-04.jpg');

-- aura-sun-05
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 05 — رمادي متدرج', 'AURA Sun 05 — Grey Gradient', 'aura-sun-05',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-05'), 'AURA-SUN-05', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-05.jpg', 'AURA SUN 05 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-05'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-05.jpg');

-- aura-sun-06
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 06 — بني دافئ', 'AURA Sun 06 — Warm Brown', 'aura-sun-06',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بني دافئ، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بني دافئ، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بني دافئ", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-06'), 'AURA-SUN-06', 'warm-brown',
        'بني دافئ', 'بني دافئ', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-06.jpg', 'AURA SUN 06 — بني دافئ — بني دافئ', 0, true FROM products p WHERE p.slug = 'aura-sun-06'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-06.jpg');

-- aura-sun-07
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 07 — رمادي متدرج', 'AURA Sun 07 — Grey Gradient', 'aura-sun-07',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-07'), 'AURA-SUN-07', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-07.jpg', 'AURA SUN 07 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-07'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-07.jpg');

-- aura-sun-08
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 08 — رمادي متدرج', 'AURA Sun 08 — Grey Gradient', 'aura-sun-08',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-08'), 'AURA-SUN-08', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-08.jpg', 'AURA SUN 08 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-08'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-08.jpg');

-- aura-sun-09
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 09 — أزرق متدرج', 'AURA Sun 09 — Blue Gradient', 'aura-sun-09',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أزرق متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-09'), 'AURA-SUN-09', 'blue-gradient',
        'أزرق متدرج', 'أزرق متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-09.jpg', 'AURA SUN 09 — أزرق متدرج — أزرق متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-09'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-09.jpg');

-- aura-sun-10
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 10 — رمادي متدرج', 'AURA Sun 10 — Grey Gradient', 'aura-sun-10',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-10'), 'AURA-SUN-10', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-10.jpg', 'AURA SUN 10 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-10'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-10.jpg');

-- aura-sun-11
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 11 — أزرق متدرج', 'AURA Sun 11 — Blue Gradient', 'aura-sun-11',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أزرق متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-11'), 'AURA-SUN-11', 'blue-gradient',
        'أزرق متدرج', 'أزرق متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-11.jpg', 'AURA SUN 11 — أزرق متدرج — أزرق متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-11'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-11.jpg');

-- aura-sun-12
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 12 — أسود', 'AURA Sun 12 — Black', 'aura-sun-12',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-12'), 'AURA-SUN-12', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-12.jpg', 'AURA SUN 12 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-12'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-12.jpg');

-- aura-sun-13
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 13 — أحمر داكن', 'AURA Sun 13 — Deep Red', 'aura-sun-13',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-13'), 'AURA-SUN-13', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-13.jpg', 'AURA SUN 13 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-13'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-13.jpg');

-- aura-sun-14
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 14 — بنفسجي متدرج', 'AURA Sun 14 — Purple Gradient', 'aura-sun-14',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-14'), 'AURA-SUN-14', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-14.jpg', 'AURA SUN 14 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-14'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-14.jpg');

-- aura-sun-15
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 15 — بنفسجي متدرج', 'AURA Sun 15 — Purple Gradient', 'aura-sun-15',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-15'), 'AURA-SUN-15', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-15.jpg', 'AURA SUN 15 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-15'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-15.jpg');

-- aura-sun-16
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 16 — أسود', 'AURA Sun 16 — Black', 'aura-sun-16',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-16'), 'AURA-SUN-16', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-16.jpg', 'AURA SUN 16 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-16'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-16.jpg');

-- aura-sun-17
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 17 — أسود', 'AURA Sun 17 — Black', 'aura-sun-17',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-17'), 'AURA-SUN-17', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-17.jpg', 'AURA SUN 17 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-17'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-17.jpg');

-- aura-sun-18
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 18 — أحمر داكن', 'AURA Sun 18 — Deep Red', 'aura-sun-18',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-18'), 'AURA-SUN-18', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-18.jpg', 'AURA SUN 18 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-18'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-18.jpg');

-- aura-sun-19
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 19 — بنفسجي متدرج', 'AURA Sun 19 — Purple Gradient', 'aura-sun-19',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-19'), 'AURA-SUN-19', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-19.jpg', 'AURA SUN 19 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-19'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-19.jpg');

-- aura-sun-20
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 20 — رمادي متدرج', 'AURA Sun 20 — Grey Gradient', 'aura-sun-20',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-20'), 'AURA-SUN-20', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-20.jpg', 'AURA SUN 20 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-20'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-20.jpg');

-- aura-sun-21
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 21 — أسود', 'AURA Sun 21 — Black', 'aura-sun-21',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-21'), 'AURA-SUN-21', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-21.jpg', 'AURA SUN 21 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-21'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-21.jpg');

-- aura-sun-22
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 22 — بنفسجي متدرج', 'AURA Sun 22 — Purple Gradient', 'aura-sun-22',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-22'), 'AURA-SUN-22', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-22.jpg', 'AURA SUN 22 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-22'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-22.jpg');

-- aura-sun-23
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 23 — رمادي متدرج', 'AURA Sun 23 — Grey Gradient', 'aura-sun-23',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-23'), 'AURA-SUN-23', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-23.jpg', 'AURA SUN 23 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-23'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-23.jpg');

-- aura-sun-24
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 24 — عسلي', 'AURA Sun 24 — Amber', 'aura-sun-24',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-24'), 'AURA-SUN-24', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-24.jpg', 'AURA SUN 24 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-24'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-24.jpg');

-- aura-sun-25
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 25 — بنفسجي متدرج', 'AURA Sun 25 — Purple Gradient', 'aura-sun-25',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-25'), 'AURA-SUN-25', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-25.jpg', 'AURA SUN 25 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-25'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-25.jpg');

-- aura-sun-26
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 26 — أحمر داكن', 'AURA Sun 26 — Deep Red', 'aura-sun-26',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-26'), 'AURA-SUN-26', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-26.jpg', 'AURA SUN 26 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-26'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-26.jpg');

-- aura-sun-27
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 27 — أحمر داكن', 'AURA Sun 27 — Deep Red', 'aura-sun-27',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-27'), 'AURA-SUN-27', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-27.jpg', 'AURA SUN 27 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-27'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-27.jpg');

-- aura-sun-28
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 28 — بنفسجي متدرج', 'AURA Sun 28 — Purple Gradient', 'aura-sun-28',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-28'), 'AURA-SUN-28', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-28.jpg', 'AURA SUN 28 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-28'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-28.jpg');

-- aura-sun-29
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 29 — أزرق متدرج', 'AURA Sun 29 — Blue Gradient', 'aura-sun-29',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أزرق متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أزرق متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-29'), 'AURA-SUN-29', 'blue-gradient',
        'أزرق متدرج', 'أزرق متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-29.jpg', 'AURA SUN 29 — أزرق متدرج — أزرق متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-29'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-29.jpg');

-- aura-sun-30
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 30 — رمادي متدرج', 'AURA Sun 30 — Grey Gradient', 'aura-sun-30',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-30'), 'AURA-SUN-30', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-30.jpg', 'AURA SUN 30 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-30'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-30.jpg');

-- aura-sun-31
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 31 — بنفسجي متدرج', 'AURA Sun 31 — Purple Gradient', 'aura-sun-31',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-31'), 'AURA-SUN-31', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-31.jpg', 'AURA SUN 31 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-31'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-31.jpg');

-- aura-sun-32
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 32 — أحمر داكن', 'AURA Sun 32 — Deep Red', 'aura-sun-32',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-32'), 'AURA-SUN-32', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-32.jpg', 'AURA SUN 32 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-32'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-32.jpg');

-- aura-sun-33
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 33 — أحمر داكن', 'AURA Sun 33 — Deep Red', 'aura-sun-33',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-33'), 'AURA-SUN-33', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-33.jpg', 'AURA SUN 33 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-33'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-33.jpg');

-- aura-sun-34
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 34 — بنفسجي متدرج', 'AURA Sun 34 — Purple Gradient', 'aura-sun-34',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-34'), 'AURA-SUN-34', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-34.jpg', 'AURA SUN 34 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-34'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-34.jpg');

-- aura-sun-35
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 35 — رمادي متدرج', 'AURA Sun 35 — Grey Gradient', 'aura-sun-35',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-35'), 'AURA-SUN-35', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-35.jpg', 'AURA SUN 35 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-35'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-35.jpg');

-- aura-sun-36
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 36 — أحمر داكن', 'AURA Sun 36 — Deep Red', 'aura-sun-36',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-36'), 'AURA-SUN-36', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-36.jpg', 'AURA SUN 36 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-36'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-36.jpg');

-- aura-sun-37
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 37 — أسود', 'AURA Sun 37 — Black', 'aura-sun-37',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-37'), 'AURA-SUN-37', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-37.jpg', 'AURA SUN 37 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-37'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-37.jpg');

-- aura-sun-38
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 38 — بنفسجي متدرج', 'AURA Sun 38 — Purple Gradient', 'aura-sun-38',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-38'), 'AURA-SUN-38', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-38.jpg', 'AURA SUN 38 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-38'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-38.jpg');

-- aura-sun-39
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 39 — بنفسجي متدرج', 'AURA Sun 39 — Purple Gradient', 'aura-sun-39',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-39'), 'AURA-SUN-39', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-39.jpg', 'AURA SUN 39 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-39'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-39.jpg');

-- aura-sun-40
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 40 — رمادي متدرج', 'AURA Sun 40 — Grey Gradient', 'aura-sun-40',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-40'), 'AURA-SUN-40', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-40.jpg', 'AURA SUN 40 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-40'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-40.jpg');

-- aura-sun-41
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 41 — بنفسجي متدرج', 'AURA Sun 41 — Purple Gradient', 'aura-sun-41',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-41'), 'AURA-SUN-41', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-41.jpg', 'AURA SUN 41 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-41'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-41.jpg');

-- aura-sun-42
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 42 — بنفسجي متدرج', 'AURA Sun 42 — Purple Gradient', 'aura-sun-42',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-42'), 'AURA-SUN-42', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-42.jpg', 'AURA SUN 42 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-42'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-42.jpg');

-- aura-sun-43
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 43 — أسود', 'AURA Sun 43 — Black', 'aura-sun-43',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-43'), 'AURA-SUN-43', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-43.jpg', 'AURA SUN 43 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-43'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-43.jpg');

-- aura-sun-44
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 44 — أسود', 'AURA Sun 44 — Black', 'aura-sun-44',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-44'), 'AURA-SUN-44', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-44.jpg', 'AURA SUN 44 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-44'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-44.jpg');

-- aura-sun-45
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 45 — أحمر داكن', 'AURA Sun 45 — Deep Red', 'aura-sun-45',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-45'), 'AURA-SUN-45', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-45.jpg', 'AURA SUN 45 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-45'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-45.jpg');

-- aura-sun-46
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 46 — بنفسجي متدرج', 'AURA Sun 46 — Purple Gradient', 'aura-sun-46',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-46'), 'AURA-SUN-46', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-46.jpg', 'AURA SUN 46 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-46'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-46.jpg');

-- aura-sun-47
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 47 — أحمر داكن', 'AURA Sun 47 — Deep Red', 'aura-sun-47',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-47'), 'AURA-SUN-47', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-47.jpg', 'AURA SUN 47 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-47'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-47.jpg');

-- aura-sun-48
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 48 — أحمر داكن', 'AURA Sun 48 — Deep Red', 'aura-sun-48',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-48'), 'AURA-SUN-48', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-48.jpg', 'AURA SUN 48 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-48'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-48.jpg');

-- aura-sun-49
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 49 — أسود', 'AURA Sun 49 — Black', 'aura-sun-49',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-49'), 'AURA-SUN-49', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-49.jpg', 'AURA SUN 49 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-49'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-49.jpg');

-- aura-sun-50
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 50 — بنفسجي متدرج', 'AURA Sun 50 — Purple Gradient', 'aura-sun-50',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-50'), 'AURA-SUN-50', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-50.jpg', 'AURA SUN 50 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-50'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-50.jpg');

-- aura-sun-51
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 51 — أسود', 'AURA Sun 51 — Black', 'aura-sun-51',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-51'), 'AURA-SUN-51', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-51.jpg', 'AURA SUN 51 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-51'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-51.jpg');

-- aura-sun-52
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 52 — أسود', 'AURA Sun 52 — Black', 'aura-sun-52',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-52'), 'AURA-SUN-52', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-52.jpg', 'AURA SUN 52 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-52'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-52.jpg');

-- aura-sun-53
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 53 — رمادي متدرج', 'AURA Sun 53 — Grey Gradient', 'aura-sun-53',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة رمادي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "رمادي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-53'), 'AURA-SUN-53', 'grey-gradient',
        'رمادي متدرج', 'رمادي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-53.jpg', 'AURA SUN 53 — رمادي متدرج — رمادي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-53'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-53.jpg');

-- aura-sun-54
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 54 — بنفسجي متدرج', 'AURA Sun 54 — Purple Gradient', 'aura-sun-54',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-54'), 'AURA-SUN-54', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-54.jpg', 'AURA SUN 54 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-54'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-54.jpg');

-- aura-sun-55
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 55 — أحمر داكن', 'AURA Sun 55 — Deep Red', 'aura-sun-55',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-55'), 'AURA-SUN-55', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-55.jpg', 'AURA SUN 55 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-55'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-55.jpg');

-- aura-sun-56
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 56 — بنفسجي متدرج', 'AURA Sun 56 — Purple Gradient', 'aura-sun-56',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-56'), 'AURA-SUN-56', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-56.jpg', 'AURA SUN 56 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-56'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-56.jpg');

-- aura-sun-57
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 57 — أسود', 'AURA Sun 57 — Black', 'aura-sun-57',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-57'), 'AURA-SUN-57', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-57.jpg', 'AURA SUN 57 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-57'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-57.jpg');

-- aura-sun-58
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 58 — أسود', 'AURA Sun 58 — Black', 'aura-sun-58',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-58'), 'AURA-SUN-58', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-58.jpg', 'AURA SUN 58 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-58'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-58.jpg');

-- aura-sun-59
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 59 — بنفسجي متدرج', 'AURA Sun 59 — Purple Gradient', 'aura-sun-59',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-59'), 'AURA-SUN-59', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-59.jpg', 'AURA SUN 59 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-59'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-59.jpg');

-- aura-sun-60
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 60 — أسود', 'AURA Sun 60 — Black', 'aura-sun-60',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-60'), 'AURA-SUN-60', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-60.jpg', 'AURA SUN 60 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-60'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-60.jpg');

-- aura-sun-61
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 61 — بنفسجي متدرج', 'AURA Sun 61 — Purple Gradient', 'aura-sun-61',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-61'), 'AURA-SUN-61', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-61.jpg', 'AURA SUN 61 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-61'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-61.jpg');

-- aura-sun-62
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 62 — أحمر داكن', 'AURA Sun 62 — Deep Red', 'aura-sun-62',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-62'), 'AURA-SUN-62', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-62.jpg', 'AURA SUN 62 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-62'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-62.jpg');

-- aura-sun-63
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 63 — أسود', 'AURA Sun 63 — Black', 'aura-sun-63',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-63'), 'AURA-SUN-63', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-63.jpg', 'AURA SUN 63 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-63'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-63.jpg');

-- aura-sun-64
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 64 — بنفسجي متدرج', 'AURA Sun 64 — Purple Gradient', 'aura-sun-64',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-64'), 'AURA-SUN-64', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-64.jpg', 'AURA SUN 64 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-64'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-64.jpg');

-- aura-sun-65
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 65 — عسلي', 'AURA Sun 65 — Amber', 'aura-sun-65',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-65'), 'AURA-SUN-65', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-65.jpg', 'AURA SUN 65 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-65'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-65.jpg');

-- aura-sun-66
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 66 — أخضر فاتح', 'AURA Sun 66 — Light Green', 'aura-sun-66',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أخضر فاتح، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أخضر فاتح، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أخضر فاتح", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-66'), 'AURA-SUN-66', 'light-green',
        'أخضر فاتح', 'أخضر فاتح', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-66.jpg', 'AURA SUN 66 — أخضر فاتح — أخضر فاتح', 0, true FROM products p WHERE p.slug = 'aura-sun-66'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-66.jpg');

-- aura-sun-67
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 67 — بنفسجي متدرج', 'AURA Sun 67 — Purple Gradient', 'aura-sun-67',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-67'), 'AURA-SUN-67', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-67.jpg', 'AURA SUN 67 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-67'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-67.jpg');

-- aura-sun-68
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 68 — أسود', 'AURA Sun 68 — Black', 'aura-sun-68',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-68'), 'AURA-SUN-68', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-68.jpg', 'AURA SUN 68 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-68'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-68.jpg');

-- aura-sun-69
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 69 — بنفسجي متدرج', 'AURA Sun 69 — Purple Gradient', 'aura-sun-69',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-69'), 'AURA-SUN-69', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-69.jpg', 'AURA SUN 69 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-69'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-69.jpg');

-- aura-sun-70
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 70 — أحمر داكن', 'AURA Sun 70 — Deep Red', 'aura-sun-70',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-70'), 'AURA-SUN-70', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-70.jpg', 'AURA SUN 70 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-70'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-70.jpg');

-- aura-sun-71
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 71 — عسلي', 'AURA Sun 71 — Amber', 'aura-sun-71',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-71'), 'AURA-SUN-71', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-71.jpg', 'AURA SUN 71 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-71'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-71.jpg');

-- aura-sun-72
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 72 — عسلي', 'AURA Sun 72 — Amber', 'aura-sun-72',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-72'), 'AURA-SUN-72', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-72.jpg', 'AURA SUN 72 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-72'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-72.jpg');

-- aura-sun-73
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 73 — عسلي', 'AURA Sun 73 — Amber', 'aura-sun-73',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-73'), 'AURA-SUN-73', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-73.jpg', 'AURA SUN 73 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-73'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-73.jpg');

-- aura-sun-74
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 74 — أسود', 'AURA Sun 74 — Black', 'aura-sun-74',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-74'), 'AURA-SUN-74', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-74.jpg', 'AURA SUN 74 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-74'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-74.jpg');

-- aura-sun-75
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 75 — بنفسجي متدرج', 'AURA Sun 75 — Purple Gradient', 'aura-sun-75',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-75'), 'AURA-SUN-75', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-75.jpg', 'AURA SUN 75 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-75'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-75.jpg');

-- aura-sun-76
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 76 — أسود', 'AURA Sun 76 — Black', 'aura-sun-76',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-76'), 'AURA-SUN-76', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-76.jpg', 'AURA SUN 76 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-76'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-76.jpg');

-- aura-sun-77
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 77 — بنفسجي متدرج', 'AURA Sun 77 — Purple Gradient', 'aura-sun-77',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-77'), 'AURA-SUN-77', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-77.jpg', 'AURA SUN 77 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-77'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-77.jpg');

-- aura-sun-78
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 78 — بنفسجي متدرج', 'AURA Sun 78 — Purple Gradient', 'aura-sun-78',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-78'), 'AURA-SUN-78', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-78.jpg', 'AURA SUN 78 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-78'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-78.jpg');

-- aura-sun-79
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 79 — عسلي', 'AURA Sun 79 — Amber', 'aura-sun-79',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-79'), 'AURA-SUN-79', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-79.jpg', 'AURA SUN 79 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-79'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-79.jpg');

-- aura-sun-80
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 80 — أحمر داكن', 'AURA Sun 80 — Deep Red', 'aura-sun-80',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أحمر داكن، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أحمر داكن", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-80'), 'AURA-SUN-80', 'deep-red',
        'أحمر داكن', 'أحمر داكن', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-80.jpg', 'AURA SUN 80 — أحمر داكن — أحمر داكن', 0, true FROM products p WHERE p.slug = 'aura-sun-80'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-80.jpg');

-- aura-sun-81
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 81 — أسود', 'AURA Sun 81 — Black', 'aura-sun-81',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة أسود، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "أسود", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-81'), 'AURA-SUN-81', 'black',
        'أسود', 'أسود', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-81.jpg', 'AURA SUN 81 — أسود — أسود', 0, true FROM products p WHERE p.slug = 'aura-sun-81'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-81.jpg');

-- aura-sun-82
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 82 — عسلي', 'AURA Sun 82 — Amber', 'aura-sun-82',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة عسلي، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "عسلي", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-82'), 'AURA-SUN-82', 'amber',
        'عسلي', 'عسلي', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-82.jpg', 'AURA SUN 82 — عسلي — عسلي', 0, true FROM products p WHERE p.slug = 'aura-sun-82'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-82.jpg');

-- aura-sun-83
INSERT INTO products (category_id, name_ar, name_en, slug, product_type, short_description,
                      description, base_price, compare_at_price, status, is_featured, specs, published_at)
VALUES ((SELECT id FROM categories WHERE slug = 'sunglasses'), 'AURA SUN 83 — بنفسجي متدرج', 'AURA Sun 83 — Purple Gradient', 'aura-sun-83',
        'sunglasses', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 'نظارة شمسية بإطار معدني خفيف وعدسة بنفسجي متدرج، تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان.', 299.0, NULL,
        'active', false, '{"الحماية": "UV400", "العدسة": "بنفسجي متدرج", "الإطار": "معدن خفيف"}'::jsonb, now())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
  status = EXCLUDED.status, is_featured = EXCLUDED.is_featured, specs = EXCLUDED.specs,
  published_at = COALESCE(products.published_at, now()), updated_at = now();

INSERT INTO product_variants (product_id, sku, variant_key, color_name, lens_color, stock_quantity, is_active)
VALUES ((SELECT id FROM products WHERE slug = 'aura-sun-83'), 'AURA-SUN-83', 'purple-gradient',
        'بنفسجي متدرج', 'بنفسجي متدرج', 10, true)
ON CONFLICT (sku) DO UPDATE SET color_name = EXCLUDED.color_name, lens_color = EXCLUDED.lens_color,
  is_active = true, updated_at = now();

INSERT INTO product_images (product_id, url, alt_ar, sort_order, is_primary)
SELECT p.id, '/products/real/aura-sun-83.jpg', 'AURA SUN 83 — بنفسجي متدرج — بنفسجي متدرج', 0, true FROM products p WHERE p.slug = 'aura-sun-83'
AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = '/products/real/aura-sun-83.jpg');

COMMIT;
