import { describe, expect, it } from "vitest";
import {
  formatDateTime,
  formatRemainingTime,
  fromUnixSeconds,
  toUnixSeconds,
} from "@/libs/DateUtils";

describe("DateUtils", () => {
  describe("formatRemainingTime", () => {
    it("formats times >= 1 hour as HH:MM:SS", () => {
      expect(formatRemainingTime(3600)).toBe("01:00:00");
      expect(formatRemainingTime(3665)).toBe("01:01:05");
      expect(formatRemainingTime(7325)).toBe("02:02:05");
    });

    it("formats times < 1 hour as MM:SS", () => {
      expect(formatRemainingTime(3599)).toBe("59:59");
      expect(formatRemainingTime(60)).toBe("01:00");
      expect(formatRemainingTime(9)).toBe("00:09");
    });

    it("returns 00:00 for zero, negative, or invalid values", () => {
      expect(formatRemainingTime(0)).toBe("00:00");
      expect(formatRemainingTime(-10)).toBe("00:00");
      expect(formatRemainingTime(Number.NaN)).toBe("00:00");
    });
  });

  describe("toUnixSeconds & fromUnixSeconds", () => {
    it("converts Date to Unix timestamp in seconds", () => {
      const date = new Date("2026-11-05T12:00:00Z");
      const seconds = toUnixSeconds(date);
      expect(seconds).toBe(Math.floor(date.getTime() / 1000));
    });

    it("normalizes millisecond timestamps to seconds", () => {
      const ms = 1_700_000_000_000;
      expect(toUnixSeconds(ms)).toBe(1_700_000_000);
    });

    it("preserves timestamps that are already in seconds", () => {
      expect(toUnixSeconds(1_700_000_000)).toBe(1_700_000_000);
    });

    it("converts Unix timestamp in seconds to Date", () => {
      const sec = 1_700_000_000;
      const date = fromUnixSeconds(sec);
      expect(date.getTime()).toBe(sec * 1000);
    });
  });

  describe("formatDateTime", () => {
    it("formats timestamp to date string", () => {
      const formatted = formatDateTime(1_700_000_000);
      expect(formatted).not.toBe("-");
      expect(typeof formatted).toBe("string");
    });

    it('returns "-" for invalid date string', () => {
      expect(formatDateTime("invalid-date")).toBe("-");
    });
  });
});
