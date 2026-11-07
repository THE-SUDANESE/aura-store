import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const BASE = "http://127.0.0.1:3124";
const prisma = new PrismaClient();
let failures = 0;
const check = (name, pass, extra = "") => {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"} | ${name}${extra ? " | " + extra : ""}`);
};

let jar = new Map();
const capture = (res) => {
  const list = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of list) {
    const pair = c.split(";")[0];
    const i = pair.indexOf("=");
    if (i > 0) jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
};
const req = async (path, opts = {}) => {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...(jar.size ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") } : {}),
    },
    redirect: "manual",
  });
  capture(res);
  return res;
};
const readBody = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

async function login(email, password) {
  jar = new Map();
  const csrf = (await readBody(await req("/api/auth/csrf")))?.csrfToken;
  if (!csrf) return null;
  const form = new URLSearchParams({
    csrfToken: csrf,
    email,
    password,
    callbackUrl: BASE + "/",
  });
  await req("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  return await readBody(await req("/api/auth/session"));
}

let variant, orderId, customerId;
const email = `qa-${Date.now()}@aura.test`;

try {
  variant = await prisma.productVariant.findFirst({
    where: {
      isActive: true,
      stockQuantity: { gte: 3 },
      product: { status: "active", deletedAt: null },
    },
    include: { product: { select: { slug: true, nameAr: true, basePrice: true } } },
  });
  if (!variant) throw new Error("no sellable variant found");

  const stock0 = variant.stockQuantity;
  const unit = Number(variant.price ?? variant.product.basePrice);
  const idem = crypto.randomUUID();

  const orderBody = {
    customer: {
      fullName: "عميل اختبار",
      email: "qa@aura.test",
      phone: "0551234567",
      city: "الرياض",
      district: "العليا",
      addressLine: "شارع الاختبار ١٢٣",
      postalCode: "12345",
      note: "",
    },
    items: [{ variantId: variant.id, quantity: 1 }],
    paymentMethod: "cod",
    idempotencyKey: idem,
  };

  let res = await req("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(orderBody),
  });
  let payload = await readBody(res);
  check(
    "إنشاء طلب زائر (201)",
    res.status === 201 && payload?.success === true,
    `status=${res.status} ${payload?.error?.message ?? ""}`,
  );

  const orderNumber = payload?.data?.orderNumber;
  const order = orderNumber ? await prisma.order.findFirst({ where: { orderNumber } }) : null;
  orderId = order?.id;

  const expectedShipping = unit >= 300 ? 0 : 25;
  const expectedTotal = (unit + expectedShipping).toFixed(2);
  check(
    "الإجمالي مطابق لقواعد الشحن",
    order?.grandTotal.toFixed(2) === expectedTotal,
    `unit=${unit} total=${order?.grandTotal.toFixed(2)} expected=${expectedTotal}`,
  );
  check(
    "نوع الدفع COD وحالته unpaid",
    order?.paymentMethod === "cod" && order?.paymentStatus === "unpaid",
    `${order?.paymentMethod}/${order?.paymentStatus}`,
  );
  check(
    "الطلب زائر بلا حساب",
    order?.userId === null && Boolean(order?.guestEmail),
    `userId=${order?.userId}`,
  );

  const stock1 = (
    await prisma.productVariant.findUnique({
      where: { id: variant.id },
      select: { stockQuantity: true },
    })
  ).stockQuantity;
  check("خصم المخزون مرة واحدة", stock1 === stock0 - 1, `${stock0} -> ${stock1}`);

  res = await req("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(orderBody),
  });
  payload = await readBody(res);
  check(
    "إعادة المحاولة بنفس المفتاح تعيد نفس الطلب",
    payload?.data?.orderNumber === orderNumber,
    `status=${res.status}`,
  );
  const stock2 = (
    await prisma.productVariant.findUnique({
      where: { id: variant.id },
      select: { stockQuantity: true },
    })
  ).stockQuantity;
  check("لا خصم مخزون مزدوج", stock2 === stock1, `stock=${stock2}`);
  const orderCount = await prisma.order.count({ where: { orderNumber } });
  check("طلب واحد فقط في قاعدة البيانات", orderCount === 1, `count=${orderCount}`);

  const huge = await req("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...orderBody,
      idempotencyKey: crypto.randomUUID(),
      items: [{ variantId: variant.id, quantity: 10 }],
    }),
  });
  const hugeStock = (
    await prisma.productVariant.findUnique({
      where: { id: variant.id },
      select: { stockQuantity: true },
    })
  ).stockQuantity;
  check(
    "الطلب فوق المخزون يُرفض بلا خصم",
    huge.status === 409 && hugeStock === stock2,
    `status=${huge.status} stock=${hugeStock}`,
  );

  jar = new Map();
  let admin = await req(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "confirmed" }),
  });
  check("زائر لا يعدّل الطلب (401)", admin.status === 401, `status=${admin.status}`);

  let session = await login("admin@aura.sa", "Aura2026");
  check("دخول المالك يعمل", session?.user?.role === "owner", `role=${session?.user?.role ?? "none"}`);

  admin = await req(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "toString" }),
  });
  const badStatus = await readBody(admin);
  check(
    "حالة غير صالحة تُرفض 400 لا 500",
    admin.status === 400 && badStatus?.error?.code === "VALIDATION_ERROR",
    `status=${admin.status} code=${badStatus?.error?.code}`,
  );

  admin = await req(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  });
  check("إلغاء الطلب ينجح", admin.status === 200, `status=${admin.status}`);

  const stock3 = (
    await prisma.productVariant.findUnique({
      where: { id: variant.id },
      select: { stockQuantity: true },
    })
  ).stockQuantity;
  check(
    "الإلغاء يعيد الكمية للمخزون",
    stock3 === stock0,
    `${stock2} -> ${stock3} (الأصل ${stock0})`,
  );

  const move = await prisma.inventoryMovement.findFirst({
    where: { orderId, delta: { gt: 0 } },
    select: { delta: true, reason: true },
  });
  check(
    "حركة مخزون مسجّلة بسبب cancel",
    move?.reason === "cancel" && move?.delta === 1,
    `${move?.reason}/${move?.delta}`,
  );

  const cancelledOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, cancelledAt: true },
  });
  check(
    "الحالة ووقت الإلغاء محفوظان",
    cancelledOrder?.status === "cancelled" && cancelledOrder?.cancelledAt !== null,
    `${cancelledOrder?.status}`,
  );

  const reg = await req("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "عميل اختبار", email, password: "Customer123" }),
  });
  const regBody = await readBody(reg);
  customerId = regBody?.user?.id;
  check("تسجيل عميل جديد ينجح", reg.status === 201, `status=${reg.status}`);

  session = await login(email, "Customer123");
  check("دخول العميل يعمل", session?.user?.role === "customer", `role=${session?.user?.role ?? "none"}`);

  const forbidden = await req(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "delivered" }),
  });
  check("العميل يُمنع من الأدمن (403)", forbidden.status === 403, `status=${forbidden.status}`);
} catch (error) {
  console.log("FAIL | استثناء غير متوقع |", error.message);
  failures++;
} finally {
  try {
    if (orderId) {
      await prisma.inventoryMovement.deleteMany({ where: { orderId } });
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.delete({ where: { id: orderId } });
    }
    if (variant) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: variant.stockQuantity },
      });
    }
    if (customerId) await prisma.user.delete({ where: { id: customerId } });
    else await prisma.user.deleteMany({ where: { email } });
    console.log("CLEANUP | حُذفت بيانات الاختبار وأُعيد المخزون");
  } catch (e) {
    console.log("CLEANUP FAILED |", e.message);
  }
  await prisma.$disconnect();
  console.log(failures === 0 ? "RESULT: ALL PASS" : `RESULT: ${failures} FAILED`);
}
