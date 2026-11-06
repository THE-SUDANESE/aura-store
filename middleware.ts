import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authConfig, isAdminRole } from "./auth.config";
import { fail } from "@/lib/http";

/**
 * حماية مسارات الإدارة على مستوى الـ middleware.
 *
 * مهم: هذا الحاجز الأول فقط (سريع، بلا قاعدة بيانات) — وكل مسار إداري
 * يجب أن يستدعي requireAdmin() أيضاً، لأن الـ middleware وحده
 * لا يكفي كطبقة تصريح (راجع توثيق Auth.js نفسه).
 */
const { auth } = NextAuth(authConfig);

function requestIdOf(req: NextRequest): string {
  // crypto المتاح على Edge runtime (لا نستخدم node:crypto هنا)
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

export default auth((req) => {
  const requestId = requestIdOf(req);
  const user = req.auth?.user;
  const pathName = req.nextUrl.pathname;

  // صفحة الدخول: متاحة للزوار، ومن سجّل دخوله يُحوَّل إلى حسابه
  if (pathName === "/auth/login") {
    if (user?.id) return NextResponse.redirect(new URL("/account", req.nextUrl.origin));
    return undefined;
  }

  // حماية صفحة الحساب - تحويل التوجيه للصفحات غير المسجل دخولها
  if (pathName.startsWith("/account")) {
    if (!user?.id) {
      // تحويل مؤقت للصفحة تسجيل الدخول
      const loginUrl = new URL("/auth/login", req.nextUrl.origin);
      loginUrl.searchParams.set("redirect", pathName);
      return NextResponse.redirect(loginUrl);
    }
    // المستخدم مسجل الدخول -continu to the page
    return undefined;
  }

  // حماية مسارات الإدارة القائمة (JSON errors)
  if (!user?.id) {
    return fail("UNAUTHORIZED", "يجب تسجيل الدخول للوصول إلى هذه الواجهة.", 401, requestId);
  }

  if (!isAdminRole(user.role)) {
    return fail("FORBIDDEN", "هذا الحساب لا يملك صلاحية إدارية.", 403, requestId);
  }

  // مسموح: نكمل إلى معالج المسار
  return undefined;
});

export const config = {
  // يشمل كل ما تحت /api/admin (بما فيها المسارات المتداخلة)
  matcher: ["/api/admin/:path*", "/account", "/account/.*", "/auth/login"],
};
