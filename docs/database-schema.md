# مخطط قاعدة البيانات (Database Schema) — AURA

**الإصدار:** 1.0 — مبني على [وثيقة المتطلبات](requirements-v1.md)
**المنصة:** PostgreSQL 15+ (علائقي)
**العملة:** SAR — **الأسعار شاملة VAT 15%**
**الترميز:** أسماء الجداول والأعمدة بالإنجليزية `snake_case`، والنصوص العربية في أعمدة `_ar`.

---

## 1. المبادئ التصميمية (قبل الجداول)

1. **المال:** كل الحقول المالية `numeric(10,2)` — **لا تستخدم `float`** أبداً لتجنب أخطاء التقريب.
2. **VAT مشمولة:** السعر المخزّن (`base_price` / `variants.price` / `order_items.unit_price`) هو **السعر النهائي الشامل للضريبة**. تُخزَّن `orders.tax_total` كمعلومة مستخرجة للفاتورة:
   `tax_total = grand_total − (grand_total ÷ (1 + vat_rate))`
3. **المعرّفات:** `uuid` مع `gen_random_uuid()` لتجنّب تسريب تسلسل المبيعات عبر الـ URL.
4. **اللقطات (Snapshots):** الطلب لا يعتمد على بيانات المنتج الحالية — السعر والاسم والـ SKU تُنسخ في `order_items`. تغيير سعر منتج لاحقاً **لا يعدّل تاريخ الطلبات**.
5. **الحذف:** الحذف المنطقي (`deleted_at`) للمنتجات والمستخدمين، والحذف الفعلي ممنوع على الطلبات؛ لذلك `order_items.variant_id` يستخدم `ON DELETE SET NULL` مع الاحتفاظ بالـ Snapshot.
6. **المخزون:** الكمية على مستوى `product_variants` (مقاس/لون) وليس على المنتج.
7. **التوقيت:** `timestamptz` دائماً (UTC في التخزين، وتُعرض بتوقيت الرياض `Asia/Riyadh`).

---

## 2. قائمة الجداول (Tables & Columns)

### 2.1 الهوية والعملاء

**`users`** — كل مستخدمي النظام (عملاء + إدارة) بدور واحد.

| العمود | النوع | القيود / ملاحظات |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `email` | `text` | NOT NULL — فريد عبر `UNIQUE INDEX ON lower(email)` |
| `password_hash` | `text` | NULL مسموح (حساب دخول اجتماعي فقط) — Argon2id |
| `full_name` | `text` | NOT NULL |
| `phone` | `text` | NULL — بصيغة E.164 (`+9665…`) |
| `role` | `user_role` | ENUM: `customer, catalog_manager, store_admin, owner` — default `customer` |
| `email_verified_at` | `timestamptz` | NULL |
| `is_active` | `boolean` | default `true` |
| `marketing_opt_in` | `boolean` | default `false` |
| `last_login_at` | `timestamptz` | NULL |
| `created_at` / `updated_at` | `timestamptz` | default `now()` |
| `deleted_at` | `timestamptz` | NULL — حذف منطقي |

**`addresses`** — عناوين العميل المحفوظة.

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `users(id)` `ON DELETE CASCADE`, NOT NULL |
| `label` | `text` | "المنزل"، "العمل" |
| `recipient_name` | `text` | NOT NULL |
| `phone` | `text` | NOT NULL |
| `city` / `district` / `street` | `text` | NOT NULL |
| `building_no` / `postal_code` | `text` | NULL |
| `is_default` | `boolean` | default `false` — فريد جزئياً لكل مستخدم |
| `created_at` | `timestamptz` | |

**`sessions`** — جلسات المصادقة (تدوير الرموز وإبطالها).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `users(id)` `ON DELETE CASCADE` |
| `refresh_token_hash` | `text` | NOT NULL — الهاش فقط، لا الرمز نفسه |
| `user_agent` / `ip` | `text` / `inet` | للتدقيق |
| `expires_at` | `timestamptz` | NOT NULL |
| `revoked_at` | `timestamptz` | NULL |
| `created_at` | `timestamptz` | |

