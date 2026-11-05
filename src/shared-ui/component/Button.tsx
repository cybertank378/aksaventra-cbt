// Files: src/shared-ui/component/Button.tsx

"use client";

import { Slot } from "@radix-ui/react-slot";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

type Variant = "filled" | "label" | "outline" | "text" | "ghost";

type Size = "lg" | "md" | "sm";

type Shape = "rounded" | "circle";

type Color = "primary" | "secondary" | "error" | "warning" | "info" | "success";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;

  variant?: Variant;

  size?: Size;

  color?: Color;

  leftIcon?: LucideIcon;

  rightIcon?: LucideIcon;

  loading?: boolean;

  iconOnly?: boolean;

  shape?: Shape;

  fullWidth?: boolean;

  asChild?: boolean;
}

//////////////////////////////////////////////////////////////
// BASE STYLES
//////////////////////////////////////////////////////////////
const baseStyles =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
//////////////////////////////////////////////////////////////
// SIZE STYLES
//////////////////////////////////////////////////////////////

const sizeStyles: Record<Size, string> = {
  lg: "px-6 py-3 text-base",

  md: "px-4 py-2 text-sm",

  sm: "px-3 py-1.5 text-xs",
};

//////////////////////////////////////////////////////////////
// ICON ONLY SIZE
//////////////////////////////////////////////////////////////

const iconOnlySizeStyles: Record<Size, string> = {
  lg: "h-11 w-11 p-0",

  md: "h-10 w-10 p-0",

  sm: "h-9 w-9 p-0",
};

//////////////////////////////////////////////////////////////
// ICON SIZE
//////////////////////////////////////////////////////////////

const iconSizeMap: Record<Size, number> = {
  lg: 18,

  md: 16,

  sm: 14,
};

//////////////////////////////////////////////////////////////
// SHAPE
//////////////////////////////////////////////////////////////

const shapeStyles: Record<Shape, string> = {
  rounded: "rounded-lg",

  circle: "rounded-full aspect-square",
};

//////////////////////////////////////////////////////////////
// COLOR MAP
//////////////////////////////////////////////////////////////

const colorMap: Record<Color, Record<Variant, string>> = {
  primary: {
    filled:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-400",

    label:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300",

    outline:
      "border border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100",

    text: "text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100",

    ghost: "text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100",
  },

  secondary: {
    filled:
      "bg-slate-600 text-white hover:bg-slate-700 active:bg-slate-800 focus:ring-slate-400",

    label: "bg-slate-200 text-slate-700 hover:bg-slate-300 active:bg-slate-400",

    outline:
      "border border-slate-500 text-slate-600 hover:bg-slate-100 active:bg-slate-200",

    text: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",

    ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
  },

  error: {
    filled:
      "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-400",

    label: "bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300",

    outline:
      "border border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100",

    text: "text-red-500 hover:bg-red-50 active:bg-red-100",

    ghost: "text-red-500 hover:bg-red-50 active:bg-red-100",
  },

  warning: {
    filled:
      "bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 focus:ring-orange-400",

    label:
      "bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300",

    outline:
      "border border-orange-600 text-orange-600 hover:bg-orange-50 active:bg-orange-100",

    text: "text-orange-600 hover:bg-orange-50 active:bg-orange-100",

    ghost: "text-orange-600 hover:bg-orange-50 active:bg-orange-100",
  },

  info: {
    filled:
      "bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700 focus:ring-cyan-400",

    label: "bg-cyan-100 text-cyan-600 hover:bg-cyan-200 active:bg-cyan-300",

    outline:
      "border border-cyan-500 text-cyan-500 hover:bg-cyan-50 active:bg-cyan-100",

    text: "text-cyan-500 hover:bg-cyan-50 active:bg-cyan-100",

    ghost: "text-cyan-500 hover:bg-cyan-50 active:bg-cyan-100",
  },

  success: {
    filled:
      "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-400",

    label: "bg-green-100 text-green-600 hover:bg-green-200 active:bg-green-300",

    outline:
      "border border-green-500 text-green-500 hover:bg-green-50 active:bg-green-100",

    text: "text-green-500 hover:bg-green-50 active:bg-green-100",

    ghost: "text-green-500 hover:bg-green-50 active:bg-green-100",
  },
};

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function Button({
  children,

  variant = "filled",

  size = "md",

  color = "primary",

  leftIcon: LeftIcon,

  rightIcon: RightIcon,

  loading = false,

  iconOnly = false,

  shape = "rounded",

  fullWidth = false,

  className,

  disabled,

  type = "button",

  asChild = false,

  ...props
}: Props) {
  //////////////////////////////////////////////////////////////
  // COMPONENT
  //////////////////////////////////////////////////////////////

  const Comp = asChild ? Slot : "button";

  //////////////////////////////////////////////////////////////
  // ICON ONLY
  //////////////////////////////////////////////////////////////

  const isIconOnly = iconOnly || (!children && (LeftIcon || RightIcon));

  //////////////////////////////////////////////////////////////
  // ICON SIZE
  //////////////////////////////////////////////////////////////

  const iconSize = iconSizeMap[size];

  //////////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////////

  return (
    <Comp
      {...(!asChild && {
        type,

        disabled: disabled || loading,
      })}
      className={clsx(
        baseStyles,

        shapeStyles[shape],

        isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],

        colorMap[color][variant],

        fullWidth && "w-full",

        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <span className="inline-flex items-center gap-2">
          {LeftIcon && <LeftIcon size={iconSize} />}

          {!isIconOnly && children}

          {RightIcon && <RightIcon size={iconSize} />}
        </span>
      )}
    </Comp>
  );
}
