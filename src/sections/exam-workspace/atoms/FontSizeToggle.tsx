"use client";

import clsx from "clsx";
import type { FC } from "react";

export type ExamFontSize = "sm" | "base" | "lg" | "xl";

export interface FontSizeToggleProps {
  fontSize: ExamFontSize;
  onChange: (size: ExamFontSize) => void;
  className?: string;
}

const fontOptions: { value: ExamFontSize; label: string; title: string }[] = [
  { value: "sm", label: "A-", title: "Ukuran Teks Kecil (14px)" },
  { value: "base", label: "A", title: "Ukuran Teks Normal (16px)" },
  { value: "lg", label: "A+", title: "Ukuran Teks Besar (18px)" },
  { value: "xl", label: "A++", title: "Ukuran Teks Ekstra Besar (20px)" },
];

export const FontSizeToggle: FC<FontSizeToggleProps> = ({
  fontSize,
  onChange,
  className,
}) => {
  return (
    <fieldset
      aria-label="Pilihan Ukuran Huruf Soal"
      className={clsx(
        "inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs border-none m-0",
        className,
      )}
    >
      <span className="px-2 text-[10px] font-bold text-slate-400 uppercase select-none hidden sm:inline">
        Ukuran Teks:
      </span>
      {fontOptions.map((opt) => {
        const isActive = fontSize === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-150 select-none",
              isActive
                ? "bg-[#0d2b5c] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </fieldset>
  );
};

export default FontSizeToggle;
