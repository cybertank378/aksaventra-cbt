"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  AsyncSyncMutex,
  getNextSyncDelayWithJitter,
} from "@/shared/api/apiQueue";
import type { AnswerValue } from "../domain/dto/SyncBatchDTO";
import { DexieAttemptVault } from "../infrastructure/DexieAttemptVault";
import { useExamWorkspaceStore } from "./useExamWorkspaceStore";

const syncMutex = new AsyncSyncMutex();
const vault = new DexieAttemptVault();

export function useAttemptSyncHook(attemptId: string | null) {
  const { setSyncStatus, setLock } = useExamWorkspaceStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isDestroyedRef = useRef(false);

  // Synchronize an answer to Dexie Vault and update store
  const recordAnswer = useCallback(
    async (questionId: number, answer: AnswerValue, flagged = false) => {
      if (!attemptId) return;
      await vault.saveAnswer(attemptId, questionId, answer, flagged);
    },
    [attemptId],
  );

  // Perform background sync of all unsynced answers to server via Mutex
  const flushUnsynced = useCallback(async (): Promise<boolean> => {
    if (!attemptId) return false;

    return await syncMutex.runExclusive(async () => {
      try {
        const unsynced = await vault.getUnsyncedAnswers(attemptId);
        if (unsynced.length === 0) {
          setSyncStatus("synced");
          return true;
        }

        setSyncStatus("syncing");

        const payload = {
          attemptId,
          answers: unsynced.map((u) => ({
            questionId: u.questionId,
            ans: u.answer,
            flag: u.flagged,
            ts: u.updatedAt,
          })),
          syncVersion: 0,
        };

        const res = await fetch(`/api/attempts/${attemptId}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          setSyncStatus("error");
          return false;
        }

        const data = await res.json();
        if (data.success) {
          const qids = unsynced.map((u) => u.questionId);
          await vault.markAnswersAsSynced(attemptId, qids);

          if (data.data?.status === "LOCKED") {
            setLock(true);
          }

          setSyncStatus("synced");
          return true;
        }

        setSyncStatus("error");
        return false;
      } catch {
        setSyncStatus("error");
        return false;
      }
    });
  }, [attemptId, setSyncStatus, setLock]);

  // Submit attempt: strictly waits for all in-flight syncs to finish
  const submitWithFlush = useCallback(async (): Promise<{
    success: boolean;
    finalScore?: number;
    error?: string;
  }> => {
    if (!attemptId) return { success: false, error: "No attempt ID" };

    return await syncMutex.runExclusive(async () => {
      try {
        // 1. Flush any remaining unsynced answers
        const unsynced = await vault.getUnsyncedAnswers(attemptId);
        const finalAnswers = unsynced.map((u) => ({
          questionId: u.questionId,
          ans: u.answer,
          flag: u.flagged,
          ts: u.updatedAt,
        }));

        // 2. Send final submit payload
        const res = await fetch(`/api/attempts/${attemptId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finalAnswers }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          return {
            success: false,
            error: data.error?.message || "Failed to submit attempt",
          };
        }

        return {
          success: true,
          finalScore: data.data?.finalScore,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    });
  }, [attemptId]);

  // Set up periodic sync with random jitter (20,000ms - 24,000ms)
  useEffect(() => {
    if (!attemptId) return;
    isDestroyedRef.current = false;

    const scheduleNextSync = () => {
      if (isDestroyedRef.current) return;
      const delay = getNextSyncDelayWithJitter(20_000, 4_000);

      timerRef.current = setTimeout(async () => {
        await flushUnsynced();
        scheduleNextSync();
      }, delay);
    };

    scheduleNextSync();

    return () => {
      isDestroyedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [attemptId, flushUnsynced]);

  return {
    recordAnswer,
    flushUnsynced,
    submitWithFlush,
  };
}
