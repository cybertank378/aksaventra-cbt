import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { MoodleSyncService } from "@/modules/sync/application/MoodleSyncService";

function createMockDb() {
  return {
    subject: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "sub-1" }),
      update: vi.fn().mockResolvedValue({ id: "sub-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    classGroup: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue({ id: "cls-1", name: "XII IPA 1", moodleId: 10 }),
      create: vi.fn().mockResolvedValue({ id: "cls-1" }),
      update: vi.fn().mockResolvedValue({ id: "cls-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "usr-1" }),
      update: vi.fn().mockResolvedValue({ id: "usr-1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    exam: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "ex-1" }),
      update: vi.fn().mockResolvedValue({ id: "ex-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    question: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "q-1" }),
      update: vi.fn().mockResolvedValue({ id: "q-1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
}

describe("MoodleSyncService Bidirectional Sync", () => {
  it("pullAllFromMoodle upserts courses, classes, students, exams, and questions", async () => {
    const db = createMockDb();
    const callMoodle = vi.fn().mockResolvedValue({
      success: true,
      message: "ok",
      data_json: JSON.stringify({
        courses: [{ id: 2, name: "Matematika", short_name: "MAT" }],
        classes: [{ id: 10, name: "XII IPA 1", code: "XII-IPA-1" }],
        students: [
          {
            user_id: 101,
            username: "siswa01",
            full_name: "Budi Santoso",
            class_id: 10,
            class_name: "XII IPA 1",
          },
        ],
        exams: [
          {
            id: 50,
            course_id: 2,
            course_name: "Matematika",
            title: "UAS Matematika",
            time_open: 1794700000,
            time_close: 1794786400,
            duration_seconds: 5400,
            max_strikes: 3,
            active_token: "ABC123",
          },
        ],
        questions: [
          {
            id: 200,
            code: "MDL-Q-200",
            type: "multichoice",
            stem: "Berapakah 2+2?",
            points: 2,
            options: [{ id: "1", label: "A", text: "4", isCorrect: true }],
          },
        ],
      }),
    });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );
    const result = await service.pullAllFromMoodle();

    expect(result.success).toBe(true);
    expect(result.counts).toEqual({
      courses: 1,
      classes: 1,
      students: 1,
      exams: 1,
      questions: 1,
    });
    expect(db.subject.create).toHaveBeenCalledTimes(1);
    expect(db.classGroup.create).toHaveBeenCalledTimes(1);
    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          moodleUserId: 101,
          username: "siswa01",
          classGroupId: "cls-1",
        }),
      }),
    );
    expect(db.exam.create).toHaveBeenCalledTimes(1);
    expect(db.question.create).toHaveBeenCalledTimes(1);
  });

  it("handleWebhookEvent processes deleted entities cleanly", async () => {
    const db = createMockDb();
    const callMoodle = vi.fn();
    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );

    const resCohort = await service.handleWebhookEvent({
      entity: "cohort",
      action: "deleted",
      objectId: 10,
    });
    expect(resCohort.success).toBe(true);
    expect(db.classGroup.deleteMany).toHaveBeenCalledWith({
      where: { moodleId: 10 },
    });

    const resUser = await service.handleWebhookEvent({
      entity: "user",
      action: "deleted",
      objectId: 101,
    });
    expect(resUser.success).toBe(true);
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { moodleUserId: 101 },
      data: { isActive: false },
    });
  });

  it("outbound push updates local Moodle foreign IDs and handles offline Moodle gracefully", async () => {
    const db = createMockDb();
    const callMoodle = vi
      .fn()
      .mockResolvedValueOnce({ success: true, record_id: 77, message: "ok" })
      .mockRejectedValueOnce(new Error("Moodle offline"));

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );

    const classRes = await service.pushClassToMoodle({
      id: "cls-1",
      name: "XII IPA 1",
      code: "XII-IPA-1",
    });
    expect(classRes.synced).toBe(true);
    expect(classRes.moodleId).toBe(77);
    expect(db.classGroup.update).toHaveBeenCalledWith({
      where: { id: "cls-1" },
      data: { moodleId: 77 },
    });

    const failRes = await service.pushQuestionToMoodle({
      id: "q-1",
      code: "MAT-MU-101",
      type: "multichoice",
      stem: "Test",
      points: 1,
      options: [],
    });
    expect(failRes.synced).toBe(false);
    expect(failRes.error).toContain("Moodle offline");
  });
});
