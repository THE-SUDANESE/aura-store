import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { deleteInfoPage, upsertInfoPage } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

/** PATCH /api/admin/pages/:slug — إنشاء أو تحديث صفحة معلومات. */
export async function PATCH(request: NextRequest, context: Context) {
  const requestId = randomUUID();

  try {
    await requireAdmin();

    const { slug } = await context.params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new AppError("INVALID_REQUEST", "صيغة الصفحة غير صالحة.", 400);

    const page = await upsertInfoPage(slug, {
      title: body.title,
      intro: body.intro,
      sections: body.sections,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    });

    return ok(page, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

/** DELETE /api/admin/pages/:slug */
export async function DELETE(_request: NextRequest, context: Context) {
  const requestId = randomUUID();

  try {
    await requireAdmin();
    const { slug } = await context.params;
    await deleteInfoPage(slug);
    return ok({ deleted: slug }, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
