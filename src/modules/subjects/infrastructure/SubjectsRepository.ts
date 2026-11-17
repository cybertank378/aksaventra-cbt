import { prisma } from "@/libs/prisma";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type {
  CreateSubjectInputDTO,
  SubjectDetailDTO,
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "../domain/dto/SubjectDTO";
import type { SubjectsRepositoryInterface } from "../domain/interfaces/SubjectsRepositoryInterface";

export class SubjectsRepository implements SubjectsRepositoryInterface {
  async getAllNames(): Promise<string[]> {
    const subjectSet = new Set<string>();

    try {
      const subjects = await prisma.subject.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      });
      for (const s of subjects) {
        if (s.name?.trim()) subjectSet.add(s.name.trim());
      }
    } catch {
      // Fallback gracefully
    }

    try {
      const exams = await prisma.exam.findMany({
        select: { courseName: true },
        distinct: ["courseName"],
      });
      for (const exam of exams) {
        if (exam.courseName?.trim()) subjectSet.add(exam.courseName.trim());
      }
    } catch {
      // Ignore
    }

    try {
      const questionsRepo = new QuestionsRepository();
      const questions = await questionsRepo.findMany();
      for (const q of questions) {
        if (q.subject?.trim()) subjectSet.add(q.subject.trim());
      }
    } catch {
      // Ignore
    }

    return Array.from(subjectSet).sort((a, b) => a.localeCompare(b));
  }

  async getAllDetailed(): Promise<SubjectDTO[]> {
    const [subjects, questions, exams] = await Promise.all([
      prisma.subject.findMany({ orderBy: { name: "asc" } }),
      prisma.question.findMany({
        select: { subject: true, gradeLevel: true },
      }),
      prisma.exam.findMany({
        select: { courseName: true },
      }),
    ]);

    const qCountMap = new Map<string, number>();
    const gradeMap = new Map<string, Set<string>>();
    for (const q of questions) {
      const key = q.subject.trim().toLowerCase();
      qCountMap.set(key, (qCountMap.get(key) ?? 0) + 1);
      if (!gradeMap.has(key)) gradeMap.set(key, new Set());
      if (q.gradeLevel?.trim()) gradeMap.get(key)?.add(q.gradeLevel.trim());
    }

    const eCountMap = new Map<string, number>();
    for (const e of exams) {
      const key = e.courseName.trim().toLowerCase();
      eCountMap.set(key, (eCountMap.get(key) ?? 0) + 1);
    }

    return subjects.map((s) => {
      const key = s.name.trim().toLowerCase();
      return {
        id: s.id,
        moodleCourseId: s.moodleCourseId,
        name: s.name,
        shortName: s.shortName,
        description: s.description,
        questionCount: qCountMap.get(key) ?? 0,
        examCount: eCountMap.get(key) ?? 0,
        gradeLevels: Array.from(gradeMap.get(key) ?? []).sort(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      };
    });
  }

  async getById(id: string): Promise<SubjectDetailDTO | null> {
    const s = await prisma.subject.findUnique({ where: { id } });
    if (!s) return null;

    const [questions, exams] = await Promise.all([
      prisma.question.findMany({
        where: { subject: s.name },
        select: {
          id: true,
          code: true,
          gradeLevel: true,
          type: true,
          points: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.exam.findMany({
        where: { courseName: s.name },
        select: {
          id: true,
          title: true,
          durationSeconds: true,
          timeOpen: true,
        },
        orderBy: { timeOpen: "desc" },
      }),
    ]);

    const gradeSet = new Set<string>();
    for (const q of questions) {
      if (q.gradeLevel?.trim()) gradeSet.add(q.gradeLevel.trim());
    }

    return {
      id: s.id,
      moodleCourseId: s.moodleCourseId,
      name: s.name,
      shortName: s.shortName,
      description: s.description,
      questionCount: questions.length,
      examCount: exams.length,
      gradeLevels: Array.from(gradeSet).sort(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      questions,
      exams: exams.map((e) => ({
        id: e.id,
        title: e.title,
        durationSeconds: e.durationSeconds,
        timeOpen: e.timeOpen.toISOString(),
      })),
    };
  }

  async create(data: CreateSubjectInputDTO): Promise<SubjectDTO> {
    const name = data.name.trim();
    const subject = await prisma.subject.upsert({
      where: { name },
      create: {
        name,
        shortName: data.shortName?.trim() || null,
        description: data.description?.trim() || null,
      },
      update: {
        ...(data.shortName ? { shortName: data.shortName.trim() } : {}),
        ...(data.description ? { description: data.description.trim() } : {}),
      },
    });

    if (process.env.NODE_ENV !== "test") {
      void moodleSyncService.pushSubjectToMoodle({
        id: subject.id,
        name: subject.name,
        shortName: subject.shortName,
        description: subject.description,
      });
    }

    return {
      id: subject.id,
      moodleCourseId: subject.moodleCourseId,
      name: subject.name,
      shortName: subject.shortName,
      description: subject.description,
      questionCount: 0,
      examCount: 0,
      gradeLevels: [],
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    };
  }

  async update(
    id: string,
    data: UpdateSubjectInputDTO,
  ): Promise<SubjectDTO | null> {
    try {
      const existing = await prisma.subject.findUnique({ where: { id } });
      if (!existing) return null;

      const nextName = data.name?.trim();
      const updated = await prisma.subject.update({
        where: { id },
        data: {
          ...(nextName ? { name: nextName } : {}),
          ...(data.shortName !== undefined
            ? { shortName: data.shortName ? data.shortName.trim() : null }
            : {}),
          ...(data.description !== undefined
            ? { description: data.description ? data.description.trim() : null }
            : {}),
        },
      });

      if (nextName && nextName !== existing.name) {
        await Promise.all([
          prisma.question.updateMany({
            where: { subject: existing.name },
            data: { subject: nextName },
          }),
          prisma.exam.updateMany({
            where: { courseName: existing.name },
            data: { courseName: nextName },
          }),
        ]);
      }

      if (process.env.NODE_ENV !== "test") {
        void moodleSyncService.pushSubjectToMoodle({
          id: updated.id,
          moodleCourseId: updated.moodleCourseId,
          name: updated.name,
          shortName: updated.shortName,
          description: updated.description,
        });
      }

      const detail = await this.getById(updated.id);
      if (detail) {
        const { questions: _q, exams: _e, ...dto } = detail;
        return dto;
      }

      return {
        id: updated.id,
        moodleCourseId: updated.moodleCourseId,
        name: updated.name,
        shortName: updated.shortName,
        description: updated.description,
        questionCount: 0,
        examCount: 0,
        gradeLevels: [],
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existing = await prisma.subject.findUnique({
        where: { id },
        select: { moodleCourseId: true },
      });
      await prisma.subject.delete({ where: { id } });
      if (process.env.NODE_ENV !== "test" && existing?.moodleCourseId) {
        void moodleSyncService.deleteEntityInMoodle(
          "course",
          existing.moodleCourseId,
        );
      }
      return true;
    } catch {
      return false;
    }
  }
}
