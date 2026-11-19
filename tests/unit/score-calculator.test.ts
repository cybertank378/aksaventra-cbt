import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { SubmitAttemptUseCase } from "@/modules/attempts/application/usecases/SubmitAttemptUseCase";
import type { AnswerValue } from "@/modules/attempts/domain/dto/SyncBatchDTO";
import { AnswerRecordEntity } from "@/modules/attempts/domain/entities/AnswerRecordEntity";
import { AttemptSessionEntity } from "@/modules/attempts/domain/entities/AttemptSessionEntity";
import type { AttemptRepositoryInterface } from "@/modules/attempts/domain/interfaces/AttemptRepositoryInterface";
import { ScoreCalculatorRule } from "@/modules/attempts/domain/rules/ScoreCalculatorRule";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";
import {
  normalizeQuestionType,
  SyncRepository,
} from "@/modules/sync/infrastructure/SyncRepository";

describe("ScoreCalculatorRule (Moodle 5 Grading Parity - ISSUE-13)", () => {
  it("evaluates multichoice and truefalse accurately (case-insensitive & localized boolean)", () => {
    expect(
      ScoreCalculatorRule.calculateFraction("multichoice", "A", " a "),
    ).toBe(1);
    expect(ScoreCalculatorRule.calculateFraction("multichoice", "A", "B")).toBe(
      0,
    );
    expect(
      ScoreCalculatorRule.calculateFraction("truefalse", true, "benar"),
    ).toBe(1);
    expect(
      ScoreCalculatorRule.calculateFraction("truefalse", "false", "SALAH"),
    ).toBe(1);
    expect(
      ScoreCalculatorRule.calculateFraction("truefalse", "true", "0"),
    ).toBe(0);
  });

  it("evaluates mcma with partial credit, wrong-choice penalty, and [0, 1] clamping", () => {
    // 2 expected ['A', 'C']
    expect(
      ScoreCalculatorRule.calculateFraction("mcma", ["A", "C"], ["C", "A"]),
    ).toBe(1);
    // 1 correct, 0 wrong => 0.5
    expect(
      ScoreCalculatorRule.calculateFraction("mcma", ["A", "C"], ["A"]),
    ).toBe(0.5);
    // 1 correct, 1 wrong => (1/2) - (1/2) = 0
    expect(
      ScoreCalculatorRule.calculateFraction("mcma", ["A", "C"], ["A", "B"]),
    ).toBe(0);
    // 0 correct, 2 wrong => clamped to 0
    expect(
      ScoreCalculatorRule.calculateFraction("mcma", ["A", "C"], ["B", "D"]),
    ).toBe(0);
    // Comma-separated string input parity
    expect(
      ScoreCalculatorRule.calculateFraction("mcma", "A,C,D", "a,c"),
    ).toBeCloseTo(2 / 3, 5);
  });

  it("evaluates shortanswer with array of accepted alternatives (case-insensitive trim)", () => {
    expect(
      ScoreCalculatorRule.calculateFraction(
        "shortanswer",
        ["Soekarno", "Ir. Soekarno"],
        "  ir. soekarno ",
      ),
    ).toBe(1);
    expect(
      ScoreCalculatorRule.calculateFraction(
        "shortanswer",
        ["Soekarno", "Ir. Soekarno"],
        "Hatta",
      ),
    ).toBe(0);
  });

  it("evaluates numerical with tolerance and comma decimal normalization", () => {
    expect(
      ScoreCalculatorRule.calculateFraction("numerical", 9.8, "9,82", {
        tolerance: 0.05,
      }),
    ).toBe(1);
    expect(
      ScoreCalculatorRule.calculateFraction("numerical", 9.8, "9,9", {
        tolerance: 0.05,
      }),
    ).toBe(0);
    expect(
      ScoreCalculatorRule.calculateFraction(
        "numerical",
        { answer: 12.345, tolerance: 0.01 },
        "12.34",
      ),
    ).toBe(1);
  });

  it("evaluates matching and cloze proportionally by matched sub-items", () => {
    expect(
      ScoreCalculatorRule.calculateFraction(
        "matching",
        { p1: "Jakarta", p2: "Tokyo", p3: "Paris", p4: "London" },
        { p1: "Jakarta", p2: "Seoul", p3: "Paris", p4: "Berlin" },
      ),
    ).toBe(0.5);

    expect(
      ScoreCalculatorRule.calculateFraction(
        "cloze",
        { 1: "oksigen", 2: "karbon dioksida", 3: "klorofil" },
        { 1: "Oksigen", 2: "nitrogen", 3: "KLOROFIL" },
      ),
    ).toBeCloseTo(2 / 3, 5);
  });

  it("scores essay as 0.0 and flags requiresManualGrading on weighted exam score", () => {
    const result = ScoreCalculatorRule.calculateExamScore(
      {
        "1": { type: "multichoice", weight: 2, key: "A" }, // 1.0 * 2 = 2.0
        "2": { type: "mcma", weight: 4, key: ["A", "C"] }, // 0.5 * 4 = 2.0
        "3": { type: "numerical", weight: 2, tolerance: 0.1, key: 10 }, // 1.0 * 2 = 2.0
        "4": {
          type: "matching",
          weight: 2,
          key: { a: "1", b: "2" },
        }, // 0.5 * 2 = 1.0
        "5": { type: "essay", weight: 5, key: "" }, // 0.0 * 5 = 0.0 (manual)
      },
      new Map<number, AnswerValue>([
        [1, "A"],
        [2, ["A"]],
        [3, "10,05"],
        [4, { a: "1", b: "3" }],
        [5, "Penjelasan esai siswa"],
      ]),
      100,
    );

    // raw = 7.0, max = 15.0 => (7 / 15) * 100 = 46.67
    expect(result.rawScore).toBe(7);
    expect(result.maxRawScore).toBe(15);
    expect(result.finalScore).toBe(46.67);
    expect(result.requiresManualGrading).toBe(true);
    expect(result.details["5"]?.requiresManualGrading).toBe(true);
  });

  it("SubmitAttemptUseCase uses question weights, types, and tolerance from Exam metadata", async () => {
    const attempt = new AttemptSessionEntity({
      id: "att-weighted",
      examId: "ex-weighted",
      userId: "u-1",
      status: "IN_PROGRESS",
      startedAt: new Date(),
      extraTimeSeconds: 0,
      strikeCount: 0,
      maxStrikes: 3,
      deviceHash: "dev",
      ipAddress: "127.0.0.1",
      questionOrder: [1, 2, 3],
      answers: new Map([
        [
          1,
          new AnswerRecordEntity({
            questionId: 1,
            answer: ["A"],
            flagged: false,
            updatedAt: 1000,
          }),
        ],
        [
          2,
          new AnswerRecordEntity({
            questionId: 2,
            answer: "3,14",
            flagged: false,
            updatedAt: 1000,
          }),
        ],
        [
          3,
          new AnswerRecordEntity({
            questionId: 3,
            answer: "Jawaban uraian",
            flagged: false,
            updatedAt: 1000,
          }),
        ],
      ]),
      syncVersion: 1,
      syncedToMoodle: false,
      lastHeartbeatAt: new Date(),
    });

    const attemptRepo = {
      findById: vi.fn().mockResolvedValue(attempt),
      submitAttempt: vi.fn().mockResolvedValue(undefined),
    } as unknown as AttemptRepositoryInterface;

    const examRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "ex-weighted",
        questions: [
          { slot: 1, questionId: 1, type: "mcma", points: 4, stemHtml: "" },
          {
            slot: 2,
            questionId: 2,
            type: "numerical",
            points: 2,
            tolerance: 0.01,
            stemHtml: "",
          },
          { slot: 3, questionId: 3, type: "essay", points: 4, stemHtml: "" },
        ],
      }),
      getAnswerKeys: vi.fn().mockResolvedValue({
        "1": ["A", "C"],
        "2": "3.1415",
        "3": "",
      }),
    } as unknown as ExamRepositoryInterface;

    const useCase = new SubmitAttemptUseCase(attemptRepo, examRepo);
    const res = await useCase.execute({ attemptId: "att-weighted" });

    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      // Q1: 0.5 * 4 = 2, Q2: 1.0 * 2 = 2, Q3: 0 * 4 = 0 => 4 / 10 = 40
      expect(res.value.finalScore).toBe(40);
      expect(res.value.requiresManualGrading).toBe(true);
    }
  });

  it("SyncRepository normalizes Moodle 5 match, gapselect/ddwtos, and multi-key multichoice types accurately", async () => {
    expect(normalizeQuestionType("match")).toBe("matching");
    expect(normalizeQuestionType("gapselect")).toBe("cloze");
    expect(normalizeQuestionType("ddwtos")).toBe("cloze");
    expect(
      normalizeQuestionType("multichoice", [
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
      ]),
    ).toBe("mcma");
    expect(
      normalizeQuestionType("multichoice", [
        { isCorrect: true },
        { isCorrect: false },
      ]),
    ).toBe("multichoice");

    const createMock = vi.fn().mockResolvedValue({ id: "q-new" });
    const mockDb = {
      question: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: createMock,
        update: vi.fn(),
      },
    } as unknown as PrismaClient;

    const syncRepo = new SyncRepository(mockDb, vi.fn());
    await syncRepo.upsertQuestions([
      {
        id: 501,
        code: "MDL-MATCH-1",
        type: "match",
        stem: "Cocokkan ibu kota",
        points: 2,
        options: [],
      },
      {
        id: 502,
        code: "MDL-MCMA-1",
        type: "multichoice",
        stem: "Pilih 2 bilangan prima",
        points: 3,
        options: [
          { id: "a", label: "A", text: "2", isCorrect: true },
          { id: "b", label: "B", text: "4", isCorrect: false },
          { id: "c", label: "C", text: "5", isCorrect: true },
        ],
      },
    ]);

    expect(createMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          code: "MDL-MATCH-1",
          type: "matching",
        }),
      }),
    );
    expect(createMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          code: "MDL-MCMA-1",
          type: "mcma",
        }),
      }),
    );
  });
});
