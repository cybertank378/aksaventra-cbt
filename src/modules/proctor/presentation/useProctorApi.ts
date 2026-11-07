"use client";

import { useCallback } from "react";
import type { ProctorActionType } from "../domain/dto/ProctorActionDTO";
import { useProctorPolling } from "./useProctorPolling";
import { useProctorStore } from "./useProctorStore";

/**
 * High-level presentation hook for proctor room operations.
 * Standardized to adhere to the use{Feature}Api convention.
 */
export function useProctorApi(examId: string | null) {
  const store = useProctorStore();
  const polling = useProctorPolling(examId);

  const handleRotateToken = useCallback(
    async (manualToken?: string): Promise<boolean> => {
      return await polling.rotateToken(manualToken);
    },
    [polling],
  );

  const handleExecuteAction = useCallback(
    async (
      attemptId: string,
      action: ProctorActionType,
      options?: { reason?: string; extendMinutes?: number },
    ): Promise<boolean> => {
      return await polling.executeAction(attemptId, action, options);
    },
    [polling],
  );

  const handleRefresh = useCallback(async (): Promise<void> => {
    await polling.fetchParticipants();
  }, [polling]);

  return {
    // State from store
    activeToken: store.activeToken,
    tokenExpiresAt: store.tokenExpiresAt,
    participants: store.participants,
    selectedParticipant: store.selectedParticipant,
    filterStatus: store.filterStatus,
    searchQuery: store.searchQuery,
    isPolling: store.isPolling,
    lastRefreshedAt: store.lastRefreshedAt,

    // Store mutators
    setSelectedParticipant: store.setSelectedParticipant,
    setFilterStatus: store.setFilterStatus,
    setSearchQuery: store.setSearchQuery,
    setIsPolling: store.setIsPolling,

    // API Actions
    rotateToken: handleRotateToken,
    executeAction: handleExecuteAction,
    refresh: handleRefresh,
  };
}

