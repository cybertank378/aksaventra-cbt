import { describe, expect, it, vi } from "vitest";
import { GetExamSnapshotUseCase } from "@/modules/exams/application/usecases/GetExamSnapshotUseCase";
import { ExamEntity } from "@/modules/exams/domain/entities/ExamEntity";
import { QuestionItemEntity } from "@/modules/exams/domain/entities/QuestionItemEntity";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";

describe("GetExamSnapshotUseCase", () => {
  const sampleQuestion = new QuestionItemEntity({
    slot: 1,
    questionId: 101,
    type: "multichoice",
    stemHtml: "<p>Berapakah hasil dari 2 + 2?</p>",
    options: [
      { key: "A", html: "3" },
      { key: "B", html: "4" },
      { key: "C", html: "5" },
    ],
  });

  const mockExam = new ExamEntity({
    id: "exam-snapshot-test-1",
    moodleCbtId: 50,
    title: "Ujian Matematika Dasar",
    courseName: "Matematika",
    durationSeconds: 3600,
    maxStrikes: 3,
    activeToken: "MTK123",
    tokenExpiresAt: new Date(Date.now() + 3600_000),
    questions: [sampleQuestion],
    timeOpen: new Date(Date.now() - 1000),
    timeClose: new Date(Date.now() + 7200_000),
  });

  const createMockRepo = (
    overrides?: Partial<ExamRepositoryInterface>,
  ): ExamRepositoryInterface => ({
    findById: vi.fn().mockResolvedValue(mockExam),
    findByMoodleCbtId: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    getAnswerKeys: vi.fn().mockResolvedValue({ "101": "B" }),
    updateRoomToken: vi.fn(),
    updateExamMetadata: vi.fn(),
    ...overrides,
  });

  it("guarantees answer keys are NEVER exposed to client snapshot DTO", async () => {
    const repo = createMockRepo();
    const useCase = new GetExamSnapshotUseCase(repo);

    const result = await useCase.execute({ examId: "exam-snapshot-test-1" });

    expect(result.isSuccess).toBe(true);
    const snapshot = result.value;

    // Strict verification of answer keys leak
    expect(
      (snapshot as unknown as Record<string, unknown>).answerKeys,
    ).toBeUndefined();
    expect(
      (snapshot as unknown as Record<string, unknown>).answerKeysJson,
    ).toBeUndefined();

    const q = snapshot.questions[0];
    expect(
      (q as unknown as Record<string, unknown>).correctKey,
    ).toBeUndefined();
    expect((q as unknown as Record<string, unknown>).answerKey).toBeUndefined();
    expect((q as unknown as Record<string, unknown>).answer).toBeUndefined();

    expect(snapshot.questions).toHaveLength(1);
    expect(snapshot.questions[0].slot).toBe(1);
    expect(snapshot.questions[0].questionId).toBe(101);
  });

  it("returns EXAM_NOT_FOUND when exam ID does not exist", async () => {
    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(null),
    });
    const useCase = new GetExamSnapshotUseCase(repo);

    const result = await useCase.execute({ examId: "non-existing" });
    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("EXAM_NOT_FOUND");
  });

  it("rejects access when exam window is not yet open", async () => {
    const futureExam = new ExamEntity({
      id: "exam-future",
      moodleCbtId: 51,
      title: "Ujian Masa Depan",
      courseName: "Fisika",
      activeToken: "FSK123",
      tokenExpiresAt: new Date(Date.now() + 86400_000),
      questions: [],
      timeOpen: new Date(Date.now() + 3600_000), // Opens in 1 hour
      timeClose: new Date(Date.now() + 7200_000),
    });

    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(futureExam),
    });
    const useCase = new GetExamSnapshotUseCase(repo);

    const result = await useCase.execute({
      examId: "exam-future",
      checkWindow: true,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("EXAM_NOT_OPEN");
  });

  it("rejects access when exam window has already closed", async () => {
    const pastExam = new ExamEntity({
      id: "exam-past",
      moodleCbtId: 52,
      title: "Ujian Masa Lalu",
      courseName: "Biologi",
      activeToken: "BIO123",
      tokenExpiresAt: new Date(Date.now() - 3600_000),
      questions: [],
      timeOpen: new Date(Date.now() - 7200_000),
      timeClose: new Date(Date.now() - 1800_000), // Closed 30 min ago
    });

    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(pastExam),
    });
    const useCase = new GetExamSnapshotUseCase(repo);

    const result = await useCase.execute({
      examId: "exam-past",
      checkWindow: true,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("EXAM_CLOSED");
  });
});