### 2.2 الكتالوج

**`categories`** — تصنيفات هرمية (نظارات / أزياء).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `parent_id` | `uuid` | FK → `categories(id)` `ON DELETE SET NULL` — علاقة ذاتية |
| `name_ar` / `name_en` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE — للروابط |
| `description` | `text` | NULL |
| `image_url` | `text` | NULL |
| `sort_order` | `integer` | default `0` |
| `is_active` | `boolean` | default `true` |
| `created_at` / `updated_at` | `timestamptz` | |

**`collections`** — مجموعات تسويقية (مثال: صيف 2026). **`collection_products`** = جدول ربط M:N.

| العمود (`collections`) | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `slug` | `text` | UNIQUE |
| `title_ar` / `title_en` | `text` | NOT NULL |
| `description` | `text` | NULL |
| `hero_image_url` | `text` | NULL |
| `starts_at` / `ends_at` | `timestamptz` | نافذة الظهور |
| `is_active` | `boolean` | default `true` |
| `sort_order` | `integer` | |

| العمود (`collection_products`) | النوع | ملاحظات |
|---|---|---|
| `collection_id` | `uuid` | FK → `collections` `ON DELETE CASCADE` |
| `product_id` | `uuid` | FK → `products` `ON DELETE CASCADE` |
| `sort_order` | `integer` | default `0` |
| — | — | **PK مركّب** (`collection_id`, `product_id`) |

**`products`** — المنتج الأب (بلا سعر/مخزون خاص بالمتغير إن اختلف).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `category_id` | `uuid` | FK → `categories(id)` `ON DELETE RESTRICT`, NOT NULL |
| `name_ar` / `name_en` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `product_type` | `product_type` | ENUM: `sunglasses, clothing, accessory` |
| `short_description` / `description` | `text` | NULL |
| `base_price` | `numeric(10,2)` | NOT NULL — سعر العرض الشامل للضريبة (يُستخدم إن لم يوجد سعر للمتغير) |
| `compare_at_price` | `numeric(10,2)` | NULL — السعر قبل الخصم (للعرض فقط) |
| `currency` | `char(3)` | default `'SAR'` |
| `status` | `product_status` | ENUM: `draft, active, archived` — default `draft` |
| `is_featured` | `boolean` | default `false` |
| `return_window_days` | `smallint` | default `14` |
| `specs` | `jsonb` | مواصفات مرنة: `{"frame_shape":"aviator","uv":"UV400","material":"acetate"}` |
| `meta_title` / `meta_description` | `text` | SEO |
| `published_at` | `timestamptz` | NULL |
| `created_at` / `updated_at` / `deleted_at` | `timestamptz` | |

**`product_variants`** — الوحدة القابلة للبيع (SKU) والمخزون.

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `product_id` | `uuid` | FK → `products(id)` `ON DELETE CASCADE`, NOT NULL |
| `sku` | `text` | NOT NULL, UNIQUE عالمياً (مثال: `AURA-SG-001-BLK`) |
| `variant_key` | `text` | NOT NULL — بصمة موحّدة للسمات (مثال: `black/green/52`) |
| `color_name` | `text` | لون الإطار/القطعة |
| `color_hex` | `char(7)` | `#1A1A1A` |
| `size_label` | `text` | `S / M / L / 52mm` |
| `frame_width_mm` | `smallint` | للنظارات فقط |
| `lens_color` | `text` | للنظارات فقط |
| `price` | `numeric(10,2)` | NULL = استخدم `products.base_price` |
| `compare_at_price` | `numeric(10,2)` | NULL |
| `stock_quantity` | `integer` | NOT NULL, default `0`, `CHECK (>= 0)` |
| `low_stock_threshold` | `integer` | default `3` |
| `weight_grams` | `integer` | للشحن |
| `is_active` | `boolean` | default `true` |
| `created_at` / `updated_at` | `timestamptz` | |
| — | — | **UNIQUE** (`product_id`, `variant_key`) |

