# دليل النشر — AURA

المرجع النهائي لإطلاق المتجر. نفّذ الخطوات بالترتيب.

> **قاعدة مهمة:** مخطط قاعدة البيانات يُدار عبر ملفات SQL في `db/` (وليس Prisma Migrate).
> لا تستخدم `prisma migrate deploy` ولا `prisma db push`، لأن `db push` سيعيد بناء الجداول
> من `schema.prisma` ويفقد قيود `CHECK` والفهارس الجزئية (اتساق الإجماليات، منع المخزون السالب،
> صورة رئيسية واحدة، فهرس `lower(email)`).
> `prisma` هنا يُستخدم لتوليد العميل فقط: `prisma generate`.

---

## 0. المتطلبات

- Node.js 20+ و npm
- Git
- `psql` (عميل PostgreSQL) — لإدارة قاعدة البيانات
- حساب على Vercel + قاعدة بيانات PostgreSQL مُدارة (Neon أو Supabase أو RDS)
- حساب GitHub

---

## 1. التشغيل المحلي

```bash
# 1) الاعتماديات (postinstall يشغّل prisma generate تلقائياً)
npm install

# 2) ملف البيئة
cp .env.example .env

# 3) أنشئ مفتاح الجلسات وضعه في AUTH_SECRET داخل .env
openssl rand -base64 32

# 4) أنشئ قاعدة البيانات المحلية (اختر ما يناسب بيئتك)
createdb aura

# 5) هجرات قاعدة البيانات بالترتيب (أو npm run db:setup)
psql "$DATABASE_URL" -f db/001_core_tables.sql
psql "$DATABASE_URL" -f db/002_catalog.sql
psql "$DATABASE_URL" -f db/004_order_number.sql
psql "$DATABASE_URL" -f db/003_seed.sql      # اختياري: بيانات تجريبية

# 6) توليد عميل Prisma ثم التشغيل
npx prisma generate
npm run dev
```

### إنشاء أول حساب مالك (إلزامي للدخول إلى /admin)

```bash
node -e "console.log(require('bcryptjs').hashSync('كلمة-مرور-قوية', 12))"
```

```sql
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('owner@aura.sa', '<الهاش-الناتج>', 'AURA Owner', 'owner');
```

---

## 2. التحقق قبل الرفع

```bash
npm run build
npm run start    # http://localhost:3000
```

اختبر: `/` ← `/shop` ← صفحة منتج ← إضافة للسلة ← `/checkout` ← إتمام طلب ← `/auth/login` ← `/admin`
(تغيير حالة الطلب + تعديل كمية المخزون).

---

## 3. رفع الكود إلى GitHub

```bash
git init
git add .
git commit -m "$(cat <<'EOF'
AURA store MVP: catalog, cart, COD checkout, admin dashboard
EOF
)"
git branch -M main

# أنشئ المستودع على GitHub أولاً ثم:
git remote add origin https://github.com/USERNAME/aura-store.git
git push -u origin main
```

`.gitignore` يمنع رفع `.env` و`node_modules` و`.next`.

---

## 4. قاعدة بيانات الإنتاج

1. أنشئ مشروعاً على Neon (أو مزوّداً مشابهاً) واحصل على **Pooled connection string**.
2. أضف `?sslmode=require` إلى الرابط إن لم يكن موجوداً.
3. نفّذ الهجرات على قاعدة الإنتاج:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

psql "$DATABASE_URL" -f db/001_core_tables.sql
psql "$DATABASE_URL" -f db/002_catalog.sql
psql "$DATABASE_URL" -f db/004_order_number.sql
psql "$DATABASE_URL" -f db/003_seed.sql          # اختياري في الإنتاج

# تحقق
psql "$DATABASE_URL" -c "\dt"
psql "$DATABASE_URL" -c "SELECT nextval('order_number_seq');"
```

> إن لم ترغب بالبيانات التجريبية في الإنتاج، تخطَّ `003_seed.sql` وأضف المنتجات من لوحة التحكم لاحقاً.

---

## 5. متغيرات البيئة على Vercel

من لوحة Vercel: **Project → Settings → Environment Variables**، أو عبر CLI:

```bash
npm i -g vercel
vercel login
vercel link

vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel env add NEXT_PUBLIC_WHATSAPP_PHONE production
```

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط قاعدة البيانات المجمّع مع `sslmode=require` |
| `AUTH_SECRET` | نفس المفتاح المولّد بـ `openssl rand -base64 32` |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | رقم المتجر بصيغة دولية بلا `+` (مثل `966551234567`) |

`AUTH_URL` غير مطلوب على Vercel (العنوان يُكتشف تلقائياً و`trustHost` مفعّل).

---

## 6. النشر

**الطريقة المفضّلة — ربط GitHub:**
1. Vercel → **Add New → Project** → اختر مستودع `aura-store`.
2. Framework: Next.js (يُكتشف تلقائياً).
3. أضف متغيرات البيئة (الخطوة 5) قبل أول نشر.
4. **Deploy**.

أو عبر CLI:

```bash
vercel --prod
```

بعد نجاح البناء يصبح المتجر متاحاً على `https://<project>.vercel.app`، وكل `git push` إلى `main` يُطلق نشراً جديداً.

---

## 7. فحص ما بعد النشر

1. افتح `/shop` وتأكد من ظهور المنتجات والصور.
2. نفّذ **طلباً تجريبياً كامل** بالدفع عند الاستلام، ثم:
   - افتح `/admin` وسجّل دخول بحساب المالك.
   - تأكد من ظهور الطلب، وجرّب تغيير حالته.
   - تأكد أن كمية المخزون نقصت بمقدار الطلب.
3. اختبر زر واتساب العائم (أسفل يسار الشاشة) أنه يفتح الرقم الصحيح.
4. أضف النطاق المخصص من **Settings → Domains** (اختياري).

---

## 8. إعادة النشر بعد التعديلات

```bash
git add .
git commit -m "وصف التغيير"
git push
```

- Vercel ينشر تلقائياً.
- إن أضفت هجرة SQL جديدة، نفّذها على قاعدة الإنتاج يدوياً قبل/بعد النشر حسب نوع التغيير.

---

## 9. مشاكل شائعة

| العرض | السبب والحل |
|---|---|
| `relation "order_number_seq" does not exist` | لم تُنفَّذ `db/004_order_number.sql` |
| `column ... does not exist` أو أخطاء Prisma | `DATABASE_URL` يشير لقاعدة لم تُنفَّذ عليها الهجرات، أو لم يُشغَّل `prisma generate` |
| فشل الدخول إلى `/admin` | لا يوجد مستخدم `owner`، أو الهاش ليس bcrypt، أو `AUTH_SECRET` غير مضبوط |
| صور المنتجات 404 | مجلد `public/products` لم يُرفع أو الـ seed أُضيف دون ملفات SVG |
| إجمالي الطلب لا يطابق الواجهة | الشحن: مجاني عند ٣٠٠ ر.س وأكثر، وإلا ٢٥ — والضريبة مستخرجة من السعر |
