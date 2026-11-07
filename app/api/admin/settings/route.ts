import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppError, ok, toErrorResponse } from "@/lib/http";
import { getSiteSettings, updateSiteSettings } from "@/lib/server/settings";

/** GET /api/admin/settings — القيم الحالية كما تُرى في الواجهة. */
export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = randomUUID();

  try {
    await requireAdmin();
    return ok(await getSiteSettings(), requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

/** PATCH /api/admin/settings — يقبل كائن الإعدادات كاملاً ويطبّعه قبل الحفظ. */
export async function PATCH(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const admin = await requireAdmin();

    const body = (await request.json().catch(() => null)) as { settings?: unknown } | null;
    if (!body || typeof body !== "object" || !("settings" in body)) {
      throw new AppError("INVALID_REQUEST", "صيغة الإعدادات غير صالحة.", 400);
    }

    const settings = await updateSiteSettings(body.settings, admin.id);
    return ok(settings, requestId);
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
