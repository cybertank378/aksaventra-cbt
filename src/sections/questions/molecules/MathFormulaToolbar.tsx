"use client";

import {
  Binary,
  Divide,
  HelpCircle,
  LineChart,
  Pi,
  Sparkles,
  Superscript,
} from "lucide-react";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";

interface MathFormulaToolbarProps {
  onInsertMath: (latex: string) => void;
  onOpenDiagramGenerator?: () => void;
  className?: string;
}

export const MathFormulaToolbar: FC<MathFormulaToolbarProps> = ({
  onInsertMath,
  onOpenDiagramGenerator,
  className = "",
}) => {
  const commonSnippets = [
    { label: "Pecahan", code: "\\frac{a}{b}", icon: Divide },
    { label: "Pangkat", code: "x^{2}", icon: Superscript },
    { label: "Akar", code: "\\sqrt{x}" },
    { label: "Akar-n", code: "\\sqrt[n]{x}" },
    { label: "Limit", code: "\\lim_{x \\to 0}" },
    { label: "Integral", code: "\\int_{a}^{b} f(x)\\,dx" },
    { label: "Sigma", code: "\\sum_{i=1}^{n} x_i" },
    { label: "Matriks", code: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", icon: Binary },
    { label: "±", code: "\\pm" },
    { label: "≠", code: "\\neq" },
    { label: "≤", code: "\\le" },
    { label: "≥", code: "\\ge" },
    { label: "≈", code: "\\approx" },
    { label: "π", code: "\\pi", icon: Pi },
    { label: "θ", code: "\\theta" },
    { label: "α", code: "\\alpha" },
    { label: "β", code: "\\beta" },
    { label: "∞", code: "\\infty" },
    { label: "Kurva f(x)", code: "f(x) = ax^2 + bx + c" },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Simbol Matematika:
        </span>

        {commonSnippets.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onInsertMath(`$${item.code}$`)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-[#0097a7] hover:text-[#0097a7] hover:bg-[#0097a7]/5 transition-colors cursor-pointer select-none"
            title={`Sisipkan formula ${item.label}`}
          >
            {item.icon && <item.icon className="w-3 h-3 text-slate-400" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {onOpenDiagramGenerator && (
        <Button
          type="button"
          variant="filled"
          color="primary"
          size="xs"
          leftIcon={LineChart}
          onClick={onOpenDiagramGenerator}
          className="shadow-2xs shrink-0"
        >
          Buat Kurva / Diagram
        </Button>
      )}
    </div>
  );
};

export default MathFormulaToolbar;
