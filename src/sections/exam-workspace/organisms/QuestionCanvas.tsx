"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type { QuestionItemDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import { shouldIgnoreExamShortcut } from "@/security/quizFocusGuard";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import FontSizeToggle, { type ExamFontSize } from "../atoms/FontSizeToggle";
import QuestionStemRenderer from "../molecules/QuestionStemRenderer";

export interface QuestionCanvasProps {
  question: QuestionItemDTO;
  currentIndex: number;
  totalQuestions: number;
  currentAnswer?: unknown;
  isFlagged?: boolean;
  onAnswerChange: (questionId: number, answer: unknown) => void;
  onToggleFlag: (questionId: number) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onSubmitExam?: () => void;
  className?: string;
}

export const QuestionCanvas: FC<QuestionCanvasProps> = ({
  question,
  currentIndex,
  totalQuestions,
  currentAnswer,
  isFlagged = false,
  onAnswerChange,
  onToggleFlag,
  onPrevQuestion,
  onNextQuestion,
  onSubmitExam,
  className,
}) => {
  const [fontSize, setFontSize] = useState<ExamFontSize>("base");

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Keyboard shortcut listener (A-E, R, ArrowLeft, ArrowRight)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreExamShortcut(event.target)) {
        return;
      }

      const key = event.key.toUpperCase();

      // Ragu-ragu shortcut
      if (key === "R") {
        event.preventDefault();
        onToggleFlag(question.questionId);
        return;
      }

      // Prev / Next arrow shortcuts
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (!isFirstQuestion) onPrevQuestion();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!isLastQuestion) onNextQuestion();
        return;
      }

      // Option A-E selection shortcuts for multichoice
      if (question.options && question.options.length > 0) {
        const optionIndex = ["A", "B", "C", "D", "E"].indexOf(key);
        if (optionIndex !== -1 && question.options[optionIndex]) {
          event.preventDefault();
          onAnswerChange(
            question.questionId,
            question.options[optionIndex].key,
          );
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    question,
    isFirstQuestion,
    isLastQuestion,
    onAnswerChange,
    onToggleFlag,
    onPrevQuestion,
    onNextQuestion,
  ]);

  return (
    <Card
      variant="elevated"
      className={clsx("flex flex-col min-h-[500px] bg-white", className)}
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#0d2b5c] px-3.5 py-1 text-sm font-black text-white shadow-xs">
            Soal No. {currentIndex + 1}
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            dari {totalQuestions} Butir
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FontSizeToggle fontSize={fontSize} onChange={setFontSize} />
        </div>
      </div>

      {/* 2. Main Question Body (Stem & KaTeX) */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6">
        <QuestionStemRenderer
          htmlContent={question.stemHtml}
          fontSize={fontSize}
        />

        {/* 3. Options Rendering */}
        {question.options && question.options.length > 0 ? (
          <div
            role="radiogroup"
            aria-label={`Pilihan jawaban nomor ${currentIndex + 1}`}
            className="flex flex-col gap-3 pt-2"
          >
            {question.options.map((opt) => {
              const isSelected = currentAnswer === opt.key;
              return (
                <label
                  key={opt.key}
                  className={clsx(
                    "flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "border-[#0097a7] bg-[#0097a7]/5 shadow-xs ring-2 ring-[#0097a7]/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${question.questionId}`}
                    value={opt.key}
                    checked={isSelected}
                    onChange={() =>
                      onAnswerChange(question.questionId, opt.key)
                    }
                    className="sr-only"
                  />
                  {/* Option Badge Key (A, B, C, D, E) */}
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors",
                      isSelected
                        ? "bg-[#0097a7] text-white"
                        : "border border-slate-300 bg-slate-100 text-slate-700",
                    )}
                  >
                    {opt.key}
                  </span>

                  {/* Option Text / KaTeX */}
                  <QuestionStemRenderer
                    htmlContent={opt.html}
                    fontSize={fontSize}
                    className="flex-1 pt-1"
                  />
                </label>
              );
            })}
          </div>
        ) : (
          /* Essay / Shortanswer Text Input */
          <div className="flex flex-col gap-2 pt-2">
            <label
              htmlFor={`essay-input-${question.questionId}`}
              className="text-xs font-bold text-slate-600 uppercase tracking-wider"
            >
              Jawaban Uraian / Isian Singkat:
            </label>
            <textarea
              id={`essay-input-${question.questionId}`}
              rows={5}
              value={typeof currentAnswer === "string" ? currentAnswer : ""}
              onChange={(e) =>
                onAnswerChange(question.questionId, e.target.value)
              }
              placeholder="Ketik jawaban Anda di sini..."
              className="w-full rounded-2xl border border-slate-300 p-4 text-slate-800 placeholder-slate-400 outline-none focus:border-[#0097a7] focus:ring-4 focus:ring-[#0097a7]/20"
            />
          </div>
        )}
      </div>

      {/* 4. Canvas Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        {/* Previous Button */}
        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="md"
          disabled={isFirstQuestion}
          onClick={onPrevQuestion}
          leftIcon={ChevronLeft}
        >
          Sebelumnya
        </Button>

        {/* Ragu-ragu Toggle Button */}
        <Button
          type="button"
          variant={isFlagged ? "filled" : "outline"}
          color="gold"
          size="md"
          onClick={() => onToggleFlag(question.questionId)}
          leftIcon={Flag}
          className="font-bold"
        >
          {isFlagged ? "Ragu-ragu (Aktif)" : "Ragu-ragu"}
        </Button>

        {/* Next / Submit Button */}
        {isLastQuestion ? (
          <Button
            type="button"
            variant="filled"
            color="danger"
            size="md"
            onClick={onSubmitExam}
            rightIcon={Send}
            className="font-bold shadow-xs"
          >
            Selesai Ujian
          </Button>
        ) : (
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="md"
            onClick={onNextQuestion}
            rightIcon={ChevronRight}
          >
            Selanjutnya
          </Button>
        )}
      </div>
    </Card>
  );
};

export default QuestionCanvas;
