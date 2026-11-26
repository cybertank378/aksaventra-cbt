"use client";

import { useProctorApi } from "./useProctorApi";

/**
 * Delegates proctor polling and actions to useProctorApi so no direct fetch calls live outside the API hook.
 */
export function useProctorPolling(examId: string | null, intervalMs = 5000) {
  const { fetchParticipants, rotateToken, executeAction } = useProctorApi(
    examId,
    intervalMs,
  );

  return {
    fetchParticipants,
    rotateToken,
    executeAction,
  };
}
