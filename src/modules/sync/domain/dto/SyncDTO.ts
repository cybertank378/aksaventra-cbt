export type SyncEntityType =
  | "user"
  | "cohort"
  | "cohort_member"
  | "course"
  | "cbt"
  | "question"
  | "all";

export type SyncActionType =
  | "created"
  | "updated"
  | "deleted"
  | "added"
  | "removed"
  | "manual";

export interface MoodleWebhookPayload {
  entity: SyncEntityType;
  action: SyncActionType;
  objectId: number;
  extra?: Record<string, unknown>;
  timestamp?: number;
}

export interface SyncCounts {
  courses: number;
  classes: number;
  students: number;
  exams: number;
  questions: number;
}

export interface SyncResult {
  success: boolean;
  counts: SyncCounts;
  syncedAt: string;
  errors: string[];
}

export interface OutboundSyncResult {
  synced: boolean;
  moodleId?: number;
  error?: string;
}

export interface SyncWorkerStatus {
  started: boolean;
  isSyncing: boolean;
  intervalMs: number;
  lastSyncedAt: string | null;
  lastResult: SyncResult | null;
  lastError: string | null;
}

export interface MoodlePullPayload {
  courses?: Array<{
    id: number;
    name: string;
    short_name?: string;
    description?: string;
  }>;
  classes?: Array<{
    id: number;
    name: string;
    code?: string;
    description?: string;
    student_count?: number;
  }>;
  students?: Array<{
    user_id: number;
    username: string;
    full_name: string;
    email?: string;
    class_id?: number;
    class_name?: string;
  }>;
  exams?: Array<{
    id: number;
    course_id: number;
    course_name: string;
    title: string;
    intro?: string;
    time_open: number;
    time_close: number;
    duration_seconds: number;
    max_strikes: number;
    active_token?: string;
    token_expiry?: number;
  }>;
  questions?: Array<{
    id: number;
    code?: string;
    name?: string;
    subject?: string;
    grade_level?: string;
    type: string;
    stem: string;
    points?: number;
    explanation?: string;
    options?: Array<{
      id: string;
      label: string;
      text: string;
      isCorrect?: boolean;
    }>;
  }>;
}
