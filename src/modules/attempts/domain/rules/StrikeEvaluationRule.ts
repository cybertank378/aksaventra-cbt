import type { ViolationEventType } from "@prisma/client";

export const SOFT_BLUR_GRACE_PERIOD_MS = 2500;

export interface StrikeEvaluationInput {
  eventType: ViolationEventType;
  currentStrikeCount: number;
  maxStrikes: number;
  durationMs?: number;
}

export interface StrikeEvaluationResult {
  strikeIncrement: number;
  nextStrikeCount: number;
  isLocked: boolean;
  shouldRecordLog: boolean;
  isGracePeriod: boolean;
  reason: string;
}

export class StrikeEvaluationRule {
  public static evaluate(input: StrikeEvaluationInput): StrikeEvaluationResult {
    const { eventType, currentStrikeCount, maxStrikes, durationMs } = input;

    // 1. DevTools Trap: Immediate lockdown, zero tolerance
    if (eventType === "DEVTOOLS_OPEN") {
      return {
        strikeIncrement: Math.max(1, maxStrikes - currentStrikeCount),
        nextStrikeCount: Math.max(maxStrikes, currentStrikeCount + 1),
        isLocked: true,
        shouldRecordLog: true,
        isGracePeriod: false,
        reason: "DevTools detection triggered immediate exam lockdown",
      };
    }

    // 2. Soft Blur Grace Period check
    if (
      eventType === "TAB_BLUR" &&
      typeof durationMs === "number" &&
      durationMs > 0 &&
      durationMs < SOFT_BLUR_GRACE_PERIOD_MS
    ) {
      return {
        strikeIncrement: 0,
        nextStrikeCount: currentStrikeCount,
        isLocked: false,
        shouldRecordLog: false,
        isGracePeriod: true,
        reason: `Window blur duration (${durationMs}ms) within grace period (${SOFT_BLUR_GRACE_PERIOD_MS}ms)`,
      };
    }

    // 3. Proctor intervention events
    if (eventType === "PROCTOR_UNLOCK") {
      return {
        strikeIncrement: -currentStrikeCount,
        nextStrikeCount: 0,
        isLocked: false,
        shouldRecordLog: true,
        isGracePeriod: false,
        reason: "Proctor unlocked student attempt",
      };
    }

    if (eventType === "FORCE_SUBMIT") {
      return {
        strikeIncrement: 0,
        nextStrikeCount: currentStrikeCount,
        isLocked: false,
        shouldRecordLog: true,
        isGracePeriod: false,
        reason: "Proctor forcefully submitted student attempt",
      };
    }

    // 4. Hard Strikes (FULLSCREEN_EXIT, TAB_BLUR exceeding grace period, etc.)
    const strikeIncrement = 1;
    const nextStrikeCount = currentStrikeCount + strikeIncrement;
    const isLocked = nextStrikeCount >= maxStrikes;

    return {
      strikeIncrement,
      nextStrikeCount,
      isLocked,
      shouldRecordLog: true,
      isGracePeriod: false,
      reason: isLocked
        ? `Maximum strikes exceeded (${nextStrikeCount}/${maxStrikes}) - attempt locked`
        : `Security violation recorded (${nextStrikeCount}/${maxStrikes})`,
    };
  }
}
