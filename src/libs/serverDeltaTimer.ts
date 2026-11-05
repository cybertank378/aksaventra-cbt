export interface ServerDeltaTimerConfig {
  serverTimestamp: number; // Unix timestamp in seconds or ms
  timeStart: number; // Start timestamp in seconds
  durationSeconds: number; // Total exam duration in seconds
  extraTimeSeconds?: number; // Optional proctor extension in seconds
}

export class ServerDeltaTimer {
  private readonly durationSeconds: number;
  private readonly timeStartSec: number;
  private extraTimeSeconds: number;

  // Monotonic calibration anchors
  private monotonicAnchorMs: number;
  private calibratedServerTimeSec: number;

  constructor(config: ServerDeltaTimerConfig) {
    this.durationSeconds = config.durationSeconds;
    this.timeStartSec = config.timeStart;
    this.extraTimeSeconds = config.extraTimeSeconds ?? 0;

    // Normalize serverTimestamp to seconds
    const serverTimestampSec =
      config.serverTimestamp > 1_000_000_000_000
        ? Math.floor(config.serverTimestamp / 1000)
        : config.serverTimestamp;

    this.calibratedServerTimeSec = serverTimestampSec;
    this.monotonicAnchorMs =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  /**
   * Returns current elapsed time since calibration in seconds, derived monotonically.
   */
  private getElapsedMonotonicSeconds(): number {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    return Math.max(0, (now - this.monotonicAnchorMs) / 1000);
  }

  /**
   * Returns current estimated server timestamp in seconds.
   */
  public getCurrentServerTime(): number {
    return Math.floor(
      this.calibratedServerTimeSec + this.getElapsedMonotonicSeconds(),
    );
  }

  /**
   * Returns the remaining time in seconds.
   * Total allowed time = (timeStart + durationSeconds + extraTimeSeconds) - currentServerTime.
   */
  public getRemainingSeconds(): number {
    const totalAllowedEndTime =
      this.timeStartSec + this.durationSeconds + this.extraTimeSeconds;
    const currentServerTime = this.getCurrentServerTime();
    return Math.max(0, totalAllowedEndTime - currentServerTime);
  }

  /**
   * Returns whether the exam time has run out.
   */
  public isExpired(): boolean {
    return this.getRemainingSeconds() <= 0;
  }

  /**
   * Adds extra time (in seconds) granted by the proctor.
   */
  public addExtraTime(seconds: number): void {
    if (seconds > 0) {
      this.extraTimeSeconds += seconds;
    }
  }

  /**
   * Gets current total extra time in seconds.
   */
  public getExtraTimeSeconds(): number {
    return this.extraTimeSeconds;
  }

  /**
   * Recalibrates server time delta when a sync response is received from Moodle.
   */
  public recalibrate(serverTimestamp: number, remainingSeconds?: number): void {
    const serverSec =
      serverTimestamp > 1_000_000_000_000
        ? Math.floor(serverTimestamp / 1000)
        : serverTimestamp;

    this.calibratedServerTimeSec = serverSec;
    this.monotonicAnchorMs =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    if (remainingSeconds !== undefined && remainingSeconds >= 0) {
      // Sync extra time if remaining time was directly adjusted on server
      const expectedEnd =
        this.timeStartSec + this.durationSeconds + this.extraTimeSeconds;
      const actualEnd = serverSec + remainingSeconds;
      if (actualEnd !== expectedEnd) {
        this.extraTimeSeconds = Math.max(
          0,
          actualEnd - (this.timeStartSec + this.durationSeconds),
        );
      }
    }
  }
}
