//Files: src/shared-ui/component/Chip.tsx
"use client";

import clsx from "clsx";
import type { FC, ReactNode } from "react";

type ChipVariant = "filled" | "outline" | "soft";
type ChipSize = "sm" | "md";

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
}

/* 🔥 Warna yang tersedia */
const colorPalette = [
  "indigo",
  "emerald",
  "rose",
  "amber",
  "sky",
  "violet",
  "blue",
  "green",
];

const baseStyle =
  "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200";

const sizeMap: Record<ChipSize, string> = {
  sm: "text-xs px-3 py-1",
  md: "text-sm px-4 py-1.5",
};

/* 🔥 Generate warna berdasarkan text */
function getColorFromText(text: string): string {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

export const Chip: FC<ChipProps> = ({
  children,
  variant = "filled",
  size = "md",
  className,
}) => {
  const text = typeof children === "string" ? children : String(children);

  const color = getColorFromText(text);

  const filledStyle = `bg-${color}-500 text-white`;
  const outlineStyle = `border border-${color}-500 text-${color}-600`;
  const softStyle = `bg-${color}-100 text-${color}-600`;

  return (
    <span
      className={clsx(
        baseStyle,
        sizeMap[size],
        variant === "filled" && filledStyle,
        variant === "outline" && outlineStyle,
        variant === "soft" && softStyle,
        className,
      )}
    >
      {children}
    </span>
  );
};
