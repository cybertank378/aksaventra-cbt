import { describe, expect, it } from "vitest";
import {
  createExamSchema,
  moodleExamManifestSchema,
} from "@/modules/exams/infrastructure/exam.validator";

describe("exam.validator (Moodle Payload Type Coercion & Defense)", () => {
  it("successfully coerces string numbers from Moodle mod_cbt_get_exam_manifest response", () => {
    const rawMoodlePayload = {
      examId: "12", // string number from PHP
      title: "Ujian Akhir Semester Fisika Terapan",
      durationSeconds: "7200",
      maxStrikes: "3",
      serverTimestamp: "1700000000",
      attempt: {
        attemptId: "55",
        timeStart: "1700000000",
        extraTimeSeconds: "0",
        remainingSeconds: "7200",
        strikeCount: "0",
        status: "in_progress",
        syncVersion: "1",
      },
      questions: [
        {
          slot: "1",
          questionId: "101",
          type: "multichoice",
          stemHtml: "<p>Sebuah mobil bergerak dengan kecepatan 20 m/s...</p>",
          options: [
            { key: "A", html: "100 J" },
            { key: "B", html: "200 J" },
          ],
        },
        {
          slot: "2",
          questionId: "102",
          type: "shortanswer",
          stemHtml: "<p>Sebutkan satuan dari gaya dalam SI!</p>",
        },
      ],
    };

    const parsed = moodleExamManifestSchema.safeParse(rawMoodlePayload);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.examId).toBe(12);
      expect(typeof parsed.data.examId).toBe("number");
      expect(parsed.data.durationSeconds).toBe(7200);
      expect(parsed.data.attempt.attemptId).toBe(55);
      expect(parsed.data.questions[0].slot).toBe(1);
      expect(parsed.data.questions[0].questionId).toBe(101);
      expect(parsed.data.questions[1].options).toEqual([]);
    }
  });

  it("rejects manifest when essential fields are invalid or missing", () => {
    const invalidPayload = {
      examId: "not-a-number",
      title: "",
      questions: [],
    };

    const parsed = moodleExamManifestSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it("validates createExamSchema with required dates and questions", () => {
    const validCreatePayload = {
      moodleCbtId: 10,
      title: "Ujian Kimia",
      courseName: "Kimia Dasar",
      activeToken: "CHM123",
      tokenExpiresAt: "2026-11-06T12:00:00Z",
      timeOpen: "2026-11-06T08:00:00Z",
      timeClose: "2026-11-06T14:00:00Z",
      questions: [
        {
          slot: 1,
          questionId: 201,
          type: "multichoice",
          stemHtml: "<p>Berapa pH air murni?</p>",
          options: [{ key: "A", html: "7" }],
        },
      ],
    };

    const parsed = createExamSchema.safeParse(validCreatePayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tokenExpiresAt instanceof Date).toBe(true);
      expect(parsed.data.durationSeconds).toBe(7200); // default
      expect(parsed.data.maxStrikes).toBe(3); // default
    }
  });
});
