"use client";

import { CheckCircle2, Flag, HelpCircle, Send } from "lucide-react";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import QuestionNumberButton from "../atoms/QuestionNumberButton";

export interface QuestionNavGridProps {
  totalQuestions: number;
  currentIndex: number;
  questionIds: number[];
  answers: Record<number, { ans: unknown; flag: boolean }>;
  onSelectQuestion: (index: number) => void;
  onSubmitExam?: () => void;
  className?: string;
}

export const QuestionNavGrid: FC<QuestionNavGridProps> = ({
  totalQuestions,
  currentIndex,
  questionIds,
  answers,
  onSelectQuestion,
  onSubmitExam,
  className,
}) => {
  // Count stats
  let answeredCount = 0;
  let flaggedCount = 0;

  for (const qid of questionIds) {
    const entry = answers[qid];
    if (entry) {
      if (entry.flag) flaggedCount++;
      const isAnsValid =
        entry.ans !== null &&
        entry.ans !== undefined &&
        entry.ans !== "" &&
        (!Array.isArray(entry.ans) || entry.ans.length > 0);
      if (isAnsValid) answeredCount++;
    }
  }

  const unAnsweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <Card
      variant="elevated"
      title="Daftar Nomor Soal"
      subtitle={`Total ${totalQuestions} butir soal`}
      className={className}
    >
      <div className="flex flex-col gap-5 p-4 sm:p-5">
        {/* Legend Summary */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-[11px] font-semibold">
          <div className="flex items-center justify-center gap-1.5 text-[#0d2b5c]">
            <CheckCircle2 size={13} className="text-[#0d2b5c]" />
            <span>Dijawab: {answeredCount}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-amber-700">
            <Flag size={13} className="text-[#eab308]" />
            <span>Ragu: {flaggedCount}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-slate-500">
            <HelpCircle size={13} className="text-slate-400" />
            <span>Kosong: {unAnsweredCount}</span>
          </div>
        </div>

        {/* Buttons Grid */}
        <section
          aria-label="Palet navigasi nomor soal"
          className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1 scrollbar-thin"
        >
          {questionIds.map((qid, index) => {
            const entry = answers[qid];
            const isAnswered = Boolean(
              entry &&
                entry.ans !== null &&
                entry.ans !== undefined &&
                entry.ans !== "" &&
                (!Array.isArray(entry.ans) || entry.ans.length > 0),
            );
            const isFlagged = Boolean(entry?.flag);
            const isActive = index === currentIndex;

            return (
              <QuestionNumberButton
                key={`q-slot-${qid}-${index + 1}`}
                number={index + 1}
                isActive={isActive}
                isAnswered={isAnswered}
                isFlagged={isFlagged}
                onClick={() => onSelectQuestion(index)}
              />
            );
          })}
        </section>

        {/* Submit Exam Trigger Button */}
        {onSubmitExam && (
          <div className="border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="filled"
              color="danger"
              size="md"
              fullWidth
              onClick={onSubmitExam}
              leftIcon={Send}
              className="font-bold shadow-xs"
            >
              Kumpulkan Ujian Sekarang
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuestionNavGrid;
