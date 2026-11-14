/**
 * Application route definitions and path generator helpers.
 * Centralized routing constants for UI pages and Internal BFF API endpoints.
 */

export const APP_ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    LOGOUT: "/api/auth/logout",
  },
  STUDENT: {
    LOBBY: (cbtId: string | number) => `/student/lobby/${cbtId}`,
    EXAM: (attemptId: string | number) => `/student/exam/${attemptId}`,
    SUMMARY: (attemptId: string | number) =>
      `/student/exam/${attemptId}/summary`,
  },
  PROCTOR: {
    DASHBOARD: (cbtId: string | number) => `/dashboard/proctor/${cbtId}`,
    STUDENT_DETAIL: (cbtId: string | number, attemptId: string | number) =>
      `/dashboard/proctor/${cbtId}/attempt/${attemptId}`,
  },
  API: {
    AUTH_LOGIN: "/api/auth/login",
    AUTH_ME: "/api/auth/me",
    HEALTH: "/api/health",
    ATTEMPT_MANIFEST: (attemptId: string | number) =>
      `/api/attempts/${attemptId}/manifest`,
    ATTEMPT_SYNC: (attemptId: string | number) =>
      `/api/attempts/${attemptId}/sync`,
    ATTEMPT_VIOLATION: (attemptId: string | number) =>
      `/api/attempts/${attemptId}/violation`,
    ATTEMPT_SUBMIT: (attemptId: string | number) =>
      `/api/attempts/${attemptId}/submit`,
    PROCTOR_CONTROL: (cbtId: string | number) =>
      `/api/proctor/${cbtId}/control`,
    PROCTOR_FEED: (cbtId: string | number) => `/api/proctor/${cbtId}/feed`,
  },
} as const;

export type AppRoutes = typeof APP_ROUTES;
