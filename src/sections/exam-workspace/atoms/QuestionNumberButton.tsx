"use client";

import clsx from "clsx";
import type { FC } from "react";

export interface QuestionNumberButtonProps {
  number: number;
  isActive?: boolean;
  isAnswered?: boolean;
  isFlagged?: boolean;
  onClick: () => void;
  className?: string;
}

export const QuestionNumberButton: FC<QuestionNumberButtonProps> = ({
  number,
  isActive = false,
  isAnswered = false,
  isFlagged = false,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Nomor Soal ${number}${isActive ? " (Aktif)" : ""}${isAnswered ? " (Sudah Dijawab)" : ""}${isFlagged ? " (Ragu-ragu)" : ""}`}
      className={clsx(
        "relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none outline-none",
        // Flagged (Ragu-ragu) state takes priority or combines with answered
        isFlagged
          ? "bg-[#eab308] text-slate-950 shadow-xs hover:bg-[#ca8a04]"
          : isAnswered
            ? "bg-[#0d2b5c] text-white shadow-xs hover:bg-[#163b78]"
            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        // Active indicator ring
        isActive && "ring-3 ring-[#0097a7] ring-offset-2 scale-105 z-10",
        className,
      )}
    >
      <span>{number}</span>

      {/* Flagged mini indicator corner dot if also answered */}
      {isFlagged && isAnswered && (
        <span
          title="Ragu-ragu"
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-white ring-1 ring-amber-500"
        />
      )}
    </button>
  );
};

export default QuestionNumberButton;
