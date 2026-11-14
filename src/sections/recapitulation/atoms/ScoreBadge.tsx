"use client";

import clsx from "clsx";
import type { FC } from "react";

export interface ScoreBadgeProps {
  score: number;
  passingGrade?: number;
  className?: string;
}

export const ScoreBadge: FC<ScoreBadgeProps> = ({
  score,
  passingGrade = 75,
  className,
}) => {
  const isPassed = score >= passingGrade;

  return (
    <span
      className={clsx(
        "inline-flex items-center font-black px-2.5 py-0.5 rounded-full text-xs",
        isPassed
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
        className,
      )}
    >
      {score}
    </span>
  );
};

export default ScoreBadge;
