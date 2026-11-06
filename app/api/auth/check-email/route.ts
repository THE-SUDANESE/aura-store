import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "معلمة بريد مفقودة" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error("Check email API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في التحقق من البريد" },
      { status: 500 }
    );
  }
}