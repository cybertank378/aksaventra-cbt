import { useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type { ExamSnapshotDTO } from "../domain/dto/ExamSnapshotDTO";

export function useExamApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExamSnapshot = async (
    examId: string,
  ): Promise<ExamSnapshotDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<ExamSnapshotDTO>(
        `/api/exams/${encodeURIComponent(examId)}/snapshot`,
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat naskah soal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExamDetail = async (examId: string): Promise<ExamSnapshotDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<ExamSnapshotDTO>(
        `/api/exams/${encodeURIComponent(examId)}`,
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data ujian";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchExamSnapshot,
    fetchExamDetail,
    isLoading,
    error,
  };
}
