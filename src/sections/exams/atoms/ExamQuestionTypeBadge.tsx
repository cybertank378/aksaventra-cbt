"use client";

import type { FC } from "react";

interface ExamQuestionTypeBadgeProps {
  type: string;
}

const QUESTION_TYPE_LABELS: Record<string, { name: string; color: string }> = {
  multichoice: {
    name: "Pilihan Ganda Biasa",
    color: "bg-blue-50 text-blue-700",
  },
  multichoice_single: {
    name: "Pilihan Ganda Tunggal",
    color: "bg-blue-50 text-blue-700",
  },
  mcma: {
    name: "Pilihan Ganda Kompleks (MCMA)",
    color: "bg-indigo-50 text-indigo-700",
  },
  multichoice_multi: {
    name: "Pilihan Ganda Kompleks (MCMA)",
    color: "bg-indigo-50 text-indigo-700",
  },
  truefalse: { name: "Benar / Salah", color: "bg-teal-50 text-teal-700" },
  shortanswer: { name: "Isian Singkat", color: "bg-amber-50 text-amber-700" },
  numerical: {
    name: "Numerik & Toleransi",
    color: "bg-emerald-50 text-emerald-700",
  },
  matching: { name: "Menjodohkan", color: "bg-purple-50 text-purple-700" },
  match: { name: "Menjodohkan", color: "bg-purple-50 text-purple-700" },
  cloze: { name: "Teks Rumpang (Cloze)", color: "bg-rose-50 text-rose-700" },
  gapselect: {
    name: "Teks Rumpang (Cloze)",
    color: "bg-rose-50 text-rose-700",
  },
  essay: { name: "Uraian / Esai Bebas", color: "bg-slate-100 text-slate-700" },
};

export const ExamQuestionTypeBadge: FC<ExamQuestionTypeBadgeProps> = ({
  type,
}) => {
  const typeMeta = QUESTION_TYPE_LABELS[type] || {
    name: type.toUpperCase(),
    color: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${typeMeta.color}`}
    >
      {typeMeta.name}
    </span>
  );
};

export default ExamQuestionTypeBadge;
