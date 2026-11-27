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
      findMany: vi.fn().mockResolvedValue([{ id: "cls-1" }]),
      findUnique: vi.fn().mockResolvedValue({
        id: "cls-1",
        name: "XII IPA 1",
        code: "XII-IPA-1",
        description: null,
        moodleId: 10,
      }),
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
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { classGroupId: { in: ["cls-1"] } },
      data: { classGroupId: null, className: null },
    });
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

  it("deleteEntityInMoodle calls mod_cbt_sync_master delete_entity when moodleId is valid", async () => {
    const db = createMockDb();
    const callMoodle = vi.fn().mockResolvedValue({
      success: true,
      message: "deleted",
      record_id: 55,
      data_json: "{}",
    });
    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );

    const skipped = await service.deleteEntityInMoodle("user", null);
    expect(skipped.synced).toBe(false);
    expect(callMoodle).not.toHaveBeenCalled();

    const deleted = await service.deleteEntityInMoodle("user", 55);
    expect(deleted.synced).toBe(true);
    expect(callMoodle).toHaveBeenCalledWith("mod_cbt_sync_master", {
      action: "delete_entity",
      payload: JSON.stringify({ entity: "user", moodle_id: 55 }),
    });
  });

  it("pushStudentToMoodle auto-creates unlinked Moodle Cohort before assigning student", async () => {
    const db = createMockDb();
    db.classGroup.findUnique.mockResolvedValueOnce({
      id: "cls-local-1",
      moodleId: null,
      name: "VII-1",
      code: "VII-1",
      description: "Rombel 7-1",
    });

    const callMoodle = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        record_id: 42,
        message: "Cohort created",
      })
      .mockResolvedValueOnce({
        success: true,
        record_id: 901,
        message: "Student synced",
      });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );

    const res = await service.pushStudentToMoodle({
      id: "usr-local-1",
      username: "siswa07",
      fullName: "Ani Wijaya",
      classGroupId: "cls-local-1",
      replaceCohort: true,
    });

    expect(res.synced).toBe(true);
    expect(callMoodle).toHaveBeenNthCalledWith(1, "mod_cbt_manage_groups", {
      action: "create_class",
      payload: JSON.stringify({
        moodle_id: 0,
        name: "VII-1",
        code: "VII-1",
        description: "Rombel 7-1",
      }),
    });
    expect(callMoodle).toHaveBeenNthCalledWith(2, "mod_cbt_manage_groups", {
      action: "create_student",
      payload: JSON.stringify({
        moodle_user_id: 0,
        username: "siswa07",
        firstname: "Ani",
        lastname: "Wijaya",
        password: "",
        class_id: 42,
        replace_cohort: true,
      }),
    });
  });

  it("enrollStudentsInMoodle calls mod_cbt_manage_groups enroll_students with resolved course, cohorts, and users", async () => {
    const db = createMockDb();
    db.subject.findFirst.mockResolvedValueOnce({ moodleCourseId: 12 });
    const callMoodle = vi.fn().mockResolvedValue({
      success: true,
      message: "Enrolled",
      record_id: 2,
    });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );

    const res = await service.enrollStudentsInMoodle({
      courseName: "Matematika",
      moodleCbtId: 5,
      cohortMoodleIds: [10],
      userMoodleIds: [101, 102],
      roomCode: "LAB-02",
      seatPrefix: "A",
    });

    expect(res.synced).toBe(true);
    expect(callMoodle).toHaveBeenCalledWith("mod_cbt_manage_groups", {
      action: "enroll_students",
      payload: JSON.stringify({
        course_id: 12,
        course_name: "Matematika",
        cbt_id: 5,
        cohort_ids: [10],
        user_ids: [101, 102],
        room_code: "LAB-02",
        seat_prefix: "A",
      }),
    });
  });

  it("syncStudentsFromMoodle corrects previously mis-mapped ADMIN teacher back to TEACHER while preserving primary admin", async () => {
    const db = createMockDb();
    db.user.findFirst
      .mockResolvedValueOnce({
        id: "usr-teacher-1",
        moodleUserId: 15,
        username: "197103092017081001",
        fullName: "Agus Wurjantoro mtk",
        role: "ADMIN",
        passwordHash: "$2y$10$hash",
        classGroupId: null,
        className: null,
        isActive: true,
      })
      .mockResolvedValueOnce({
        id: "usr-admin-1",
        moodleUserId: 2,
        username: "admin",
        fullName: "Admin Fahdking",
        role: "ADMIN",
        passwordHash: "$argon2id$hash",
        classGroupId: null,
        className: null,
        isActive: true,
      });

    const callMoodle = vi.fn().mockResolvedValue({
      success: true,
      message: "ok",
      data_json: JSON.stringify({
        students: [
          {
            user_id: 15,
            username: "197103092017081001",
            full_name: "Agus Wurjantoro mtk",
            role: "TEACHER",
            moodle_roles: "coursecreator,manager",
          },
          {
            user_id: 2,
            username: "admin",
            full_name: "Admin Fahdking",
            role: "TEACHER",
          },
        ],
      }),
    });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );
    const count = await service.syncStudentsFromMoodle();

    expect(count).toBe(2);
    expect(db.user.update).toHaveBeenCalledTimes(1);
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "usr-teacher-1" },
        data: expect.objectContaining({
          role: "TEACHER",
        }),
      }),
    );
  });

  it("syncCoursesFromMoodle strips HTML, truncates to 190 chars, and disambiguates duplicate course names", async () => {
    const baseDb = createMockDb();
    const db = {
      ...baseDb,
      subject: {
        ...baseDb.subject,
        findMany: vi.fn().mockResolvedValue([
          {
            id: "sub-existing-1",
            moodleCourseId: 10,
            name: "Matematika",
            shortName: "MTK-7",
            description: "Existing",
          },
        ]),
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: "sub-new-2" })
          .mockResolvedValueOnce({ id: "sub-new-3" }),
      },
    };

    const longHtmlDesc = `<p>${"Deskripsi panjang ".repeat(20)}</p>`;
    const callMoodle = vi.fn().mockResolvedValue({
      success: true,
      message: "ok",
      data_json: JSON.stringify({
        courses: [
          {
            id: 11,
            name: "Matematika",
            short_name: "MTK-8",
            description: longHtmlDesc,
            is_visible: false,
          },
          {
            id: 12,
            name: "Bahasa Indonesia",
            short_name: "BINDO",
            description: "<b>Materi</b> Bahasa",
            is_visible: true,
          },
        ],
      }),
    });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );
    const count = await service.syncCoursesFromMoodle();

    expect(count).toBe(2);
    expect(db.subject.update).not.toHaveBeenCalled();
    expect(db.subject.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          moodleCourseId: 11,
          name: "Matematika (MTK-8)",
          shortName: "MTK-8",
          isVisible: false,
        }),
      }),
    );
    const createdDesc = db.subject.create.mock.calls[0]?.[0]?.data
      ?.description as string;
    expect(createdDesc).not.toContain("<p>");
    expect(createdDesc.length).toBeLessThanOrEqual(190);

    expect(db.subject.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          moodleCourseId: 12,
          name: "Bahasa Indonesia",
          shortName: "BINDO",
          description: "Materi Bahasa",
          isVisible: true,
        }),
      }),
    );
  });

  it("pushSubjectToMoodle sends is_visible bidirectionally to Moodle", async () => {
    const db = createMockDb();
    const callMoodle = vi.fn().mockResolvedValue({
      success: true,
      record_id: 25,
      message: "updated",
    });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );
    const res = await service.pushSubjectToMoodle({
      id: "sub-25",
      moodleCourseId: 25,
      name: "Fisika XI",
      shortName: "FIS-11",
      description: "Materi Fisika",
      isVisible: false,
    });

    expect(res.synced).toBe(true);
    expect(callMoodle).toHaveBeenCalledWith("mod_cbt_sync_master", {
      action: "push_course",
      payload: JSON.stringify({
        moodle_course_id: 25,
        name: "Fisika XI",
        short_name: "FIS-11",
        description: "Materi Fisika",
        is_visible: false,
      }),
    });
  });

  it("syncQuestionsFromMoodle resolves question subject via course_id and pushQuestionToMoodle sends moodle_course_id", async () => {
    const baseDb = createMockDb();
    const db = {
      ...baseDb,
      subject: {
        ...baseDb.subject,
        findMany: vi
          .fn()
          .mockResolvedValue([{ moodleCourseId: 15, name: "IPA Terpadu" }]),
        findFirst: vi.fn().mockResolvedValue({ moodleCourseId: 15 }),
      },
    };

    const callMoodle = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        message: "ok",
        data_json: JSON.stringify({
          questions: [
            {
              id: 301,
              course_id: 15,
              subject: "Umum",
              code: "IPA-Q-1",
              type: "multichoice",
              stem: "Satuan SI gaya adalah?",
              points: 2,
              options: [
                { id: "1", label: "A", text: "Newton", isCorrect: true },
              ],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        success: true,
        record_id: 302,
        message: "pushed",
      });

    const service = new MoodleSyncService(
      db as unknown as PrismaClient,
      callMoodle,
    );
    const pulled = await service.syncQuestionsFromMoodle();
    expect(pulled).toBe(1);
    expect(db.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          moodleQuestionId: 301,
          subject: "IPA Terpadu",
        }),
      }),
    );

    const pushed = await service.pushQuestionToMoodle({
      id: "q-local-1",
      subject: "IPA Terpadu",
      code: "IPA-Q-2",
      type: "multichoice",
      stem: "Rumus kecepatan?",
      points: 1,
      options: [{ text: "v = s/t", isCorrect: true }],
    });
    expect(pushed.synced).toBe(true);
    expect(callMoodle).toHaveBeenNthCalledWith(2, "mod_cbt_sync_master", {
      action: "push_question",
      payload: JSON.stringify({
        moodle_question_id: 0,
        moodle_course_id: 15,
        subject: "IPA Terpadu",
        code: "IPA-Q-2",
        type: "multichoice",
        stem: "Rumus kecepatan?",
        points: 1,
        explanation: "",
        options: [{ text: "v = s/t", isCorrect: true }],
      }),
    });
  });
});
