//Files: src/shared-ui/component/RoleBadge.tsx
"use client";

import clsx from "clsx";

type Variant = "soft" | "solid" | "outline";
type Size = "sm" | "md" | "lg";

interface Props<T extends string> {
  role: T;
  icon?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

/* =========================================================
   SIZE MAP
   ========================================================= */
const sizeMap: Record<Size, string> = {
  sm: "text-xs px-2 py-1 gap-1",
  md: "text-sm px-3 py-1.5 gap-1.5",
  lg: "text-base px-4 py-2 gap-2",
};

/* =========================================================
   BASE STYLE MAP
   ========================================================= */
const variantBase: Record<Variant, string> = {
  soft: "bg-gray-100 text-gray-700",
  solid: "bg-gray-800 text-white",
  outline: "border border-gray-400 text-gray-700",
};

/* =========================================================
   COMPONENT
   ========================================================= */
export default function RoleBadge<T extends string>({
  role,
  icon,
  variant = "soft",
  size = "md",
  clickable = false,
  onClick,
  className,
}: Props<T>) {
  return (
    <span
      title={`Role: ${role}`}
      onClick={clickable ? onClick : undefined}
      className={clsx(
        "inline-flex items-center font-semibold rounded-full transition select-none",
        sizeMap[size],
        variantBase[variant],
        clickable && "cursor-pointer hover:opacity-80 active:scale-95",
        className,
      )}
    >
      {icon}
      <span>{role}</span>
    </span>
  );
}
