import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { AppError, assertSameOrigin } from "@/lib/http";
import { clientIp, enforceRateLimit } from "@/lib/server/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_NAME = 2;
const MAX_NAME = 100;
const MIN_PASSWORD = 8;
// bcrypt يتجاهل ما بعد ٧٢ بايتاً، فنرفض الطويل بدل قبول كلمة مرور مقصوصة
const MAX_PASSWORD = 72;

export async function POST(request: Request) {
  try {
    // ٥ محاولات كل ساعة لكل عنوان IP — يمنع إنشاء حسابات جماعية
    assertSameOrigin(request);
    await enforceRateLimit({
      key: `register:${clientIp(request)}`,
      limit: 5,
      windowSeconds: 3600,
    });

    const body = (await request.json().catch(() => null)) as
      | { name?: unknown; email?: unknown; password?: unknown }
      | null;

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "يرجى تعبئة جميع الحقول" }, { status: 400 });
    }

    if (name.length < MIN_NAME || name.length > MAX_NAME) {
      return NextResponse.json(
        { error: `الاسم يجب أن يكون بين ${MIN_NAME} و${MAX_NAME} حرفاً` },
        { status: 400 },
      );
    }

    if (!EMAIL_RE.test(email) || email.length > 190) {
      return NextResponse.json({ error: "أدخل بريداً إلكترونياً صحيحاً" }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `كلمة المرور يجب أن تكون ${MIN_PASSWORD} حروف على الأقل` },
        { status: 400 },
      );
    }

    if (password.length > MAX_PASSWORD) {
      return NextResponse.json(
        { error: `كلمة المرور يجب ألا تتجاوز ${MAX_PASSWORD} حرفاً` },
        { status: 400 },
      );
    }

    // تحقق مبكر لرسالة أوضح؛ القيد الفريد في قاعدة البيانات يبقى خط الدفاع الأخير
    const existingUser = await prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, fullName: name, role: "customer", isActive: true },
      select: { id: true, email: true, fullName: true, role: true },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.fullName, role: user.role } },
      { status: 201 },
    );
  } catch (error) {
    // أخطاء متوقعة (حد المعدل، أصل غير مسموح) لها رسالتها وحالتها الخاصة
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    // تسجيلان متزامنان بنفس البريد: القيد الفريد يرمي P2002
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 409 },
      );
    }

    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى" },
      { status: 500 },
    );
  }
}
