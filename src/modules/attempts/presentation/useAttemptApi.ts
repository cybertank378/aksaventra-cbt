import { useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type {
  RecordViolationResponseDTO,
  StartAttemptResponseDTO,
  SubmitAttemptResponseDTO,
  SyncBatchRequestDTO,
  SyncBatchResponseDTO,
} from "../domain/dto/SyncBatchDTO";

export interface StartAttemptInput {
  examId: string;
  roomToken?: string;
}

export interface RecordViolationInput {
  attemptId: string;
  eventType: string;
  durationMs?: number;
  details?: Record<string, unknown>;
}

export interface SubmitAttemptInput {
  attemptId: string;
  finalAnswers?: SyncBatchRequestDTO["answers"];
}

export function useAttemptApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAttempt = async (
    input: StartAttemptInput,
  ): Promise<StartAttemptResponseDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<StartAttemptResponseDTO>(
        "/api/attempts",
        {
          method: "POST",
          body: input,
        },
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memulai sesi ujian";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const syncBatch = async (
    input: SyncBatchRequestDTO,
  ): Promise<SyncBatchResponseDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<SyncBatchResponseDTO>(
        `/api/attempts/${encodeURIComponent(input.attemptId)}/sync`,
        {
          method: "POST",
          body: input,
        },
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyinkronkan jawaban";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const recordViolation = async (
    input: RecordViolationInput,
  ): Promise<RecordViolationResponseDTO> => {
    try {
      const response = await apiRequest<RecordViolationResponseDTO>(
        `/api/attempts/${encodeURIComponent(input.attemptId)}/violation`,
        {
          method: "POST",
          body: input,
        },
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mencatat pelanggaran";
      setError(message);
      throw err;
    }
  };

  const submitAttempt = async (
    input: SubmitAttemptInput,
  ): Promise<SubmitAttemptResponseDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<SubmitAttemptResponseDTO>(
        `/api/attempts/${encodeURIComponent(input.attemptId)}/submit`,
        {
          method: "POST",
          body: input,
        },
      );
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirimkan ujian";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startAttempt,
    syncBatch,
    recordViolation,
    submitAttempt,
    isLoading,
    error,
  };
}

export default useAttemptApi;

