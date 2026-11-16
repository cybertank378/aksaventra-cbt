import { useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type {
  OutboundSyncResult,
  SyncEntityType,
  SyncResult,
  SyncWorkerStatus,
} from "../domain/dto/SyncDTO";

export function useSyncApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = async (): Promise<SyncWorkerStatus> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<SyncWorkerStatus>("/api/sync");
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengambil status sync";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPull = async (
    entity: SyncEntityType = "all",
  ): Promise<SyncResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<SyncResult>("/api/sync", {
        method: "POST",
        body: { mode: "pull", entity },
      });
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sinkronisasi Moodle gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const pushEntity = async (
    entity: "class" | "student" | "subject" | "exam" | "question",
    id: string,
  ): Promise<OutboundSyncResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<OutboundSyncResult>("/api/sync", {
        method: "POST",
        body: { mode: "push", entity, id },
      });
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Push entitas ke Moodle gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const syncAll = async (): Promise<SyncResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<SyncResult>("/api/sync", {
        method: "POST",
        body: { mode: "full" },
        timeoutMs: 30_000,
      });
      return unwrapApiResponse(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sinkronisasi penuh gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getStatus,
    syncAll,
    triggerPull,
    pushEntity,
    isLoading,
    error,
  };
}
