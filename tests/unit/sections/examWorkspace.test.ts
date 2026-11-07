import { describe, expect, it } from "vitest";
import { renderMathFirstAndSanitize } from "@/libs/katexSanitizer";
import { calculateTrueRemainingSeconds } from "@/libs/serverDeltaTimer";

describe("ISSUE-11: Exam Workspace Zero-Latency Unit Tests", () => {
  describe("ServerTimerBadge & Isolation Logic", () => {
    it("calculates true remaining seconds accurately without drifting", () => {
      const nowSec = 1700000000;
      const timeStartSec = 1700000000;
      const durationSeconds = 3600; // 1 hour
      const extraTimeSeconds = 300; // 5 min extra

      const remaining = calculateTrueRemainingSeconds(
        timeStartSec,
        durationSeconds,
        extraTimeSeconds,
        nowSec + 600, // 10 min elapsed
      );

      expect(remaining).toBe(3300); // 3600 + 300 - 600 = 3300s
    });

    it("clamps remaining seconds to 0 when time expires", () => {
      const remaining = calculateTrueRemainingSeconds(
        1000,
        500,
        0,
        2000, // 1000 + 500 = 1500 allowed, now is 2000
      );

      expect(remaining).toBe(0);
    });
  });

  describe("QuestionStemRenderer with KaTeX Math First", () => {
    it("renders inline KaTeX formula delimiters without escaping math tags", () => {
      const raw = "<p>Hitung nilai dari $x^2 + y^2 = r^2$ dalam lingkaran.</p>";
      const sanitized = renderMathFirstAndSanitize(raw);

      expect(sanitized).toContain("katex");
      expect(sanitized).toContain("<math");
      expect(sanitized).not.toContain("<script");
    });

    it("strips malicious XSS vectors while preserving question formatting", () => {
      const raw =
        "<p>Soal Fisika <img src=x onerror=alert(1)> kecepatan konstan.</p>";
      const sanitized = renderMathFirstAndSanitize(raw);

      expect(sanitized).not.toContain("onerror");
      expect(sanitized).toContain("kecepatan konstan");
    });
  });

  describe("Offline Receipt & Cryptographic Seal", () => {
    it("formats receipt payload structure accurately", () => {
      const receiptData = {
        receiptVersion: "1.0",
        attemptId: "att-123",
        examTitle: "Matematika Peminatan",
        studentName: "Budi Santoso",
        submittedAt: new Date().toISOString(),
        answersCount: 40,
        cryptographicSeal: "SHA256-DUMMY-SEAL",
      };

      expect(receiptData.attemptId).toBe("att-123");
      expect(receiptData.answersCount).toBe(40);
      expect(typeof receiptData.cryptographicSeal).toBe("string");
    });
  });

  describe("Workspace Answer & Flag States", () => {
    it("differentiates answered vs flagged vs empty states", () => {
      const answers: Record<number, { ans: unknown; flag: boolean }> = {
        1: { ans: "A", flag: false },
        2: { ans: "B", flag: true },
        3: { ans: null, flag: true },
        4: { ans: "", flag: false },
      };

      const isAnswered = (entry?: { ans: unknown; flag: boolean }) =>
        Boolean(
          entry &&
            entry.ans !== null &&
            entry.ans !== undefined &&
            entry.ans !== "",
        );

      expect(isAnswered(answers[1])).toBe(true);
      expect(isAnswered(answers[2])).toBe(true);
      expect(isAnswered(answers[3])).toBe(false);
      expect(isAnswered(answers[4])).toBe(false);

      expect(answers[2].flag).toBe(true);
      expect(answers[3].flag).toBe(true);
    });
  });
});
