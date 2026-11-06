"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** نص خطأ يظهر أسفل الحقل ويُربط به عبر aria-describedby. */
  error?: string;
}

const baseClasses =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none " +
  "transition placeholder:text-ink-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900 " +
  "aria-[invalid=true]:border-warning-600 disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, ...rest },
  ref,
) {
  return (
    <div>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={[baseClasses, className].filter(Boolean).join(" ")}
        {...rest}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} role="alert" className="mt-1.5 text-xs text-warning-700">
          {error}
        </p>
      )}
    </div>
  );
});
