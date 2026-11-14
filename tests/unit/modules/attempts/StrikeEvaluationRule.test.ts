import { describe, expect, it } from "vitest";
import { StrikeEvaluationRule } from "@/modules/attempts/domain/rules/StrikeEvaluationRule";

describe("StrikeEvaluationRule", () => {
  it("should record 1 strike on TAB_BLUR when duration exceeds grace period", () => {
    const res = StrikeEvaluationRule.evaluate({
      eventType: "TAB_BLUR",
      currentStrikeCount: 1,
      maxStrikes: 3,
      durationMs: 3000,
    });

    expect(res.strikeIncrement).toBe(1);
    expect(res.nextStrikeCount).toBe(2);
    expect(res.isLocked).toBe(false);
    expect(res.shouldRecordLog).toBe(true);
    expect(res.isGracePeriod).toBe(false);
  });

  it("should forgive TAB_BLUR within grace period (< 2500ms)", () => {
    const res = StrikeEvaluationRule.evaluate({
      eventType: "TAB_BLUR",
      currentStrikeCount: 1,
      maxStrikes: 3,
      durationMs: 1200,
    });

    expect(res.strikeIncrement).toBe(0);
    expect(res.nextStrikeCount).toBe(1);
    expect(res.isLocked).toBe(false);
    expect(res.shouldRecordLog).toBe(false);
    expect(res.isGracePeriod).toBe(true);
  });

  it("should lock attempt immediately on DEVTOOLS_OPEN regardless of current strike count", () => {
    const res = StrikeEvaluationRule.evaluate({
      eventType: "DEVTOOLS_OPEN",
      currentStrikeCount: 0,
      maxStrikes: 3,
    });

    expect(res.isLocked).toBe(true);
    expect(res.nextStrikeCount).toBeGreaterThanOrEqual(3);
    expect(res.shouldRecordLog).toBe(true);
    expect(res.isGracePeriod).toBe(false);
  });

  it("should lock attempt when nextStrikeCount reaches maxStrikes on FULLSCREEN_EXIT", () => {
    const res = StrikeEvaluationRule.evaluate({
      eventType: "FULLSCREEN_EXIT",
      currentStrikeCount: 2,
      maxStrikes: 3,
    });

    expect(res.strikeIncrement).toBe(1);
    expect(res.nextStrikeCount).toBe(3);
    expect(res.isLocked).toBe(true);
    expect(res.shouldRecordLog).toBe(true);
  });

  it("should reset strike count to 0 and unlock on PROCTOR_UNLOCK", () => {
    const res = StrikeEvaluationRule.evaluate({
      eventType: "PROCTOR_UNLOCK",
      currentStrikeCount: 3,
      maxStrikes: 3,
    });

    expect(res.nextStrikeCount).toBe(0);
    expect(res.isLocked).toBe(false);
    expect(res.shouldRecordLog).toBe(true);
  });
});
