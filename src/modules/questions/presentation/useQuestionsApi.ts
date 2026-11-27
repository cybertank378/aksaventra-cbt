"use client";

import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import type {
  CreateQuestionInputDTO,
  QuestionDTO,
  QuestionsFilterQueryDTO,
} from "../domain/dto/QuestionDTO";

export interface ImportQuestionsResultDTO {
  success: boolean;
  message: string;
  processedCount: number;
  errors?: string[];
}

export function useQuestionsApi() {
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDTO | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubjects(json.data);
      }
    } catch {
      // Ignore network error for subjects dropdown
    }
  }, []);

  const fetchQuestions = useCallback(
    async (filters?: QuestionsFilterQueryDTO) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.subject && filters.subject !== "ALL") {
          params.set("subject", filters.subject);
        }
        if (filters?.gradeLevel && filters.gradeLevel !== "ALL") {
          params.set("gradeLevel", filters.gradeLevel);
        }
        if (filters?.type && (filters.type as string) !== "ALL") {
          params.set("type", filters.type);
        }
        if (filters?.search) {
          params.set("search", filters.search);
        }

        const res = await fetch(`/api/questions?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setQuestions(json.data);
        } else {
          setError(json.error?.message || "Gagal memuat bank soal");
        }
      } catch {
        setError("Gangguan jaringan saat memuat data bank soal");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchQuestionById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedQuestion(json.data);
        return json.data as QuestionDTO;
      }
      setError(json.error?.message || "Soal tidak ditemukan");
      return null;
    } catch {
      setError("Gangguan jaringan saat memuat detail soal");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createQuestion = useCallback(
    async (input: CreateQuestionInputDTO): Promise<QuestionDTO | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setQuestions((prev) => [json.data, ...prev]);
          showSuccessToast("Berhasil membuat butir soal");
          return json.data;
        }
        const errMsg = json.error?.message || "Gagal membuat butir soal";
        showErrorToast(errMsg);
        setError(errMsg);
        return null;
      } catch {
        const err = "Gangguan jaringan saat membuat butir soal";
        showErrorToast(err);
        setError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateQuestion = useCallback(
    async (
      id: string,
      input: Partial<CreateQuestionInputDTO>,
    ): Promise<QuestionDTO | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/questions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === id ? json.data : q)),
          );
          showSuccessToast("Berhasil memperbarui butir soal");
          return json.data;
        }
        const errMsg = json.error?.message || "Gagal memperbarui butir soal";
        showErrorToast(errMsg);
        setError(errMsg);
        return null;
      } catch {
        const err = "Gangguan jaringan saat memperbarui butir soal";
        showErrorToast(err);
        setError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteQuestion = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        return true;
      }
      setError(json.error?.message || "Gagal menghapus soal");
      return false;
    } catch {
      setError("Gangguan jaringan saat menghapus butir soal");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importQuestions = useCallback(
    async (
      rawCsvText: string,
      examId: number | string = 1,
    ): Promise<ImportQuestionsResultDTO> => {
      setIsLoading(true);
      setError(null);
      try {
        const numericCbtId = Number(examId) || 1;
        const res = await fetch("/api/moodle-proxy/mod_cbt_import_export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "import_questions",
            cbtid: numericCbtId,
            payload: rawCsvText,
          }),
        });

        const data = await res.json();
        if (data.success) {
          const msg =
            data.message ||
            `Berhasil mengimpor ${data.processed_count || 0} butir soal.`;
          showSuccessToast(msg);
          await fetchQuestions();
          return {
            success: true,
            message: msg,
            processedCount: data.processed_count || 0,
            errors: data.errors || [],
          };
        }

        const errMsg =
          data.message || data.error || "Gagal mengimpor butir soal.";
        showErrorToast(errMsg);
        setError(errMsg);
        return {
          success: false,
          message: errMsg,
          processedCount: 0,
          errors: data.errors || [errMsg],
        };
      } catch {
        const connErr = "Gagal terhubung ke Moodle Headless Bridge.";
        showErrorToast(connErr);
        setError(connErr);
        return {
          success: false,
          message: connErr,
          processedCount: 0,
          errors: [connErr],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchQuestions],
  );

  const bulkGroupQuestions = useCallback(
    async (
      ids: string[],
      group: { gradeLevel?: string; subject?: string },
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/questions/bulk-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, ...group }),
        });
        const json = await res.json();
        if (json.success) {
          showSuccessToast(
            `${json.data ?? ids.length} butir soal berhasil dikelompokkan`,
          );
          await fetchQuestions();
          return true;
        }
        const errMsg = json.error?.message || "Gagal mengelompokkan soal";
        showErrorToast(errMsg);
        setError(errMsg);
        return false;
      } catch {
        const err = "Gangguan jaringan saat mengelompokkan soal";
        showErrorToast(err);
        setError(err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchQuestions],
  );

  return {
    questions,
    subjects,
    selectedQuestion,
    isLoading,
    error,
    fetchQuestions,
    fetchSubjects,
    fetchQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkGroupQuestions,
    importQuestions,
  };
}
