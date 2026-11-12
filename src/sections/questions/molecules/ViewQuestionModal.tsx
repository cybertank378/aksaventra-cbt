"use client";

import {
  Award,
  BookOpen,
  CheckCircle2,
  Edit3,
  HelpCircle,
  X,
} from "lucide-react";
import type { FC } from "react";
import type { QuestionDTO } from "@/modules/questions/domain/dto/QuestionDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import MathRenderer from "@/shared-ui/component/MathRenderer";
import Modal from "@/shared-ui/component/Modal";
import QuestionTypeBadge from "../atoms/QuestionTypeBadge";

interface ViewQuestionModalProps {
  open: boolean;
  question: QuestionDTO | null;
  onClose: () => void;
  onEdit?: (question: QuestionDTO) => void;
}

export const ViewQuestionModal: FC<ViewQuestionModalProps> = ({
  open,
  question,
  onClose,
  onEdit,
}) => {
  if (!question) return null;

  const handleEditClick = () => {
    onClose();
    if (onEdit) {
      onEdit(question);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detail Butir Soal: ${question.code}`}
      subtitle={`${question.subject} • Kelas ${question.gradeLevel}`}
      size="lg"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Badges Overview */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="neutral" size="sm" className="font-mono font-extrabold text-[#0d2b5c]">
              {question.code}
            </Badge>
            <QuestionTypeBadge type={question.type} />
            <Badge color="neutral" size="sm" className="text-slate-600 font-semibold">
              {question.subject}
            </Badge>
            <Badge color="neutral" size="sm" className="text-slate-600 font-semibold">
              Kelas {question.gradeLevel}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0097a7]">
              <Award className="w-4 h-4" />
              <span>{question.points} Poin</span>
            </div>
            {question.tolerance !== undefined && (
              <Badge color="neutral" size="sm" className="text-amber-700 bg-amber-50 border border-amber-200">
                Toleransi: ±{question.tolerance}
              </Badge>
            )}
          </div>
        </div>

        {/* Question Stem */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <BookOpen className="w-4 h-4 text-[#0097a7]" />
            <span>Stem Pertanyaan / Teks Soal:</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed shadow-2xs">
            <MathRenderer content={question.stem} />
          </div>
        </div>

        {/* Options / Answer Keys */}
        {question.options && question.options.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Daftar Opsi Jawaban & Kunci:
              </span>
              <span className="text-[11px] text-slate-400">
                {question.options.length} Pilihan Jawaban
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {question.options.map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                    opt.isCorrect
                      ? "bg-emerald-50/70 border-emerald-300 shadow-2xs"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black shrink-0 ${
                        opt.isCorrect
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </span>
                    <MathRenderer
                      content={opt.text}
                      className="text-xs font-medium text-slate-800 pt-1 leading-relaxed flex-1"
                    />
                  </div>

                  {opt.isCorrect && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-100/60 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Kunci Jawaban
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Pembahasan / Keterangan Kunci:</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
              <MathRenderer content={question.explanation} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            color="secondary"
            size="sm"
            leftIcon={X}
            onClick={onClose}
          >
            Tutup
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={Edit3}
              onClick={handleEditClick}
            >
              Edit Soal Ini
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewQuestionModal;

