import { AppError } from "./AppError";

export class OptimisticLockError extends AppError {
  public readonly statusCode = 409;
  public readonly code = "OPTIMISTIC_LOCK_CONFLICT";
  public readonly currentVersion: number;
  public readonly attemptedVersion: number;

  constructor(
    message = "Stale data conflict: version mismatch during optimistic update",
    currentVersion = 0,
    attemptedVersion = 0,
  ) {
    super(message, { currentVersion, attemptedVersion });
    this.currentVersion = currentVersion;
    this.attemptedVersion = attemptedVersion;
  }
}
