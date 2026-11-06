"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** يمتد الزر على كامل عرض الحاوية (مفيد في الجوال وصفحة الدفع). */
  fullWidth?: boolean;
  /** يعطّل الزر ويعرض مؤشر تحميل دون أن يضيع عرضه. */
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-50 " +
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950",
  secondary: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  outline:
    "border border-ink-900 bg-transparent text-ink-900 hover:bg-ink-900 hover:text-white active:bg-ink-950",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    leadingIcon,
    trailingIcon,
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!isLoading && trailingIcon}
    </button>
  );
});
