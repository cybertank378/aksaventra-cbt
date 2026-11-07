export type UserRole = "ADMIN" | "TEACHER" | "PROCTOR" | "STUDENT";
export type AttemptStatus = "IN_PROGRESS" | "LOCKED" | "SUBMITTED" | "ABANDONED";
export type ViolationEventType =
  | "TAB_BLUR"
  | "FULLSCREEN_EXIT"
  | "DEVTOOLS_OPEN"
  | "PROCTOR_UNLOCK"
  | "PROCTOR_RESET_DEVICE"
  | "TIME_EXTEND"
  | "FORCE_SUBMIT";

