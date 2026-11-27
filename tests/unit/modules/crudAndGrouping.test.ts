import { describe, expect, it, vi } from "vitest";
import { ClassesService } from "@/modules/classes/application/service/ClassesService";
import type { ClassesRepositoryInterface } from "@/modules/classes/domain/interfaces/ClassesRepositoryInterface";
import { ExamService } from "@/modules/exams/application/service/ExamService";
import { ExamEntity } from "@/modules/exams/domain/entities/ExamEntity";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";
import { QuestionsService } from "@/modules/questions/application/service/QuestionsService";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";
import { SubjectsService } from "@/modules/subjects/application/service/SubjectsService";
import type { SubjectsRepositoryInterface } from "@/modules/subjects/domain/interfaces/SubjectsRepositoryInterface";

describe("CRUD & Class Grouping Across Student, Subject, Question, Exam", () => {
  it("ClassesService supports student view/edit/delete, class edit, and bulk class grouping", async () => {
    const mockRepo: ClassesRepositoryInterface = {
      getAllClasses: vi.fn().mockResolvedValue([]),
      getClassById: vi.fn().mockResolvedValue(null),
      createClass: vi.fn(),
      updateClass: vi.fn().mockResolvedValue({
        id: "cls-1",
        name: "XII IPA 2",
        code: "XII-IPA-2",
        description: "Updated",
        studentCount: 1,
        createdAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-02T00:00:00Z",
      }),
      deleteClass: vi.fn().mockResolvedValue(true),
      getAllStudents: vi.fn().mockResolvedValue([]),
      getStudentById: vi.fn().mockResolvedValue({
        id: "stu-1",
        username: "2026001",
        fullName: "Budi",
        isActive: true,
        createdAt: "2026-11-01T00:00:00Z",
      }),
      createStudent: vi.fn(),
      updateStudent: vi.fn().mockResolvedValue({
        id: "stu-1",
        username: "2026001",
        fullName: "Budi Santoso",
        classGroupId: "cls-1",
        className: "XII IPA 2",
        isActive: true,
        createdAt: "2026-11-01T00:00:00Z",
      }),
      deleteStudent: vi.fn().mockResolvedValue(true),
      assignStudentToClass: vi.fn().mockResolvedValue(true),
      bulkAssignStudentsToClass: vi.fn().mockResolvedValue(3),
    };

    const service = new ClassesService(mockRepo);

    const viewed = await service.getStudentById("stu-1");
    expect(viewed?.username).toBe("2026001");

    const updated = await service.updateStudent("stu-1", {
      fullName: "  Budi Santoso ",
      classGroupId: "cls-1",
    });
    expect(updated?.fullName).toBe("Budi Santoso");

    const groupedCount = await service.bulkAssignStudentsToClass({
      studentIds: ["stu-1", "stu-2", "stu-3"],
      classGroupId: "cls-1",
    });
    expect(groupedCount).toBe(3);

    expect(await service.deleteStudent("stu-1")).toBe(true);
    expect(
      (await service.updateClass("cls-1", { name: "XII IPA 2" }))?.name,
    ).toBe("XII IPA 2");
  });

  it("SubjectsService supports CRUD (view, create, edit, delete)", async () => {
    const mockRepo: SubjectsRepositoryInterface = {
      getAllNames: vi.fn().mockResolvedValue(["Matematika"]),
      getAllDetailed: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue({
        id: "sub-1",
        name: "Matematika",
        shortName: "MAT",
        isVisible: true,
        questionCount: 5,
        examCount: 1,
        gradeLevels: ["X", "XII"],
        questions: [],
        exams: [],
        createdAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-01T00:00:00Z",
      }),
      create: vi.fn().mockResolvedValue({
        id: "sub-2",
        name: "Fisika",
        shortName: "FIS",
        isVisible: true,
        questionCount: 0,
        examCount: 0,
        gradeLevels: [],
        createdAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-01T00:00:00Z",
      }),
      update: vi.fn().mockResolvedValue({
        id: "sub-2",
        name: "Fisika Terapan",
        shortName: "FIS-T",
        isVisible: false,
        questionCount: 0,
        examCount: 0,
        gradeLevels: [],
        createdAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-02T00:00:00Z",
      }),
      delete: vi.fn().mockResolvedValue(true),
    };

    const service = new SubjectsService(mockRepo);
    expect((await service.getById("sub-1"))?.gradeLevels).toEqual(["X", "XII"]);
    expect(
      (await service.create({ name: "Fisika", shortName: "FIS" })).name,
    ).toBe("Fisika");
    const updatedSub = await service.update("sub-2", {
      name: "Fisika Terapan",
      isVisible: false,
    });
    expect(updatedSub?.name).toBe("Fisika Terapan");
    expect(updatedSub?.isVisible).toBe(false);
    expect(await service.delete("sub-2")).toBe(true);
  });

  it("QuestionsService supports bulk gradeLevel and subject grouping", async () => {
    const repo = new QuestionsRepository();
    const service = new QuestionsService(repo);
    const listRes = await service.getQuestions();
    expect(listRes.isSuccess).toBe(true);
    const firstTwo = listRes.isSuccess
      ? listRes.value.slice(0, 2).map((q) => q.id)
      : [];
    expect(firstTwo.length).toBe(2);

    const groupRes = await service.bulkGroupQuestions(firstTwo, {
      gradeLevel: "XI",
      subject: "Fisika",
    });
    expect(groupRes.isSuccess).toBe(true);
    if (groupRes.isSuccess) {
      expect(groupRes.value).toBe(2);
    }

    const fetched = await service.getQuestionById(firstTwo[0] ?? "");
    expect(fetched.isSuccess).toBe(true);
    if (fetched.isSuccess) {
      expect(fetched.value?.gradeLevel).toBe("XI");
      expect(fetched.value?.subject).toBe("Fisika");
    }
  });

  it("ExamService supports update metadata and deleteExam", async () => {
    const exam = new ExamEntity({
      id: "ex-1",
      moodleCbtId: 10,
      title: "UTS Matematika",
      courseName: "Matematika",
      activeToken: "ABC123",
      tokenExpiresAt: new Date(Date.now() + 3600_000),
      timeOpen: new Date(),
      timeClose: new Date(Date.now() + 7200_000),
    });

    const mockRepo: ExamRepositoryInterface = {
      findById: vi.fn().mockResolvedValue(exam),
      findAll: vi.fn().mockResolvedValue([exam]),
      save: vi.fn().mockResolvedValue(exam),
      findByMoodleCbtId: vi.fn().mockResolvedValue(exam),
      getAnswerKeys: vi.fn().mockResolvedValue({}),
      updateRoomToken: vi.fn().mockResolvedValue(undefined),
      updateExamMetadata: vi.fn().mockResolvedValue(
        new ExamEntity({
          id: "ex-1",
          moodleCbtId: 10,
          title: "UAS Matematika",
          courseName: "Matematika Wajib",
          activeToken: "ABC123",
          tokenExpiresAt: new Date(Date.now() + 3600_000),
          timeOpen: exam.timeOpen,
          timeClose: exam.timeClose,
        }),
      ),
      deleteExam: vi.fn().mockResolvedValue(true),
    };

    const service = new ExamService(mockRepo);
    const updated = await service.updateExam({
      id: "ex-1",
      title: "UAS Matematika",
      courseName: "Matematika Wajib",
    });
    expect(updated.isSuccess).toBe(true);
    if (updated.isSuccess) {
      expect(updated.value.title).toBe("UAS Matematika");
      expect(updated.value.courseName).toBe("Matematika Wajib");
      expect(updated.value.timeOpen).toBeDefined();
    }

    const deleted = await service.deleteExam("ex-1");
    expect(deleted.isSuccess).toBe(true);
    if (deleted.isSuccess) {
      expect(deleted.value).toBe(true);
    }
  });
});
