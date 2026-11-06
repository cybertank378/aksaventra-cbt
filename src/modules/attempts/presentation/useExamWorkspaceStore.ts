import { create } from "zustand";
import type { AnswerValue } from "../domain/dto/SyncBatchDTO";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

export interface WorkspaceAnswerState {
  ans: AnswerValue;
  flag: boolean;
  ts: number;
}

export interface ExamWorkspaceState {
  attemptId: string | null;
  examId: string | null;
  activeQuestionIndex: number;
  questionOrder: number[];
  answers: Record<number, WorkspaceAnswerState>;
  syncStatus: SyncStatus;
  isLocked: boolean;
  isSubmitted: boolean;
  strikeCount: number;
  maxStrikes: number;

  // Actions
  initializeWorkspace: (params: {
    attemptId: string;
    examId: string;
    questionOrder: number[];
    initialAnswers?: Record<number, WorkspaceAnswerState>;
    strikeCount?: number;
    maxStrikes?: number;
    isLocked?: boolean;
    isSubmitted?: boolean;
  }) => void;
  setActiveIndex: (index: number) => void;
  setAnswer: (questionId: number, answer: AnswerValue) => void;
  toggleFlag: (questionId: number) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLock: (locked: boolean) => void;
  setStrikeCount: (count: number) => void;
  reset: () => void;
}

const initialState = {
  attemptId: null,
  examId: null,
  activeQuestionIndex: 0,
  questionOrder: [],
  answers: {},
  syncStatus: "idle" as SyncStatus,
  isLocked: false,
  isSubmitted: false,
  strikeCount: 0,
  maxStrikes: 3,
};

export const useExamWorkspaceStore = create<ExamWorkspaceState>((set) => ({
  ...initialState,

  initializeWorkspace: ({
    attemptId,
    examId,
    questionOrder,
    initialAnswers = {},
    strikeCount = 0,
    maxStrikes = 3,
    isLocked = false,
    isSubmitted = false,
  }) =>
    set({
      attemptId,
      examId,
      questionOrder,
      answers: initialAnswers,
      strikeCount,
      maxStrikes,
      isLocked,
      isSubmitted,
      activeQuestionIndex: 0,
    }),

  setActiveIndex: (index: number) =>
    set((state) => {
      if (index < 0 || index >= state.questionOrder.length) return state;
      return { activeQuestionIndex: index };
    }),

  setAnswer: (questionId: number, answer: AnswerValue) =>
    set((state) => {
      const existing = state.answers[questionId];
      return {
        answers: {
          ...state.answers,
          [questionId]: {
            ans: answer,
            flag: existing ? existing.flag : false,
            ts: Date.now(),
          },
        },
      };
    }),

  toggleFlag: (questionId: number) =>
    set((state) => {
      const existing = state.answers[questionId];
      return {
        answers: {
          ...state.answers,
          [questionId]: {
            ans: existing ? existing.ans : null,
            flag: existing ? !existing.flag : true,
            ts: Date.now(),
          },
        },
      };
    }),

  setSyncStatus: (syncStatus: SyncStatus) => set({ syncStatus }),

  setLock: (isLocked: boolean) => set({ isLocked }),

  setStrikeCount: (strikeCount: number) => set({ strikeCount }),

  reset: () => set(initialState),
}));

