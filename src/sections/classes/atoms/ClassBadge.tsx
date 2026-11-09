"use client";

import clsx from "clsx";
import type { FC } from "react";

export interface ClassBadgeProps {
  name: string;
  className?: string;
  size?: "sm" | "md";
}

export const ClassBadge: FC<ClassBadgeProps> = ({
  name,
  className,
  size = "md",
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg font-bold bg-[#0d2b5c]/10 text-[#0d2b5c] border border-[#0d2b5c]/20",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {name}
    </span>
  );
};

export default ClassBadge;