**`product_images`**

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `product_id` | `uuid` | FK → `products` `ON DELETE CASCADE` |
| `variant_id` | `uuid` | NULL — صورة خاصة بلون معيّن |
| `url` | `text` | NOT NULL (CDN) |
| `alt_ar` | `text` | إتاحة/SEO |
| `sort_order` | `integer` | |
| `is_primary` | `boolean` | صورة واحدة رئيسية لكل منتج (فهرس جزئي فريد) |

**`inventory_movements`** — سجل تدقيق لكل تغيير مخزون (اختياري لكنه مستحسن).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `variant_id` | `uuid` | FK → `product_variants` `ON DELETE CASCADE` |
| `delta` | `integer` | موجب = إضافة، سالب = خصم |
| `reason` | `inventory_reason` | `purchase, cancel, return, restock, manual_adjustment` |
| `order_id` | `uuid` | NULL — الربط بالطلب المسبّب |
| `created_by` | `uuid` | NULL — موظف أو NULL للنظام |
| `created_at` | `timestamptz` | |

### 2.3 السلة

**`carts`** — سلة زائر أو مسجّل.

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NULL للزائر — FK `ON DELETE SET NULL` |
| `guest_token` | `uuid` | NULL — كوكي آمن للزائر |
| `status` | `cart_status` | `active, converted, abandoned` |
| `expires_at` | `timestamptz` | تنظيف السلات المهملة |
| `created_at` / `updated_at` | `timestamptz` | |
| — | — | فهرس فريد جزئي: سلة `active` واحدة لكل `user_id` |

**`cart_items`**

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `cart_id` | `uuid` | FK `ON DELETE CASCADE` |
| `variant_id` | `uuid` | FK → `product_variants` `ON DELETE CASCADE` |
| `quantity` | `integer` | NOT NULL, `CHECK (quantity > 0)` |
| `unit_price_snapshot` | `numeric(10,2)` | السعر لحظة الإضافة (للعرض/كشف التغيّر) |
| `added_at` | `timestamptz` | |
| — | — | UNIQUE (`cart_id`, `variant_id`) |

### 2.4 الطلبات والدفع

**`orders`** — رأس الطلب (يقبل `user_id = NULL`).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `order_number` | `text` | NOT NULL, UNIQUE — `AURA-2026-000123` |
| `user_id` | `uuid` | NULL = شراء كزائر — FK `ON DELETE SET NULL` |
| `guest_email` / `guest_phone` | `text` | إلزامي أحدهما عند غياب `user_id` |
| `status` | `order_status` | `pending, confirmed, shipped, delivered, cancelled, returned` |
| `payment_status` | `payment_status` | `unpaid, paid, refunded, failed` |
| `payment_method` | `payment_method` | `cod, online` — default `cod` |
| `subtotal` | `numeric(10,2)` | مجموع البنود قبل الخصم |
| `discount_total` | `numeric(10,2)` | default `0` |
| `shipping_total` | `numeric(10,2)` | default `0` |
| `tax_total` | `numeric(10,2)` | جزء VAT **المستخرج** من الإجمالي (وليس مضافاً) |
| `grand_total` | `numeric(10,2)` | `= subtotal − discount_total + shipping_total` |
| `currency` / `vat_rate` | `char(3)` / `numeric(5,4)` | `SAR` / `0.1500` |
| `discount_code` | `text` | NULL — لقطة نصية للكود المستخدم |
| `shipping_address` | `jsonb` | **لقطة** كاملة (لا FK) |
| `billing_address` | `jsonb` | NULL |
| `customer_note` / `admin_note` | `text` | NULL |
| `idempotency_key` | `text` | UNIQUE جزئي — منع تكرار الطلب |
| `placed_at` | `timestamptz` | default `now()` |
| `confirmed_at` / `shipped_at` / `delivered_at` / `cancelled_at` / `returned_at` | `timestamptz` | NULL |
| `cancel_reason` | `text` | NULL |
| `created_at` / `updated_at` | `timestamptz` | |

