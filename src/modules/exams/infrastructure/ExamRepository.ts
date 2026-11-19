import type { Prisma } from "@prisma/client";
import { prisma as defaultPrisma, type PrismaClient } from "@/libs/prisma";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type {
  QuestionItemDTO,
  StudentAvailableExamDTO,
} from "../domain/dto/ExamSnapshotDTO";
import { ExamEntity } from "../domain/entities/ExamEntity";
import { QuestionItemEntity } from "../domain/entities/QuestionItemEntity";
import type { ExamRepositoryInterface } from "../domain/interfaces/ExamRepositoryInterface";

export class ExamRepository implements ExamRepositoryInterface {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  private mapToEntity(exam: {
    id: string;
    moodleCbtId: number;
    title: string;
    courseName: string;
    durationSeconds: number;
    maxStrikes: number;
    sebRequired: boolean;
    sebConfigKey: string | null;
    activeToken: string;
    tokenExpiresAt: Date;
    snapshotHash: string | null;
    questionsJson: unknown;
    timeOpen: Date;
    timeClose: Date;
    createdAt: Date;
    updatedAt: Date;
  }): ExamEntity {
    const rawQuestions = (exam.questionsJson as QuestionItemDTO[]) || [];
    const questions = rawQuestions.map(
      (q) =>
        new QuestionItemEntity({
          slot: q.slot,
          questionId: q.questionId,
          type: q.type,
          stemHtml: q.stemHtml,
          options: q.options,
        }),
    );

    return new ExamEntity({
      id: exam.id,
      moodleCbtId: exam.moodleCbtId,
      title: exam.title,
      courseName: exam.courseName,
      durationSeconds: exam.durationSeconds,
      maxStrikes: exam.maxStrikes,
      sebRequired: exam.sebRequired,
      sebConfigKey: exam.sebConfigKey,
      activeToken: exam.activeToken,
      tokenExpiresAt: exam.tokenExpiresAt,
      snapshotHash: exam.snapshotHash,
      questions,
      timeOpen: exam.timeOpen,
      timeClose: exam.timeClose,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    });
  }

  public async findById(id: string): Promise<ExamEntity | null> {
    const exam = await this.db.exam.findUnique({
      where: { id },
    });
    return exam ? this.mapToEntity(exam) : null;
  }

  public async findByMoodleCbtId(
    moodleCbtId: number,
  ): Promise<ExamEntity | null> {
    const exam = await this.db.exam.findUnique({
      where: { moodleCbtId },
    });
    return exam ? this.mapToEntity(exam) : null;
  }

  public async findAll(): Promise<ExamEntity[]> {
    const exams = await this.db.exam.findMany({
      orderBy: { timeOpen: "desc" },
    });
    return exams.map((e: Parameters<typeof this.mapToEntity>[0]) =>
      this.mapToEntity(e),
    );
  }

  public async getAnswerKeys(
    examId: string,
  ): Promise<Record<string, string> | null> {
    const exam = await this.db.exam.findUnique({
      where: { id: examId },
      select: { answerKeysJson: true },
    });
    return (exam?.answerKeysJson as Record<string, string>) || null;
  }

  public async updateRoomToken(
    examId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.exam.update({
      where: { id: examId },
      data: {
        activeToken: token,
        tokenExpiresAt: expiresAt,
      },
    });
  }

  public async updateExamMetadata(
    examId: string,
    params: {
      title?: string;
      courseName?: string;
      durationSeconds?: number;
      maxStrikes?: number;
      sebRequired?: boolean;
      sebConfigKey?: string | null;
      timeOpen?: Date;
      timeClose?: Date;
    },
  ): Promise<ExamEntity> {
    const updated = await this.db.exam.update({
      where: { id: examId },
      data: {
        ...(params.title !== undefined ? { title: params.title } : {}),
        ...(params.courseName !== undefined
          ? { courseName: params.courseName }
          : {}),
        ...(params.durationSeconds !== undefined
          ? { durationSeconds: params.durationSeconds }
          : {}),
        ...(params.maxStrikes !== undefined
          ? { maxStrikes: params.maxStrikes }
          : {}),
        ...(params.sebRequired !== undefined
          ? { sebRequired: params.sebRequired }
          : {}),
        ...(params.sebConfigKey !== undefined
          ? { sebConfigKey: params.sebConfigKey }
          : {}),
        ...(params.timeOpen !== undefined ? { timeOpen: params.timeOpen } : {}),
        ...(params.timeClose !== undefined
          ? { timeClose: params.timeClose }
          : {}),
      },
    });

    const mapped = this.mapToEntity(updated);
    if (process.env.NODE_ENV !== "test") {
      void moodleSyncService.pushExamToMoodle({
        id: mapped.id,
        moodleCbtId: mapped.moodleCbtId,
        title: mapped.title,
        courseName: mapped.courseName,
        durationSeconds: mapped.durationSeconds,
        maxStrikes: mapped.maxStrikes,
        activeToken: mapped.activeToken,
        timeOpen: mapped.timeOpen,
        timeClose: mapped.timeClose,
      });
    }
    return mapped;
  }

