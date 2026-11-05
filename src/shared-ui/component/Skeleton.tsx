// File: src/shared-ui/component/Skeleton.tsx

"use client";

import clsx from "clsx";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

type Animation = "pulse" | "shimmer";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

interface Props {
  className?: string;

  width?: number | string;

  height?: number | string;

  rounded?: boolean;

  circle?: boolean;

  count?: number;

  gap?: number | string;

  animation?: Animation;
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function Skeleton({
  className,

  width = "100%",

  height = 20,

  rounded = true,

  circle = false,

  count = 1,

  gap = 8,

  animation = "shimmer",
}: Props) {
  ////////////////////////////////////////////////////////////
  // ITEMS
  ////////////////////////////////////////////////////////////

  const items = Array.from(
    {
      length: count,
    },
    (_, index) => `skeleton-${index + 1}`,
  );

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col" style={{ gap }}>
      {items.map((item) => (
        <div
          key={item}
          className={clsx(
            "relative overflow-hidden bg-slate-200 dark:bg-slate-700",

            rounded && !circle && "rounded-md",

            circle && "rounded-full",

            animation === "pulse" && "animate-pulse",

            animation === "shimmer" && [
              "before:absolute",
              "before:inset-0",
              "before:-translate-x-full",
              "before:animate-[shimmer_1.5s_infinite]",
              "before:bg-gradient-to-r",
              "before:from-transparent",
              "before:via-white/70",
              "before:to-transparent",
            ],

            className,
          )}
          style={{
            width,
            height,
          }}
        />
      ))}
    </div>
  );
}
