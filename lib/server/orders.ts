import { Prisma } from "@prisma/client";
import { computeTotalsFromCents, toSarString } from "@/lib/checkout/pricing";
import { redeemCoupon, resolveCoupon } from "@/lib/server/coupons";
import { getSiteSettings } from "@/lib/server/settings";
import { shippingRulesOf } from "@/lib/types/settings";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/http";

/**
 * إنشاء الطلب — أهم ملف في دورة الشراء.
 *
 * قواعد الأمان المطبّقة هنا:
 *  1. الأسعار تُقرأ من قاعدة البيانات، ولا يُقبل أي سعر أو إجمالي من العميل.
 *  2. خصم المخزون ذرّي: شرط `stockQuantity >= quantity` داخل UPDATE نفسه،
 *     فلا يمكن بيع نفس القطعة لعميلين متزامنين.
 *  3. كل الخطوات (خصم مخزون + إنشاء الطلب + البنود + حركة المخزون) داخل
 *     Transaction واحدة: أي فشل يُرجع المخزون كما كان.
 *  4. Idempotency Key يمنع تكرار الطلب عند الضغط مرتين أو إعادة المحاولة.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LINES = 20;
const MAX_QUANTITY_PER_LINE = 10;

export type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string | null;
  addressLine: string;
  postalCode: string | null;
  note: string | null;
};

export type CheckoutItem = {
  variantId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  idempotencyKey: string | null;
  userId: string | null;
  discountCode?: string | null;
};

export type CreatedOrder = {
  orderNumber: string;
  status: string;
  grandTotal: string;
  discountTotal: string;
  currency: string;
  placedAt: string;
};

/* ------------------------- التحقق من المدخلات ------------------------- */

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function trimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** يتحقق من الحقول ويعيد بيانات منظّفة أو يرمي 400 مع أخطاء الحقول. */
export function parseCheckoutPayload(payload: unknown): {
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  idempotencyKey: string | null;
  discountCode: string | null;
} {
  const root = asRecord(payload);
  if (!root) {
    throw new AppError("INVALID_REQUEST", "صيغة الطلب غير صالحة.", 400);
  }

  const customerRaw = asRecord(root.customer) ?? {};
  const fields: Record<string, string> = {};

  const fullName = trimmedString(customerRaw.fullName);
  if (fullName.length < 2 || fullName.length > 100) {
    fields.fullName = "الاسم مطلوب بين حرفين و١٠٠ حرف.";
  }

  const email = trimmedString(customerRaw.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 120) {
    fields.email = "أدخل بريداً إلكترونياً صحيحاً.";
  }

  const phone = trimmedString(customerRaw.phone).replace(/[\s-]/g, "");
  if (!/^\+?\d{9,15}$/.test(phone)) {
    fields.phone = "أدخل رقم جوال صحيحاً (مثال: 0551234567).";
  }

  const city = trimmedString(customerRaw.city);
  if (city.length < 2 || city.length > 60) {
    fields.city = "المدينة مطلوبة.";
  }

  const district = trimmedString(customerRaw.district);
  if (district.length > 60) {
    fields.district = "اسم الحي طويل جداً.";
  }

  const addressLine = trimmedString(customerRaw.addressLine);
  if (addressLine.length < 5 || addressLine.length > 200) {
    fields.addressLine = "أدخل عنواناً تفصيلياً (٥ أحرف على الأقل).";
  }

  const postalCode = trimmedString(customerRaw.postalCode);
  if (postalCode.length > 0 && !/^\d{5}$/.test(postalCode)) {
    fields.postalCode = "الرمز البريدي يجب أن يكون ٥ أرقام.";
  }

  const note = trimmedString(customerRaw.note);
  if (note.length > 500) {
    fields.note = "الملاحظات يجب أن تكون أقل من ٥٠٠ حرف.";
  }

  // طريقة الدفع: COD هي الخيار الوحيد المتاح حالياً
  const paymentMethod = trimmedString(root.paymentMethod);
  if (paymentMethod && paymentMethod !== "cod") {
    fields.paymentMethod = "طريقة الدفع المطلوبة غير مدعومة حالياً.";
  }

  // ---------- عناصر السلة ----------
  const rawItems = Array.isArray(root.items) ? root.items : [];
  if (rawItems.length === 0) {
    fields.items = "السلة فارغة.";
  } else if (rawItems.length > MAX_LINES) {
    fields.items = `لا يمكن إتمام طلب بأكثر من ${MAX_LINES} سطراً.`;
  }

  const merged = new Map<string, number>();
  for (const rawItem of rawItems) {
    const item = asRecord(rawItem);
    const variantId = trimmedString(item?.variantId);
    const quantity = Number(item?.quantity);

    if (!UUID_RE.test(variantId)) {
      fields.items = "أحد عناصر السلة غير صالح — حدّث السلة وحاول مجدداً.";
      break;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      fields.items = `الكمية لكل منتج يجب أن تكون بين ١ و${MAX_QUANTITY_PER_LINE}.`;
      break;
    }

    merged.set(variantId, (merged.get(variantId) ?? 0) + quantity);
  }

  // ---------- كود الخصم ----------
  const rawCode = trimmedString(root.discountCode).toUpperCase().slice(0, 32);
  if (rawCode.length > 0 && !/^[A-Z0-9_-]{3,32}$/.test(rawCode)) {
    fields.discountCode = "كود الخصم غير صحيح.";
  }

  // ---------- مفتاح منع التكرار ----------
  const rawKey = trimmedString(root.idempotencyKey);
  let idempotencyKey: string | null = null;
  if (rawKey.length > 0) {
    if (!UUID_RE.test(rawKey)) {
      throw new AppError("INVALID_REQUEST", "مفتاح منع التكرار غير صالح.", 400);
    }
    idempotencyKey = rawKey;
  }

  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_ERROR", "يرجى تصحيح الحقول المحددة.", 400, fields);
  }

  return {
    customer: {
      fullName,
      email,
      phone,
      city,
      district: district.length > 0 ? district : null,
      addressLine,
      postalCode: postalCode.length > 0 ? postalCode : null,
      note: note.length > 0 ? note : null,
    },
    items: [...merged.entries()].map(([variantId, quantity]) => ({ variantId, quantity })),
    idempotencyKey,
    discountCode: rawCode.length > 0 ? rawCode : null,
  };
}

