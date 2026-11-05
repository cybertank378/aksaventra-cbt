//Files: src/shared-ui/component/Badge.tsx

"use client";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

import clsx from "clsx";
import type React from "react";

export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BadgeVariant = "soft" | "filled" | "outline";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

interface BadgeProps {
  children: React.ReactNode;

  color?: BadgeColor;

  variant?: BadgeVariant;

  className?: string;
}

//////////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////////

const badgeStyles: Record<BadgeVariant, Record<BadgeColor, string>> = {
  soft: {
    primary: "bg-emerald-100 text-emerald-700 border border-emerald-200",

    secondary: "bg-slate-100 text-slate-700 border border-slate-200",

    success: "bg-emerald-100 text-emerald-700 border border-emerald-200",

    warning: "bg-orange-100 text-orange-700 border border-orange-200",

    error: "bg-red-100 text-red-700 border border-red-200",

    info: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  },

  filled: {
    primary: "bg-emerald-600 text-white border border-emerald-600",

    secondary: "bg-slate-600 text-white border border-slate-600",

    success: "bg-emerald-600 text-white border border-emerald-600",

    warning: "bg-orange-600 text-white border border-orange-600",

    error: "bg-red-600 text-white border border-red-600",

    info: "bg-cyan-600 text-white border border-cyan-600",
  },

  outline: {
    primary: "bg-transparent text-emerald-700 border border-emerald-300",

    secondary: "bg-transparent text-slate-700 border border-slate-300",

    success: "bg-transparent text-emerald-700 border border-emerald-300",

    warning: "bg-transparent text-orange-700 border border-orange-300",

    error: "bg-transparent text-red-700 border border-red-300",

    info: "bg-transparent text-cyan-700 border border-cyan-300",
  },
};

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function Badge({
  children,

  color = "secondary",

  variant = "soft",

  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        badgeStyles[variant][color],
        className,
      )}
    >
      {children}
    </span>
  );
}
