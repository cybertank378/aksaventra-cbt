"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ProctorActionType } from "../domain/dto/ProctorActionDTO";
import { useProctorStore } from "./useProctorStore";

export function useProctorPolling(examId: string | null, intervalMs = 5000) {
  const {
    roomCode,
    isPolling,
    setRoomData,
    setToken,
    updateParticipantLocally,
  } = useProctorStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isDestroyedRef = useRef(false);

  const fetchParticipants = useCallback(async () => {
    if (!examId) return;

    try {
      const url = new URL(
        `/api/proctor/${examId}/participants`,
        window.location.origin,
      );
      if (roomCode) {
        url.searchParams.set("roomCode", roomCode);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setRoomData(data.data);
        }
      }
    } catch {
      // Background polling failure tolerated
    }
  }, [examId, roomCode, setRoomData]);

  const rotateToken = useCallback(
    async (manualToken?: string): Promise<boolean> => {
      if (!examId) return false;
      try {
        const res = await fetch(`/api/proctor/${examId}/rotate-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manualToken }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setToken(data.data.token, data.data.expiresAt);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [examId, setToken],
  );

  const executeAction = useCallback(
    async (
      attemptId: string,
      action: ProctorActionType,
      options?: { reason?: string; extendMinutes?: number },
    ): Promise<boolean> => {
      if (!examId) return false;

      try {
        const res = await fetch(`/api/proctor/${examId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            action,
            reason: options?.reason,
            extendMinutes: options?.extendMinutes,
          }),
        });

        const data = await res.json();
        if (data.success) {
          if (action === "unlock") {
            updateParticipantLocally(attemptId, {
              status: "IN_PROGRESS",
              strikeCount: 0,
            });
          } else if (action === "force_submit") {
            updateParticipantLocally(attemptId, {
              status: "SUBMITTED",
            });
          }
          await fetchParticipants();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [examId, updateParticipantLocally, fetchParticipants],
  );

  useEffect(() => {
    if (!examId || !isPolling) return;
    isDestroyedRef.current = false;

    // Initial fetch
    fetchParticipants();

    const schedulePolling = () => {
      if (isDestroyedRef.current) return;
      timerRef.current = setTimeout(async () => {
        if (!document.hidden && isPolling) {
          await fetchParticipants();
        }
        schedulePolling();
      }, intervalMs);
    };

    schedulePolling();

    return () => {
      isDestroyedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [examId, isPolling, intervalMs, fetchParticipants]);

  return {
    fetchParticipants,
    rotateToken,
    executeAction,
  };
}
