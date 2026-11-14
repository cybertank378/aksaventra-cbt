"use client";

import { BookOpen, ListFilter, RefreshCw, UploadCloud } from "lucide-react";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import ExamQuestionCard, {
  type ExamQuestionItemView,
} from "../molecules/ExamQuestionCard";

interface ExamQuestionsListProps {
  examTitle: string;
  questions: ExamQuestionItemView[];
  filteredQuestions: ExamQuestionItemView[];
  totalPoints: number;
  typeFilter: string;
  isLoading: boolean;
  onTypeFilterChange: (type: string) => void;
  onOpenImport: () => void;
  onEditQuestion: (questionId: string) => void;
}

const TYPE_FILTER_TABS = [
  { id: "ALL", label: "Semua" },
  { id: "multichoice", label: "Pilihan Ganda" },
  { id: "truefalse", label: "Benar/Salah" },
  { id: "shortanswer", label: "Isian" },
  { id: "numerical", label: "Numerik" },
  { id: "match", label: "Menjodohkan" },
  { id: "gapselect", label: "Rumpang" },
  { id: "essay", label: "Esai" },
];

export const ExamQuestionsList: FC<ExamQuestionsListProps> = ({
  examTitle,
  questions,
  filteredQuestions,
  totalPoints,
  typeFilter,
  isLoading,
  onTypeFilterChange,
  onOpenImport,
  onEditQuestion,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card bodyClassName="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Naskah Ujian
          </p>
          <p className="text-base font-extrabold text-[#0d2b5c] mt-1 truncate">
            {examTitle}
          </p>
        </Card>

        <Card bodyClassName="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Jumlah Soal Terdaftar
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {questions.length}{" "}
            <span className="text-xs font-medium text-slate-500">Butir</span>
          </p>
        </Card>

        <Card bodyClassName="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Bobot Maksimal
          </p>
          <p className="text-2xl font-black text-teal-600 mt-1">
            {totalPoints.toFixed(1)}{" "}
            <span className="text-xs font-medium text-slate-500">Poin</span>
          </p>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">
            Filter Tipe Soal:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTER_TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={typeFilter === tab.id ? "filled" : "outline"}
              color={typeFilter === tab.id ? "primary" : "secondary"}
              onClick={() => onTypeFilterChange(tab.id)}
              className="rounded-xl"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Question Cards List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500 mt-2">
              Memuat naskah butir soal dari database...
            </p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">
              Belum ada butir soal pada naskah ini
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Gunakan tombol <strong>Import Soal</strong> untuk mengunggah
              berkas Excel/CSV atau klik <strong>Tambah Butir Soal</strong>{" "}
              untuk membuat soal baru.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                type="button"
                variant="filled"
                color="primary"
                size="sm"
                leftIcon={UploadCloud}
                onClick={onOpenImport}
              >
                Import Soal Excel
              </Button>
            </div>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <ExamQuestionCard key={q.id} question={q} onEdit={onEditQuestion} />
          ))
        )}
      </div>
    </div>
  );
};

export default ExamQuestionsList;
