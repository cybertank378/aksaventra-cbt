import type { FC } from "react";
import type { CBTQuestionType } from "@/modules/questions/domain/dto/QuestionDTO";

interface Props {
  type: CBTQuestionType;
}

const TYPE_CONFIG: Record<
  CBTQuestionType,
  { label: string; bg: string; text: string }
> = {
  multichoice: {
    label: "Pilihan Ganda Biasa",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  mcma: {
    label: "Pilihan Ganda Kompleks (MCMA)",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  truefalse: {
    label: "Benar / Salah",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
  shortanswer: {
    label: "Isian Singkat",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  numerical: {
    label: "Numerik / Toleransi",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  matching: {
    label: "Menjodohkan",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  cloze: {
    label: "Teks Rumpang (Cloze)",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  essay: {
    label: "Uraian / Esai",
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
};

export const QuestionTypeBadge: FC<Props> = ({ type }) => {
  const config = TYPE_CONFIG[type] || {
    label: type,
    bg: "bg-slate-100",
    text: "text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default QuestionTypeBadge;
