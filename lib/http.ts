import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "VALIDATION_ERROR"
  | "PRODUCT_NOT_FOUND"
  | "OUT_OF_STOCK"
  | "PRODUCT_UNAVAILABLE"
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

/** خطأ متوقّع يُترجم إلى رد JSON واضح بدل تسريب تفاصيل داخلية. */
export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  /** أخطاء على مستوى الحقول: { email: "البريد غير صالح", ... } */
  readonly fields?: Record<string, string>;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

type ErrorBody = {
  success: false;
  error: { code: ApiErrorCode; message: string; fields?: Record<string, string> };
  requestId: string;
};

/** رد ناجح موحّد: { success: true, data } */
export function ok<T>(data: T, requestId: string, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status, headers: { "x-request-id": requestId } },
  );
}

/** رد خطأ موحّد: { success: false, error: { code, message }, requestId } */
export function fail(
  code: ApiErrorCode,
  message: string,
  status: number,
  requestId: string,
  fields?: Record<string, string>,
) {
  const body: ErrorBody = {
    success: false,
    error: { code, message, ...(fields ? { fields } : {}) },
    requestId,
  };
  return NextResponse.json(body, {
    status,
    headers: { "x-request-id": requestId, "cache-control": "no-store" },
  });
}

/**
 * يحوّل أي استثناء إلى رد HTTP آمن.
 * التفاصيل التقنية تُسجَّل في السجل مع requestId ولا تظهر للعميل أبداً.
 */
export function toErrorResponse(error: unknown, requestId: string) {
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.status, requestId, error.fields);
  }

  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }),
  );

  return fail("INTERNAL_ERROR", "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.", 500, requestId);
}