**`order_items`** — **الجدول الرابط بين الطلب والمتغيرات** (M:N + بيانات إضافية).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK → `orders` `ON DELETE CASCADE`, NOT NULL |
| `variant_id` | `uuid` | FK → `product_variants` `ON DELETE SET NULL` — مرجع حي |
| `product_id` | `uuid` | FK → `products` `ON DELETE SET NULL` |
| `product_name_snapshot` | `text` | NOT NULL |
| `variant_label_snapshot` | `text` | مثال: "أسود / عدسة خضراء / 52mm" |
| `sku_snapshot` | `text` | NOT NULL |
| `unit_price` | `numeric(10,2)` | NOT NULL — شامل الضريبة وقت الشراء |
| `quantity` | `integer` | NOT NULL, `CHECK (> 0)` |
| `line_discount` | `numeric(10,2)` | default `0` |
| `line_total` | `numeric(10,2)` | NOT NULL |
| `returned_quantity` | `integer` | default `0` |
| `created_at` | `timestamptz` | |

**`order_status_history`** — سجل انتقالات الحالة (Audit).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK `ON DELETE CASCADE` |
| `from_status` / `to_status` | `order_status` | `from_status` يقبل NULL للإنشاء |
| `note` | `text` | NULL |
| `changed_by` | `uuid` | NULL = النظام |
| `created_at` | `timestamptz` | |

**`payments`** — جاهز لبوابات الدفع مستقبلاً (COD يسجّل صفاً بمزود `cod`).

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | PK |
| `order_id` | `uuid` | FK `ON DELETE CASCADE` |
| `provider` | `text` | `cod`, `moyasar`, `tap`, `stripe` … |
| `provider_reference` | `text` | NULL — معرّف العملية لدى المزوّد |
| `amount` | `numeric(10,2)` | NOT NULL |
| `status` | `payment_status` | default `unpaid` |
| `captured_at` | `timestamptz` | NULL |
| `raw_payload` | `jsonb` | استجابة المزوّد (لا بيانات بطاقة) |
| `created_at` | `timestamptz` | |

### 2.5 التسويق والإعدادات

**`discounts`**: `id`, `code` (UNIQUE, uppercase), `type` (`percent|fixed`), `value numeric(10,2)`, `min_order_total`, `max_uses integer`, `used_count integer default 0`, `per_customer_limit integer`, `starts_at`, `ends_at`, `is_active`, `created_at`.

**`discount_redemptions`**: `id`, `discount_id` FK, `order_id` FK, `user_id` NULL, `amount numeric(10,2)`, `created_at` — UNIQUE (`discount_id`, `order_id`).

**`shipping_zones`**: `id`, `name_ar`, `cities text[]`, `flat_rate numeric(10,2)`, `free_shipping_threshold numeric(10,2)` NULL, `cod_fee numeric(10,2)` default `0`, `estimated_days_min/max smallint`, `is_active`, `created_at`.

**`pages`**: `id`, `slug` UNIQUE, `title_ar`, `title_en`, `content text` (Markdown/HTML مُنقّى), `is_published`, `updated_at`.

**`newsletter_subscribers`**: `id`, `email` UNIQUE (lower), `source`, `is_active`, `created_at`.

**`customer_messages`**: `id`, `name`, `email`, `phone`, `subject`, `body`, `is_read`, `replied_at`, `created_at`.

**`settings`**: `key text` PK, `value jsonb`, `updated_at` — مثل `{"vat_rate":0.15,"prices_include_vat":true,"currency":"SAR","free_shipping_threshold":300}`.

**`audit_logs`**: `id`, `actor_user_id` NULL, `action`, `entity_type`, `entity_id uuid`, `changes jsonb`, `ip inet`, `user_agent text`, `created_at`.

---

## 3. العلاقات (Relations) صريحة

