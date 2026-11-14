// Files: src/shared-ui/component/ui/Divider.tsx
"use client";

import clsx from "clsx";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed";
  thickness?: "thin" | "medium" | "thick";
  spacing?: "sm" | "md" | "lg";
  className?: string;
};

export default function Divider({
  orientation = "horizontal",
  variant = "solid",
  thickness = "thin",
  spacing = "md",
  className,
}: DividerProps) {
  const space = spacing === "sm" ? "my-3" : spacing === "lg" ? "my-8" : "my-5";

  const horizontalThickness =
    thickness === "thin" ? "h-px" : thickness === "medium" ? "h-0.5" : "h-1";

  const verticalThickness =
    thickness === "thin" ? "w-px" : thickness === "medium" ? "w-0.5" : "w-1";

  return (
    <div
      role="separator"
      className={clsx(
        orientation === "horizontal"
          ? [
              "w-full shrink-0",
              space,
              variant === "solid"
                ? ["bg-gray-300", horizontalThickness]
                : "border-t border-dashed border-gray-300",
            ]
          : [
              "h-full shrink-0 mx-4",
              variant === "solid"
                ? ["bg-gray-300", verticalThickness]
                : "border-l border-dashed border-gray-300",
            ],
        className,
      )}
    />
  );
}
