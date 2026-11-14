import type { AttemptStatus } from "@prisma/client";
import { create } from "zustand";
import type {
  GetRoomParticipantsResponseDTO,
  ParticipantMonitorDTO,
} from "../domain/dto/ProctorActionDTO";

export interface ProctorState {
  examId: string | null;
  roomCode: string | null;
  activeToken: string;
  tokenExpiresAt: string | null;
  participants: ParticipantMonitorDTO[];
  selectedParticipant: ParticipantMonitorDTO | null;
  filterStatus: AttemptStatus | "ALL";
  searchQuery: string;
  isPolling: boolean;
  lastRefreshedAt: number;

  // Actions
  setExamContext: (examId: string, roomCode?: string) => void;
  setRoomData: (data: GetRoomParticipantsResponseDTO) => void;
  setSelectedParticipant: (p: ParticipantMonitorDTO | null) => void;
  setFilterStatus: (status: AttemptStatus | "ALL") => void;
  setSearchQuery: (query: string) => void;
  setToken: (token: string, expiresAt: string) => void;
  setIsPolling: (polling: boolean) => void;
  updateParticipantLocally: (
    attemptId: string,
    updates: Partial<ParticipantMonitorDTO>,
  ) => void;
  reset: () => void;
}

const initialState = {
  examId: null,
  roomCode: null,
  activeToken: "",
  tokenExpiresAt: null,
  participants: [],
  selectedParticipant: null,
  filterStatus: "ALL" as const,
  searchQuery: "",
  isPolling: true,
  lastRefreshedAt: 0,
};

export const useProctorStore = create<ProctorState>((set) => ({
  ...initialState,

  setExamContext: (examId: string, roomCode?: string) =>
    set({ examId, roomCode: roomCode || null }),

  setRoomData: (data: GetRoomParticipantsResponseDTO) =>
    set({
      activeToken: data.activeToken,
      tokenExpiresAt: data.tokenExpiresAt,
      participants: data.participants,
      lastRefreshedAt: Date.now(),
    }),

  setSelectedParticipant: (p: ParticipantMonitorDTO | null) =>
    set({ selectedParticipant: p }),

  setFilterStatus: (filterStatus: AttemptStatus | "ALL") =>
    set({ filterStatus }),

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setToken: (token: string, expiresAt: string) =>
    set({ activeToken: token, tokenExpiresAt: expiresAt }),

  setIsPolling: (isPolling: boolean) => set({ isPolling }),

  updateParticipantLocally: (
    attemptId: string,
    updates: Partial<ParticipantMonitorDTO>,
  ) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.attemptId === attemptId ? { ...p, ...updates } : p,
      ),
      selectedParticipant:
        state.selectedParticipant?.attemptId === attemptId
          ? { ...state.selectedParticipant, ...updates }
          : state.selectedParticipant,
    })),

  reset: () => set(initialState),
}));
