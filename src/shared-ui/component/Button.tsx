"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  type ButtonHTMLAttributes,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export type ButtonVariant = "filled" | "outline" | "ghost" | "soft" | "text";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonColor =
  | "primary"
  | "teal"
  | "gold"
  | "secondary"
  | "danger"
  | "success"
  | "error";

export type ButtonShape = "rounded" | "circle" | "square";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  shape?: ButtonShape | string;
  iconOnly?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

export type Props = ButtonProps;

const colorVariantStyles: Record<
  "filled" | "outline" | "ghost" | "soft",
  Record<
    "primary" | "teal" | "gold" | "secondary" | "danger" | "success",
    string
  >
> = {
  filled: {
    primary:
      "bg-[#0d2b5c] text-white hover:bg-[#163b78] active:bg-[#081d3f] shadow-sm",
    teal: "bg-[#0097a7] text-white hover:bg-[#007987] active:bg-[#006064] shadow-sm",
    gold: "bg-[#eab308] text-slate-950 font-bold hover:bg-[#ca8a04] active:bg-[#a16207] shadow-sm",
    secondary:
      "bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm",
  },
  outline: {
    primary:
      "border-2 border-[#0d2b5c] text-[#0d2b5c] hover:bg-[#0d2b5c]/10 active:bg-[#0d2b5c]/20 bg-transparent",
    teal: "border-2 border-[#0097a7] text-[#0097a7] hover:bg-[#0097a7]/10 active:bg-[#0097a7]/20 bg-transparent",
    gold: "border-2 border-[#eab308] text-[#ca8a04] hover:bg-[#eab308]/10 active:bg-[#eab308]/20 bg-transparent font-semibold",
    secondary:
      "border-2 border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 bg-transparent",
    danger:
      "border-2 border-rose-600 text-rose-600 hover:bg-rose-50 active:bg-rose-100 bg-transparent",
    success:
      "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 bg-transparent",
  },
  soft: {
    primary:
      "bg-[#0d2b5c]/10 text-[#0d2b5c] hover:bg-[#0d2b5c]/20 active:bg-[#0d2b5c]/30",
    teal: "bg-[#0097a7]/10 text-[#0097a7] hover:bg-[#0097a7]/20 active:bg-[#0097a7]/30",
    gold: "bg-[#eab308]/15 text-[#ca8a04] hover:bg-[#eab308]/25 active:bg-[#eab308]/35 font-semibold",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200",
    success:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200",
  },
  ghost: {
    primary: "text-[#0d2b5c] hover:bg-[#0d2b5c]/10 active:bg-[#0d2b5c]/20",
    teal: "text-[#0097a7] hover:bg-[#0097a7]/10 active:bg-[#0097a7]/20",
    gold: "text-[#ca8a04] hover:bg-[#eab308]/10 active:bg-[#eab308]/20 font-semibold",
    secondary: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
    danger: "text-rose-600 hover:bg-rose-50 active:bg-rose-100",
    success: "text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100",
  },
};

const sizeStyles: Record<ButtonSize, { standard: string; iconOnly: string }> = {
  sm: {
    standard: "px-3 py-1.5 text-xs font-medium gap-1.5",
    iconOnly: "p-1.5 text-xs",
  },
  md: {
    standard: "px-4 py-2 text-sm font-semibold gap-2",
    iconOnly: "p-2 text-sm",
  },
  lg: {
    standard: "px-6 py-3 text-base font-semibold gap-2.5",
    iconOnly: "p-3 text-base",
  },
};

export function getButtonClasses({
  variant = "filled",
  size = "md",
  color = "primary",
  shape = "rounded",
  iconOnly = false,
  fullWidth = false,
  isDisabled = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  shape?: ButtonShape | string;
  iconOnly?: boolean;
  fullWidth?: boolean;
  isDisabled?: boolean;
  className?: string;
} = {}): string {
  const resolvedVariant = variant === "text" ? "ghost" : variant;
  const resolvedColor = color === "error" ? "danger" : color;

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
        ? "rounded-none"
        : size === "sm"
          ? "rounded-lg"
          : "rounded-xl";

  const sizeClass = iconOnly
    ? sizeStyles[size].iconOnly
    : sizeStyles[size].standard;

  return clsx(
    "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7] focus-visible:ring-offset-2",
    colorVariantStyles[resolvedVariant][resolvedColor],
    shapeClass,
    sizeClass,
    fullWidth && "w-full",
    isDisabled &&
      "opacity-50 cursor-not-allowed pointer-events-none shadow-none",
    className,
  );
}

export default function Button({
  children,
  variant = "filled",
  size = "md",
  color = "primary",
  shape = "rounded",
  iconOnly = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = getButtonClasses({
    variant,
    size,
    color,
    shape,
    iconOnly,
    fullWidth,
    isDisabled,
    className,
  });

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: clsx(classes, child.props.className),
    });
  }

  return (
    <button type={type} disabled={isDisabled} className={classes} {...props}>
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <title>Loading</title>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : LeftIcon ? (
        <LeftIcon className="h-4 w-4 shrink-0" />
      ) : null}

      {children}

      {!loading && RightIcon ? (
        <RightIcon className="h-4 w-4 shrink-0" />
      ) : null}
    </button>
  );
}

export { Button };
