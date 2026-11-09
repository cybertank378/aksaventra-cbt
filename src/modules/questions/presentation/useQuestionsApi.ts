"use client";

import { useCallback, useState } from "react";
import type {
  CreateQuestionInputDTO,
  QuestionDTO,
  QuestionsFilterQueryDTO,
} from "../domain/dto/QuestionDTO";

export function useQuestionsApi() {
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDTO | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          return json.data;
        }
        setError(json.error?.message || "Gagal membuat butir soal");
        return null;
      } catch {
        setError("Gangguan jaringan saat membuat butir soal");
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

  return {
    questions,
    selectedQuestion,
    isLoading,
    error,
    fetchQuestions,
    fetchQuestionById,
    createQuestion,
    deleteQuestion,
  };
}