| # | العلاقة | النوع | التفصيل |
|---|---|---|---|
| R1 | `users` → `addresses` | **1:N** | مستخدم واحد بعناوين متعددة |
| R2 | `users` → `sessions` | **1:N** | أجهزة/جلسات متعددة |
| R3 | `users` → `orders` | **1:N (اختياري الطرف)** | `orders.user_id` يقبل NULL → يدعم الشراء كزائر |
| R4 | `categories` → `categories` | **1:N ذاتية** | `parent_id` |
| R5 | `categories` → `products` | **1:N** | الفئة لا تُحذف ما دامت تحتوي منتجات (`RESTRICT`) |
| R6 | `products` → `product_variants` | **1:N** | **القاعدة الذهبية:** كل مقاس/لون = صف مستقل بمخزون مستقل |
| R7 | `products` → `product_images` | **1:N** | `variant_id` اختياري لتخصيص صورة للون |
| R8 | `products` ↔ `collections` | **M:N** عبر `collection_products` | مجموعة تضم منتجات، ومنتج في عدة مجموعات |
| R9 | `carts` → `cart_items` | **1:N** | بند واحد لكل متغير (`UNIQUE`) |
| R10 | `carts` → `product_variants` | **M:N** عبر `cart_items` | مع كمية لكل متغير |
| R11 | **`orders` ↔ `product_variants`** | **M:N عبر `order_items`** | **جوهر التصميم:** الطلب يضم عدة متغيرات، والمتغير يظهر في عدة طلبات. كل صف في `order_items` = «هذا المتغير بهذه الكمية وبهذا السعر في هذا الطلب». `variant_id` مرجع حي، والبيانات التاريخية محفوظة كـ Snapshot كي لا يتأثر الطلب بتغيّر المنتج أو حذفه. |
| R12 | `orders` → `order_items` | **1:N** | حذف الطلب يحذف بنوده (نادراً ما يحدث) |
| R13 | `orders` → `order_status_history` | **1:N** | تتبّع كامل لتغيّرات الحالة |
| R14 | `orders` → `payments` | **1:N** | يسمح بمحاولات دفع متعددة/استرداد |
| R15 | `product_variants` → `inventory_movements` | **1:N** | كل حركة مخزون مسجّلة |
| R16 | `discounts` → `orders` | **1:N (مرن)** | `orders.discount_code` لقطة نصية، والربط الدقيق في `discount_redemptions` |
| R17 | `users` → `discount_redemptions` / `audit_logs` | **1:N** | |
| R18 | `orders` → `shipping_zones` | **لا يوجد FK** | الطلب يحفظ `shipping_total` كثابت تاريخي؛ تعديل أسعار الشحن لا يغيّر طلبات قديمة |

---

## 4. كود SQL لإنشاء الجداول الأساسية

الكود الكامل القابل للتنفيذ في: **[db/001_core_tables.sql](../db/001_core_tables.sql)** — يشمل `users`, `products`, `product_variants`, `orders` + جدول `order_items` (لازم لتحقيق العلاقة R11) والفهارس والمشغلات.

نقاط جوهرية في الـ DDL:

```sql
-- 1) تتبّع المخزون على مستوى المتغير
CREATE TABLE product_variants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku             text NOT NULL UNIQUE,
  variant_key     text NOT NULL,
  price           numeric(10,2) CHECK (price IS NULL OR price >= 0),
  stock_quantity  integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  ...
  UNIQUE (product_id, variant_key)
);

-- 2) الطلب يقبل زائراً + إجماليات لا تُقبل من العميل
CREATE TABLE orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  text NOT NULL UNIQUE,
  user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  status        order_status NOT NULL DEFAULT 'pending',
  grand_total   numeric(10,2) NOT NULL,
  ...
  CONSTRAINT orders_guest_contact
    CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL OR guest_phone IS NOT NULL),
  CONSTRAINT orders_totals_consistent
    CHECK (grand_total = subtotal - discount_total + shipping_total)
);
```

**خصم المخزون الآمن (Race-condition safe):**

```sql
UPDATE product_variants
   SET stock_quantity = stock_quantity - $2
 WHERE id = $1
   AND stock_quantity >= $2
RETURNING stock_quantity;
-- صفر صفوف = المخزون غير كافٍ → أرجِع الخطأ كاملاً (Rollback)
```

---

## 5. الخطوة التالية

- كتابة هجرات إضافية (`002_catalog.sql`, `003_commerce.sql`) بنفس الأسلوب.
- تحديد الستاك (Next.js + Prisma عادةً)، ثم تحويل هذا المخطط إلى `schema.prisma` مع الحفاظ على القيود أعلاه.
