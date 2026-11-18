import { prisma } from "@/lib/db";
import { formatSAR } from "@/lib/format";
import { getSiteSettings } from "@/lib/server/settings";

/**
 * بريد الطلبات عبر Resend.
 *
 * التصميم مقصود بحيث لا يحتاج أي إعداد حتى يصل المفتاح:
 *  - لا يوجد RESEND_API_KEY ⇒ لا يحدث أي شيء، والطلب يكتمل عادياً.
 *  - يوجد المفتاح ⇒ يصل إشعار لكل طلب جديد إلى بريد المتجر (contact.email).
 *  - يوجد RESEND_FROM على نطاق موثّق ⇒ يصل أيضاً تأكيد للعميل نفسه.
 *
 * لا نستخدم أي مكتبة إضافية: واجهة Resend عبارة عن طلب POST واحد.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "AURA <onboarding@resend.dev>";

function log(event: string, details: Record<string, unknown>) {
  console.log(JSON.stringify({ level: "info", channel: "mail", event, ...details }));
}

/** عنوان الموقع العام — يُستخدم في روابط الرسائل. */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type SendInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

async function send({ to, subject, html, replyTo }: SendInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM?.trim() || DEFAULT_FROM;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      // رسالة الخطأ من Resend مفيدة للتشخيص لكنها قد تحوي تفاصيل الحساب
      log("send.failed", { status: res.status, subject });
      return false;
    }

    log("send.ok", { status: res.status });
    return true;
  } catch (error) {
    log("send.error", { message: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/* ------------------------------ القوالب ------------------------------ */

function shell(title: string, intro: string, body: string, footerNote: string): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:24px;background:#f7f5f0;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#171412">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#0a0a0a;padding:20px 24px;color:#ffffff;font-size:20px;letter-spacing:6px;font-weight:600">AURA</td>
      </tr>
      <tr>
        <td style="padding:28px 24px 8px">
          <h1 style="margin:0 0 10px;font-size:20px;line-height:1.5">${title}</h1>
          <p style="margin:0;color:#5b534c;font-size:14px;line-height:1.9">${intro}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px 28px">${body}</td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background:#f2eee7;color:#6b6259;font-size:12px;line-height:1.8">${footerNote}</td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(
  items: Array<{ name: string; variant: string; quantity: number; lineTotal: string }>,
): string {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee9e1;font-size:13px;line-height:1.7">
          <strong>${escapeHtml(item.name)}</strong><br />
          <span style="color:#7a7168;font-size:12px">${escapeHtml(item.variant)} × ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee9e1;font-size:13px;text-align:left;white-space:nowrap">
          ${escapeHtml(item.lineTotal)}
        </td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">${rows}</table>`;
}

function totalsBlock(rows: Array<[string, string]>, grandTotal: string): string {
  const lines = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 0;color:#6b6259;font-size:13px">${label}</td><td style="padding:4px 0;color:#171412;font-size:13px;text-align:left">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-top:14px">
    ${lines}
    <tr>
      <td style="padding:12px 0 0;border-top:1px solid #171412;font-size:14px;font-weight:700">الإجمالي</td>
      <td style="padding:12px 0 0;border-top:1px solid #171412;font-size:16px;font-weight:700;text-align:left">${escapeHtml(grandTotal)}</td>
    </tr>
  </table>`;
}

/* --------------------------- الإرسال الفعلي --------------------------- */

type AddressLike = {
  fullName?: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  addressLine?: string;
  postalCode?: string;
};

function addressBlock(address: AddressLike): string {
  const parts = [
    address.fullName,
    address.addressLine,
    [address.district, address.city].filter(Boolean).join("، "),
    address.postalCode ? `الرمز البريدي ${address.postalCode}` : null,
    address.phone,
  ].filter((part): part is string => Boolean(part && String(part).trim()));

  return `<div style="margin-top:18px;padding:14px;border-radius:12px;background:#f7f5f0;font-size:13px;line-height:1.9">
    <strong style="display:block;margin-bottom:6px">عنوان التوصيل</strong>
    ${parts.map((part) => escapeHtml(part)).join("<br />")}
  </div>`;
}

/**
 * يرسل إشعار المتجر وتأكيد العميل لطلب أُنشئ للتو.
 * يُستدعى بعد إرجاع الرد للعميل، ولا يرمي أخطاء أبداً.
 */
export async function sendOrderNotifications(orderNumber: string): Promise<void> {
  if (!isMailerConfigured()) return;

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: { select: { email: true, fullName: true } },
      },
    });

    if (!order) {
      log("order.missing", { orderNumber });
      return;
    }

    // إعادة الإرسال لنفس المفتاح لا تكرر البريد
    const ageMs = Date.now() - order.placedAt.getTime();
    if (ageMs > 5 * 60 * 1000) {
      log("order.stale", { orderNumber });
      return;
    }

    const settings = await getSiteSettings();
    const address = (order.shippingAddress ?? {}) as AddressLike;
    const customerEmail = address.email ?? order.guestEmail ?? order.user?.email ?? null;
    const items = order.items.map((item) => ({
      name: item.productNameSnapshot,
      variant: item.variantLabelSnapshot || item.skuSnapshot,
      quantity: item.quantity,
      lineTotal: formatSAR(Number(item.lineTotal)),
    }));

    const totals: Array<[string, string]> = [
      ["المجموع الفرعي", formatSAR(Number(order.subtotal))],
      ...(Number(order.discountTotal) > 0
        ? ([[`الخصم${order.discountCode ? ` (${order.discountCode})` : ""}`, `- ${formatSAR(Number(order.discountTotal))}`]] as Array<[string, string]>)
        : []),
      ["الشحن", Number(order.shippingTotal) === 0 ? "مجاني" : formatSAR(Number(order.shippingTotal))],
      ["ضريبة القيمة المضافة", formatSAR(Number(order.taxTotal))],
    ];
    const grandTotal = formatSAR(Number(order.grandTotal));
    const orderLink = `${siteUrl()}/admin/orders/${order.id}`;

    /* ١) إشعار المتجر */
    await send({
      to: settings.contact.email,
      replyTo: customerEmail ?? undefined,
      subject: `طلب جديد ${order.orderNumber} — ${grandTotal}`,
      html: shell(
        `طلب جديد ${escapeHtml(order.orderNumber)}`,
        `وصل طلب جديد بقيمة <strong>${escapeHtml(grandTotal)}</strong> — طريقة الدفع: الدفع عند الاستلام.`,
        `${itemsTable(items)}
         ${totalsBlock(totals, grandTotal)}
         ${addressBlock(address)}
         <p style="margin:20px 0 0">
           <a href="${orderLink}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:13px">فتح الطلب في لوحة التحكم</a>
         </p>
         ${order.customerNote ? `<div style="margin-top:16px;padding:12px;border-radius:12px;background:#fff7e6;font-size:13px;line-height:1.8"><strong>ملاحظة العميل:</strong><br />${escapeHtml(order.customerNote)}</div>` : ""}`,
        `أُرسل هذا الإشعار تلقائياً إلى ${escapeHtml(settings.contact.email)} لأن هذا هو بريد التواصل في إعدادات المتجر.`,
      ),
    });

    /* ٢) تأكيد العميل — يحتاج نطاقاً موثّقاً في Resend */
    if (process.env.RESEND_FROM?.trim() && customerEmail) {
      await send({
        to: customerEmail,
        replyTo: settings.contact.email,
        subject: `تم استلام طلبك ${order.orderNumber} — AURA`,
        html: shell(
          `شكراً لك، ${escapeHtml(address.fullName ?? "عميلنا العزيز")}`,
          `استلمنا طلبك <strong>${escapeHtml(order.orderNumber)}</strong> وسنتواصل معك على ${escapeHtml(address.phone ?? "جوالك")} لتأكيد التوصيل.`,
          `${itemsTable(items)}
           ${totalsBlock(totals, grandTotal)}
           ${addressBlock(address)}
           <p style="margin:18px 0 0;font-size:13px;line-height:1.9;color:#5b534c">الدفع عند الاستلام — لا حاجة لدفع أي مبلغ الآن. للاستفسار راسلنا على ${escapeHtml(settings.contact.email)} أو واتساب ${escapeHtml(settings.contact.phoneDisplay)}.</p>`,
          `AURA — ${escapeHtml(settings.contact.address)}`,
        ),
      });
    }
  } catch (error) {
    log("order.error", { orderNumber, message: error instanceof Error ? error.message : String(error) });
  }
}
