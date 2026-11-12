"use client";

import {
  ArrowLeft,
  BookOpen,
  Download,
  ListFilter,
  Plus,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import { ImportQuestionsModal } from "@/sections/questions/molecules/ImportQuestionsModal";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

export interface ExamQuestionsSectionProps {
  examId: string;
  userRole?: UserRole;
}

export interface QuestionItemView {
  id: string;
  slot: number;
  type: string;
  stem: string;
  points: number;
  optionsSummary?: string;
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

interface RawQuestionData {
  id?: string | number;
  questionId?: number;
  slot?: number;
  type?: string;
  stemHtml?: string;
  questionText?: string;
  stem?: string;
  text?: string;
  maxScore?: number;
  points?: number;
  options?: unknown[];
}

export const ExamQuestionsSection: FC<ExamQuestionsSectionProps> = ({
  examId,
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { fetchExam } = useExamManagementApi(examId);
  const [questions, setQuestions] = useState<QuestionItemView[]>([]);
  const [examTitle, setExamTitle] = useState(`Ujian #${examId}`);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchExam(examId);
      if (data) {
        setExamTitle(data.title || data.courseName || `Ujian #${examId}`);
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mapped: QuestionItemView[] = data.questions.map(
            (q: RawQuestionData, idx: number) => ({
              id: String(q.id || q.questionId || `q-${idx + 1}`),
              slot: q.slot || idx + 1,
              type: q.type || "multichoice_single",
              stem: q.questionText || q.stemHtml || q.stem || q.text || "",
              points: q.maxScore || q.points || 1.0,
              optionsSummary: q.options
                ? `${q.options.length} Pilihan Jawaban`
                : undefined,
            }),
          );
          setQuestions(mapped);
          return;
        }
      }
    } catch {
      // Keep empty if network fails
    } finally {
      setIsLoading(false);
    }
  }, [examId, fetchExam]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filtered = questions.filter((q) => {
    if (typeFilter === "ALL") return true;
    return q.type.toLowerCase().includes(typeFilter.toLowerCase());
  });

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleBackToExams = () => {
    router.replace("/dashboard/exams");
  };

  const handleProcessDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={handleBackToExams}
        >
          Kembali ke Daftar Ujian
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_import_soal.xlsx",
                "sample_import_soal.xlsx"
              )
            }
            title="Unduh Template Format Excel (.xlsx)"
          >
            Template Excel (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleProcessDownload(
                "/templates/sample_import_soal.xls",
                "sample_import_soal.xls"
              )
            }
            title="Unduh Template Format Excel (.xls)"
          >
            .xls
          </Button>

          <Button
            type="button"
            variant="outline"
            color="primary"
            size="sm"
            leftIcon={UploadCloud}
            onClick={() => setImportModalOpen(true)}
          >
            Import Soal (8 Jenis)
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() =>
              router.push(`/dashboard/questions/new?examId=${examId}`)
            }
          >
            Tambah Butir Soal
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Naskah Ujian
          </p>
          <p className="text-base font-extrabold text-[#0d2b5c] mt-1 truncate">
            {examTitle}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Jumlah Soal Terdaftar
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {questions.length}{" "}
            <span className="text-xs font-medium text-slate-500">Butir</span>
          </p>
        </Card>

        <Card className="p-5">
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
          {[
            { id: "ALL", label: "Semua" },
            { id: "multichoice", label: "Pilihan Ganda" },
            { id: "truefalse", label: "Benar/Salah" },
            { id: "shortanswer", label: "Isian" },
            { id: "numerical", label: "Numerik" },
            { id: "match", label: "Menjodohkan" },
            { id: "gapselect", label: "Rumpang" },
            { id: "essay", label: "Esai" },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={typeFilter === tab.id ? "filled" : "outline"}
              color={typeFilter === tab.id ? "primary" : "secondary"}
              onClick={() => setTypeFilter(tab.id)}
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
        ) : filtered.length === 0 ? (
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
                onClick={() => setImportModalOpen(true)}
              >
                Import Soal Excel
              </Button>
            </div>
          </div>
        ) : (
          filtered.map((q) => {
            const badge = QUESTION_TYPE_LABELS[q.type] || {
              name: q.type,
              color: "bg-slate-100 text-slate-700",
            };
            return (
              <Card
                key={q.id}
                className="flex items-start justify-between gap-4 p-5 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <Badge color="neutral" size="sm" className="w-8 h-8 rounded-xl font-black text-xs shrink-0 flex items-center justify-center">
                    #{q.slot}
                  </Badge>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${badge.color}`}
                      >
                        {badge.name}
                      </span>
                      <Badge color="teal" size="sm">
                        {q.points} Poin
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {q.stem}
                    </p>
                    {q.optionsSummary && (
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        {q.optionsSummary}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/questions/new?edit=${q.id}`)
                  }
                >
                  Edit
                </Button>
              </Card>
            );
          })
        )}
      </div>

      <ImportQuestionsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchQuestions();
        }}
        examId={examId}
      />
    </div>
  );
};

export default ExamQuestionsSection;