/* --------------------------- إنشاء الطلب --------------------------- */

async function findByIdempotencyKey(key: string): Promise<CreatedOrder | null> {
  const order = await prisma.order.findFirst({
    where: { idempotencyKey: key },
    select: {
      orderNumber: true,
      status: true,
      grandTotal: true,
      discountTotal: true,
      currency: true,
      placedAt: true,
    },
  });

  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    grandTotal: order.grandTotal.toFixed(2),
    discountTotal: order.discountTotal.toFixed(2),
    currency: order.currency,
    placedAt: order.placedAt.toISOString(),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const { customer, items, idempotencyKey, userId } = input;
  const discountCode = input.discountCode ?? null;
  // قواعد الشحن والضريبة من إعدادات المتجر لا من ثوابت الكود
  const rules = shippingRulesOf(await getSiteSettings());

  // إعادة المحاولة بنفس المفتاح تُعيد نفس الطلب بدل إنشاء طلب ثانٍ
  if (idempotencyKey) {
    const existing = await findByIdempotencyKey(idempotencyKey);
    if (existing) return existing;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const rows = await tx.productVariant.findMany({
        where: { id: { in: items.map((item) => item.variantId) } },
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              status: true,
              deletedAt: true,
              basePrice: true,
            },
          },
        },
      });

      const byId = new Map(rows.map((row) => [row.id, row]));

      const lines = items.map((item) => {
        const row = byId.get(item.variantId);

        if (
          !row ||
          !row.isActive ||
          row.product.deletedAt !== null ||
          row.product.status !== "active"
        ) {
          throw new AppError(
            "PRODUCT_UNAVAILABLE",
            "أحد المنتجات في سلتك لم يعد متاحاً. حدّث السلة وحاول مجدداً.",
            409,
          );
        }

        // السعر المعتمد: سعر المتغير، وإلا سعر المنتج — بالهللات لتفادي أخطاء الكسور
        const unitCents = Math.round(Number(row.price ?? row.product.basePrice) * 100);
        const label =
          [row.colorName, row.lensColor, row.sizeLabel].filter(Boolean).join(" / ") || row.sku;

        return {
          row,
          quantity: item.quantity,
          unitCents,
          label,
          lineTotalCents: unitCents * item.quantity,
        };
      });

      // الخصم الذرّي: الفشل هنا (count = 0) يعني أن المخزون لم يعد كافياً
      for (const line of lines) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: line.row.id,
            isActive: true,
            stockQuantity: { gte: line.quantity },
          },
          data: { stockQuantity: { decrement: line.quantity } },
        });

        if (result.count !== 1) {
          throw new AppError(
            "OUT_OF_STOCK",
            `الكمية المطلوبة من «${line.row.product.nameAr}» لم تعد متوفرة. عدّل السلة وحاول مجدداً.`,
            409,
          );
        }
      }

      const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);

      // الكوبون يُقرأ ويُحسب داخل نفس الـTransaction التي ستستهلكه
      const coupon = discountCode
        ? await resolveCoupon(tx, discountCode, subtotalCents)
        : null;

      const totals = computeTotalsFromCents(subtotalCents, rules, coupon?.discountCents ?? 0);

      // رقم تسلسلي من تسلسل PostgreSQL — فريد حتى مع الطلبات المتزامنة
      const [sequence] = await tx.$queryRaw<Array<{ value: bigint }>>`
        SELECT nextval('order_number_seq') AS value
      `;
      const year = new Date().getFullYear();
      const orderNumber = `AURA-${year}-${String(Number(sequence.value)).padStart(6, "0")}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          guestEmail: userId ? null : customer.email,
          guestPhone: userId ? null : customer.phone,
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: "cod",
          subtotal: toSarString(totals.subtotalCents),
          discountTotal: toSarString(totals.discountCents),
          discountCode: coupon?.code ?? null,
          shippingTotal: toSarString(totals.shippingCents),
          taxTotal: toSarString(totals.vatCents),
          grandTotal: toSarString(totals.totalCents),
          currency: "SAR",
          vatRate: new Prisma.Decimal(rules.vatRate.toFixed(4)),
          shippingAddress: {
            fullName: customer.fullName,
            phone: customer.phone,
            email: customer.email,
            city: customer.city,
            district: customer.district,
            addressLine: customer.addressLine,
            postalCode: customer.postalCode,
          },
          customerNote: customer.note,
          idempotencyKey,
          items: {
            create: lines.map((line) => ({
              variantId: line.row.id,
              productId: line.row.product.id,
              productNameSnapshot: line.row.product.nameAr,
              variantLabelSnapshot: line.label,
              skuSnapshot: line.row.sku,
              unitPrice: toSarString(line.unitCents),
              quantity: line.quantity,
              lineDiscount: "0.00",
              lineTotal: toSarString(line.lineTotalCents),
            })),
          },
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          discountTotal: true,
          currency: true,
          placedAt: true,
        },
      });

      // استهلاك الكوبون: يفشل الطلب كله (ويُرجَع المخزون) إن استُنفد في هذه اللحظة
      if (coupon) await redeemCoupon(tx, coupon.code);

      // سجل تدقيق لكل خصم مخزون
      await tx.inventoryMovement.createMany({
        data: lines.map((line) => ({
          variantId: line.row.id,
          delta: -line.quantity,
          reason: "purchase",
          orderId: order.id,
        })),
      });

      return {
        orderNumber: order.orderNumber,
        status: order.status,
        grandTotal: order.grandTotal.toFixed(2),
        discountTotal: order.discountTotal.toFixed(2),
        currency: order.currency,
        placedAt: order.placedAt.toISOString(),
      };
    });
  } catch (error) {
    // سباق نادر على نفس المفتاح: أعِد الطلب الذي أُنشئ فعلاً
    if (
      idempotencyKey &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await findByIdempotencyKey(idempotencyKey);
      if (existing) return existing;
    }

    throw error;
  }
}
