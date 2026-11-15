import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authConfig, isAdminRole } from "./auth.config";
import { fail } from "@/lib/http";

/**
 * طبقتان هنا:
 *
 * 1) فحص أصل الطلب (CSRF) لكل طلبات التغيير على /api — مركزي، فيغطي
 *    كل المسارات الحالية وأي مسار جديد يُضاف دون أن يتذكّر أحد.
 *    نفس منطق assertSameOrigin في lib/http.ts: نقارن Origin بمضيف الطلب،
 *    والطلب بلا Origin (سكربت خادم) يُترك لأنه محمي بـ SameSite أصلاً.
 *
 * 2) حماية مسارات الإدارة. هذا الحاجز الأول فقط (سريع، بلا قاعدة بيانات)،
 *    وكل مسار إداري يستدعي requireAdmin() أيضاً كطبقة تصريح ثانية.
 */
const { auth } = NextAuth(authConfig);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function requestIdOf(req: NextRequest): string {
  // crypto المتاح على Edge runtime (لا نستخدم node:crypto هنا)
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

/** هل الطلب صادر من نفس أصل الموقع؟ (نفس دلالات assertSameOrigin) */
function isSameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin || origin === "null") return true;

  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim();
  if (!host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export default auth((req) => {
  const requestId = requestIdOf(req);
  const user = req.auth?.user;
  const pathName = req.nextUrl.pathname;

  if (MUTATING_METHODS.has(req.method) && !isSameOriginRequest(req)) {
    return fail("FORBIDDEN", "طلب من أصل غير مسموح.", 403, requestId);
  }

  // ---- المسارات العامة تحت /api: كفى فحص الأصل أعلاه ----
  if (pathName.startsWith("/api")) {
    if (!pathName.startsWith("/api/admin")) return undefined;

    if (!user?.id) {
      return fail("UNAUTHORIZED", "يجب تسجيل الدخول للوصول إلى هذه الواجهة.", 401, requestId);
    }
    if (!isAdminRole(user.role)) {
      return fail("FORBIDDEN", "هذا الحساب لا يملك صلاحية إدارية.", 403, requestId);
    }
    return undefined;
  }

  // صفحة الدخول: متاحة للزوار، ومن سجّل دخوله يُحوَّل إلى حسابه
  if (pathName === "/auth/login") {
    if (user?.id) return NextResponse.redirect(new URL("/account", req.nextUrl.origin));
    return undefined;
  }

  // حماية صفحات الحساب
  if (pathName.startsWith("/account")) {
    if (!user?.id) {
      const loginUrl = new URL("/auth/login", req.nextUrl.origin);
      loginUrl.searchParams.set("redirect", pathName);
      return NextResponse.redirect(loginUrl);
    }
    return undefined;
  }

  return undefined;
});

export const config = {
  // /api كلها (لفحص CSRF) + صفحات الحساب + الدخول
  matcher: ["/api/:path*", "/account/:path*", "/auth/login"],
};
