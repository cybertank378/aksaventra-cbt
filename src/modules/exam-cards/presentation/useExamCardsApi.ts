"use client";

import { useCallback, useState } from "react";
import type {
  ExamCardItemDTO,
  ExamCardsQueryDTO,
} from "../domain/dto/ExamCardDTO";

export function useExamCardsApi() {
  const [cards, setCards] = useState<ExamCardItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async (query?: ExamCardsQueryDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query?.classGroupId && query.classGroupId !== "ALL") {
        params.set("classGroupId", query.classGroupId);
      }
      if (query?.examId && query.examId !== "ALL") {
        params.set("examId", query.examId);
      }

      const res = await fetch(`/api/exam-cards?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCards(json.data);
      } else {
        setError(json.error?.message || "Gagal memuat data kartu ujian");
      }
    } catch {
      setError("Gangguan jaringan saat memuat kartu ujian");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cards,
    isLoading,
    error,
    fetchCards,
  };
}
