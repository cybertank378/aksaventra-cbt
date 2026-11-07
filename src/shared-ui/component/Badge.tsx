"use client";

import clsx from "clsx";
import type React from "react";

export type BadgeColor =
  | "primary"
  | "secondary"
  | "teal"
  | "gold"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type BadgeVariant = "soft" | "filled" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const colorStyles: Record<BadgeVariant, Record<BadgeColor, string>> = {
  soft: {
    primary: "bg-[#0d2b5c]/10 text-[#0d2b5c] border border-[#0d2b5c]/20",
    secondary: "bg-[#0097a7]/10 text-[#0097a7] border border-[#0097a7]/20",
    teal: "bg-[#0097a7]/10 text-[#0097a7] border border-[#0097a7]/20",
    gold: "bg-[#eab308]/15 text-[#ca8a04] border border-[#eab308]/30",
    warning: "bg-[#eab308]/15 text-[#ca8a04] border border-[#eab308]/30",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    error: "bg-rose-50 text-rose-700 border border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  filled: {
    primary: "bg-[#0d2b5c] text-white",
    secondary: "bg-[#0097a7] text-white",
    teal: "bg-[#0097a7] text-white",
    gold: "bg-[#eab308] text-slate-900 font-semibold",
    warning: "bg-[#eab308] text-slate-900 font-semibold",
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    neutral: "bg-slate-600 text-white",
  },
  outline: {
    primary: "border-2 border-[#0d2b5c] text-[#0d2b5c] bg-transparent",
    secondary: "border-2 border-[#0097a7] text-[#0097a7] bg-transparent",
    teal: "border-2 border-[#0097a7] text-[#0097a7] bg-transparent",
    gold: "border-2 border-[#eab308] text-[#ca8a04] bg-transparent",
    warning: "border-2 border-[#eab308] text-[#ca8a04] bg-transparent",
    success: "border-2 border-emerald-600 text-emerald-600 bg-transparent",
    error: "border-2 border-rose-600 text-rose-600 bg-transparent",
    neutral: "border-2 border-slate-400 text-slate-700 bg-transparent",
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs font-medium rounded-md",
  md: "px-2.5 py-1 text-xs font-semibold rounded-lg",
  lg: "px-3.5 py-1.5 text-sm font-semibold rounded-lg",
};

export default function Badge({
  children,
  color = "primary",
  variant = "soft",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center transition-colors select-none",
        colorStyles[variant][color],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
