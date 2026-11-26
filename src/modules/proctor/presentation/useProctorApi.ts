"use client";

import { useCallback, useEffect, useRef } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type {
  GetRoomParticipantsResponseDTO,
  ProctorActionType,
  RotateRoomTokenResponseDTO,
} from "../domain/dto/ProctorActionDTO";
import { useProctorStore } from "./useProctorStore";

/**
 * High-level presentation hook for proctor room operations.
 * Centralizes all /api/proctor/* requests via apiRequest and manages background polling.
 */
export function useProctorApi(examId: string | null, intervalMs = 5000) {
  const {
    roomCode,
    activeToken,
    tokenExpiresAt,
    participants,
    selectedParticipant,
    filterStatus,
    searchQuery,
    isPolling,
    lastRefreshedAt,
    setRoomData,
    setToken,
    setSelectedParticipant,
    setFilterStatus,
    setSearchQuery,
    setIsPolling,
    updateParticipantLocally,
  } = useProctorStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDestroyedRef = useRef(false);

  const fetchParticipants = useCallback(async (): Promise<void> => {
    if (!examId) return;

    try {
      const query = roomCode ? `?roomCode=${encodeURIComponent(roomCode)}` : "";
      const response = await apiRequest<GetRoomParticipantsResponseDTO>(
        `/api/proctor/${encodeURIComponent(examId)}/participants${query}`,
        { method: "GET" },
      );
      const data = unwrapApiResponse(response);
      if (data) {
        setRoomData(data);
      }
    } catch {
      // Background polling failure tolerated
    }
  }, [examId, roomCode, setRoomData]);

  const rotateToken = useCallback(
    async (manualToken?: string): Promise<boolean> => {
      if (!examId) return false;
      try {
        const response = await apiRequest<RotateRoomTokenResponseDTO>(
          `/api/proctor/${encodeURIComponent(examId)}/rotate-token`,
          {
            method: "POST",
            body: { manualToken },
          },
        );
        const data = unwrapApiResponse(response);
        if (data) {
          setToken(data.token, data.expiresAt);
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
        const response = await apiRequest<unknown>(
          `/api/proctor/${encodeURIComponent(examId)}/action`,
          {
            method: "POST",
            body: {
              attemptId,
              action,
              reason: options?.reason,
              extendMinutes: options?.extendMinutes,
            },
          },
        );
        unwrapApiResponse(response);

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
      } catch {
        return false;
      }
    },
    [examId, updateParticipantLocally, fetchParticipants],
  );

  useEffect(() => {
    if (!examId || !isPolling) return;
    isDestroyedRef.current = false;

    void fetchParticipants();

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
    activeToken,
    tokenExpiresAt,
    participants,
    selectedParticipant,
    filterStatus,
    searchQuery,
    isPolling,
    lastRefreshedAt,

    setSelectedParticipant,
    setFilterStatus,
    setSearchQuery,
    setIsPolling,

    fetchParticipants,
    rotateToken,
    executeAction,
    refresh: fetchParticipants,
  };
}
