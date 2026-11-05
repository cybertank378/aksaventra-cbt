import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServerDeltaTimer } from "@/libs/serverDeltaTimer";

describe("ServerDeltaTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates remaining time accurately based on server timestamp", () => {
    const baseServerTime = 1_700_000_000; // Unix seconds
    const timer = new ServerDeltaTimer({
      serverTimestamp: baseServerTime,
      timeStart: baseServerTime,
      durationSeconds: 3600, // 60 minutes
    });

    expect(timer.getRemainingSeconds()).toBe(3600);
    expect(timer.isExpired()).toBe(false);

    // Advance performance time by 10 minutes (600,000 ms)
    vi.advanceTimersByTime(600_000);

    expect(timer.getRemainingSeconds()).toBe(3000);
    expect(timer.getCurrentServerTime()).toBe(baseServerTime + 600);
  });

  it("is immune to client OS clock manipulation (monotonicity)", () => {
    const baseServerTime = 1_700_000_000;
    const timer = new ServerDeltaTimer({
      serverTimestamp: baseServerTime,
      timeStart: baseServerTime,
      durationSeconds: 3600,
    });

    // Advance 5 minutes monotonically
    vi.advanceTimersByTime(300_000);
    expect(timer.getRemainingSeconds()).toBe(3300);

    // Simulate user winding their system clock backward by 1 hour
    const originalDateNow = Date.now;
    Date.now = () => originalDateNow() - 3600 * 1000;

    // Remaining seconds should NOT increase, because it relies on monotonic time (performance.now)
    expect(timer.getRemainingSeconds()).toBe(3300);

    Date.now = originalDateNow;
  });

  it("extends remaining time when proctor grants extra time", () => {
    const baseServerTime = 1_700_000_000;
    const timer = new ServerDeltaTimer({
      serverTimestamp: baseServerTime,
      timeStart: baseServerTime,
      durationSeconds: 300, // 5 minutes
    });

    expect(timer.getRemainingSeconds()).toBe(300);
    timer.addExtraTime(180); // +3 minutes

    expect(timer.getExtraTimeSeconds()).toBe(180);
    expect(timer.getRemainingSeconds()).toBe(480);
  });

  it("recalibrates server timestamp when sync response arrives", () => {
    const baseServerTime = 1_700_000_000;
    const timer = new ServerDeltaTimer({
      serverTimestamp: baseServerTime,
      timeStart: baseServerTime,
      durationSeconds: 3600,
    });

    // Advance 100 seconds
    vi.advanceTimersByTime(100_000);

    // Server says current time is baseServerTime + 105 and 3495 seconds remaining
    timer.recalibrate(baseServerTime + 105, 3495);

    expect(timer.getCurrentServerTime()).toBe(baseServerTime + 105);
    expect(timer.getRemainingSeconds()).toBe(3495);
  });

  it("handles expiration correctly and clamps remaining seconds to 0", () => {
    const baseServerTime = 1_700_000_000;
    const timer = new ServerDeltaTimer({
      serverTimestamp: baseServerTime,
      timeStart: baseServerTime,
      durationSeconds: 60,
    });

    // Advance past duration
    vi.advanceTimersByTime(70_000);

    expect(timer.getRemainingSeconds()).toBe(0);
    expect(timer.isExpired()).toBe(true);
  });
});