  public async save(
    entity: ExamEntity,
    answerKeysJson: Record<string, string> = {},
  ): Promise<ExamEntity> {
    const questionsJson = entity.questions.map((q) => q.toDTO());
    const prismaQuestions = questionsJson as unknown as Prisma.InputJsonValue;
    const prismaAnswerKeys = answerKeysJson as unknown as Prisma.InputJsonValue;

    const saved = await this.db.exam.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        moodleCbtId: entity.moodleCbtId,
        title: entity.title,
        courseName: entity.courseName,
        durationSeconds: entity.durationSeconds,
        maxStrikes: entity.maxStrikes,
        sebRequired: entity.sebRequired,
        sebConfigKey: entity.sebConfigKey,
        activeToken: entity.activeToken,
        tokenExpiresAt: entity.tokenExpiresAt,
        snapshotHash: entity.snapshotHash,
        questionsJson: prismaQuestions,
        answerKeysJson: prismaAnswerKeys,
        timeOpen: entity.timeOpen,
        timeClose: entity.timeClose,
      },
      update: {
        title: entity.title,
        courseName: entity.courseName,
        durationSeconds: entity.durationSeconds,
        maxStrikes: entity.maxStrikes,
        sebRequired: entity.sebRequired,
        sebConfigKey: entity.sebConfigKey,
        activeToken: entity.activeToken,
        tokenExpiresAt: entity.tokenExpiresAt,
        snapshotHash: entity.snapshotHash,
        questionsJson: prismaQuestions,
        answerKeysJson: prismaAnswerKeys,
        timeOpen: entity.timeOpen,
        timeClose: entity.timeClose,
      },
    });

    const mapped = this.mapToEntity(saved);
    if (process.env.NODE_ENV !== "test") {
      void moodleSyncService.pushExamToMoodle({
        id: mapped.id,
        moodleCbtId: mapped.moodleCbtId,
        title: mapped.title,
        courseName: mapped.courseName,
        durationSeconds: mapped.durationSeconds,
        maxStrikes: mapped.maxStrikes,
        activeToken: mapped.activeToken,
        timeOpen: mapped.timeOpen,
        timeClose: mapped.timeClose,
      });
    }
    return mapped;
  }

  public async deleteExam(examId: string): Promise<boolean> {
    try {
      const existing = await this.db.exam.findUnique({
        where: { id: examId },
        select: { moodleCbtId: true },
      });
      await this.db.exam.delete({
        where: { id: examId },
      });
      if (process.env.NODE_ENV !== "test" && existing?.moodleCbtId) {
        void moodleSyncService.deleteEntityInMoodle(
          "cbt",
          existing.moodleCbtId,
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  public async listForStudent(
    userId: string,
  ): Promise<StudentAvailableExamDTO[]> {
    const exams = await this.db.exam.findMany({
      orderBy: [{ timeOpen: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        moodleCbtId: true,
        title: true,
        courseName: true,
        durationSeconds: true,
        maxStrikes: true,
        sebRequired: true,
        questionsJson: true,
        timeOpen: true,
        timeClose: true,
        attempts: {
          where: { userId },
          take: 1,
          select: {
            id: true,
            status: true,
            finalScore: true,
            startedAt: true,
            finishedAt: true,
          },
        },
      },
    });

    const now = Date.now();
    return exams.map((exam) => {
      const openTime = exam.timeOpen.getTime();
      const closeTime = exam.timeClose.getTime();
      const availabilityStatus: "OPEN" | "UPCOMING" | "CLOSED" =
        now < openTime ? "UPCOMING" : now > closeTime ? "CLOSED" : "OPEN";

      const questions = Array.isArray(exam.questionsJson)
        ? exam.questionsJson
        : [];
      const studentAttempt = exam.attempts[0] ?? null;

      return {
        id: exam.id,
        moodleCbtId: exam.moodleCbtId,
        title: exam.title,
        courseName: exam.courseName,
        durationSeconds: exam.durationSeconds,
        maxStrikes: exam.maxStrikes,
        sebRequired: exam.sebRequired,
        totalQuestions: questions.length,
        timeOpen: exam.timeOpen.toISOString(),
        timeClose: exam.timeClose.toISOString(),
        availabilityStatus,
        attempt: studentAttempt
          ? {
              id: studentAttempt.id,
              status: studentAttempt.status,
              finalScore: studentAttempt.finalScore,
              startedAt: studentAttempt.startedAt.toISOString(),
              finishedAt: studentAttempt.finishedAt
                ? studentAttempt.finishedAt.toISOString()
                : null,
            }
          : null,
      };
    });
  }
}
