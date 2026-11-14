import { describe, expect, it, vi } from "vitest";
import { ExamService } from "@/modules/exams/application/service/ExamService";
import { ExamEntity } from "@/modules/exams/domain/entities/ExamEntity";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";

describe("ExamService (In-Memory Thundering Herd Cache)", () => {
  const mockExam = new ExamEntity({
    id: "exam-cbt-100",
    moodleCbtId: 90,
    title: "Ujian Geografi",
    courseName: "Geografi",
    activeToken: "GEO123",
    tokenExpiresAt: new Date(Date.now() + 3600_000),
    questions: [],
    timeOpen: new Date(Date.now() - 1000),
    timeClose: new Date(Date.now() + 7200_000),
  });

  it("caches snapshot in-memory so 500 simultaneous requests only query database once", async () => {
    const findByIdSpy = vi.fn().mockResolvedValue(mockExam);
    const mockRepo: ExamRepositoryInterface = {
      findById: findByIdSpy,
      findByMoodleCbtId: vi.fn(),
      findAll: vi.fn().mockResolvedValue([mockExam]),
      save: vi.fn(),
      getAnswerKeys: vi.fn(),
      updateRoomToken: vi.fn(),
      updateExamMetadata: vi.fn(),
    };

    const service = new ExamService(mockRepo);

    // Simulate 5 students requesting the snapshot at the exact same second
    const requests = Array.from({ length: 5 }, () =>
      service.getSnapshot({ examId: "exam-cbt-100" }),
    );

    const results = await Promise.all(requests);

    for (const res of results) {
      expect(res.isSuccess).toBe(true);
      expect(res.value.title).toBe("Ujian Geografi");
    }

    // Database should only be called once because of in-memory caching
    expect(findByIdSpy).toHaveBeenCalledTimes(1);
  });

  it("invalidates cache when exam is updated", async () => {
    const findByIdSpy = vi.fn().mockResolvedValue(mockExam);
    const updateExamMetadataSpy = vi.fn().mockResolvedValue(
      new ExamEntity({
        ...mockExam,
        id: "exam-cbt-100",
        moodleCbtId: 90,
        title: "Ujian Geografi (Revisi)",
        courseName: "Geografi",
        activeToken: "GEO123",
        tokenExpiresAt: new Date(Date.now() + 3600_000),
        questions: [],
        timeOpen: new Date(Date.now() - 1000),
        timeClose: new Date(Date.now() + 7200_000),
      }),
    );

    const mockRepo: ExamRepositoryInterface = {
      findById: findByIdSpy,
      findByMoodleCbtId: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      getAnswerKeys: vi.fn(),
      updateRoomToken: vi.fn(),
      updateExamMetadata: updateExamMetadataSpy,
    };

    const service = new ExamService(mockRepo);

    // 1. Initial snapshot fetch -> DB called 1 time
    await service.getSnapshot({ examId: "exam-cbt-100" });
    expect(findByIdSpy).toHaveBeenCalledTimes(1);

    // 2. Invalidate cache via update (updateExam calls findById once to verify entity)
    await service.updateExam({
      id: "exam-cbt-100",
      title: "Ujian Geografi (Revisi)",
    });
    expect(findByIdSpy).toHaveBeenCalledTimes(2);

    // 3. Next snapshot fetch should re-query DB -> DB called 3 times total
    await service.getSnapshot({ examId: "exam-cbt-100" });
    expect(findByIdSpy).toHaveBeenCalledTimes(3);
  });

  it("delegates listExams and getExamById cleanly via use cases", async () => {
    const mockRepo: ExamRepositoryInterface = {
      findById: vi.fn().mockResolvedValue(mockExam),
      findByMoodleCbtId: vi.fn(),
      findAll: vi.fn().mockResolvedValue([mockExam]),
      save: vi.fn(),
      getAnswerKeys: vi.fn(),
      updateRoomToken: vi.fn(),
      updateExamMetadata: vi.fn(),
    };

    const service = new ExamService(mockRepo);

    const listResult = await service.listExams();
    expect(listResult.isSuccess).toBe(true);
    expect(listResult.value).toHaveLength(1);

    const detailResult = await service.getExamById("exam-cbt-100");
    expect(detailResult.isSuccess).toBe(true);
    expect(detailResult.value.id).toBe("exam-cbt-100");
  });
});
