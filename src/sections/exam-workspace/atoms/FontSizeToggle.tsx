"use client";

import clsx from "clsx";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";

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
          <Button
            key={opt.value}
            type="button"
            title={opt.title}
            aria-pressed={isActive}
            size="sm"
            variant={isActive ? "filled" : "ghost"}
            color={isActive ? "primary" : "secondary"}
            onClick={() => onChange(opt.value)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg"
          >
            {opt.label}
          </Button>
        );
      })}
    </fieldset>
  );
};

export default FontSizeToggle;
