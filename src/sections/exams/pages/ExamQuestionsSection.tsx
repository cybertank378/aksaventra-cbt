"use client";

import { ArrowLeft, Download, Plus, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import { ImportQuestionsModal } from "@/sections/questions/molecules/ImportQuestionsModal";
import Button from "@/shared-ui/component/Button";
import type { ExamQuestionItemView } from "../molecules/ExamQuestionCard";
import ExamQuestionsList from "../organisms/ExamQuestionsList";

export interface ExamQuestionsSectionProps {
  examId: string;
  userRole?: UserRole;
}

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
  const [questions, setQuestions] = useState<ExamQuestionItemView[]>([]);
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
          const mapped: ExamQuestionItemView[] = data.questions.map(
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
          onClick={() => router.replace("/dashboard/exams")}
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
                "sample_import_soal.xlsx",
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
                "sample_import_soal.xls",
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

      <ExamQuestionsList
        examTitle={examTitle}
        questions={questions}
        filteredQuestions={filtered}
        totalPoints={totalPoints}
        typeFilter={typeFilter}
        isLoading={isLoading}
        onTypeFilterChange={setTypeFilter}
        onOpenImport={() => setImportModalOpen(true)}
        onEditQuestion={(qId) =>
          router.push(`/dashboard/questions/new?edit=${qId}`)
        }
      />

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
