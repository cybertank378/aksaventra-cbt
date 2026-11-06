import type { AttemptStatus, Prisma } from "@prisma/client";
import { prisma as defaultPrisma, type PrismaClient } from "@/libs/prisma";
import type { AnswerItemDTO } from "../domain/dto/SyncBatchDTO";
import { AnswerRecordEntity } from "../domain/entities/AnswerRecordEntity";
import { AttemptSessionEntity } from "../domain/entities/AttemptSessionEntity";
import type { SecurityStrikeEntity } from "../domain/entities/SecurityStrikeEntity";
import type {
  AttemptRepositoryInterface,
  BatchSyncResult,
} from "../domain/interfaces/AttemptRepositoryInterface";
import { AnswerRehydrationRule } from "../domain/rules/AnswerRehydrationRule";

export class AttemptRepository implements AttemptRepositoryInterface {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  private mapToEntity(record: {
    id: string;
    moodleAttemptId: number | null;
    examId: string;
    userId: string;
    status: AttemptStatus;
    startedAt: Date;
    finishedAt: Date | null;
    extraTimeSeconds: number;
    strikeCount: number;
    deviceHash: string;
    ipAddress: string;
    questionOrder: unknown;
    answersJson: unknown;
    syncVersion: number;
    finalScore: number | null;
    syncedToMoodle: boolean;
    lastHeartbeatAt: Date;
    createdAt: Date;
    updatedAt: Date;
    exam?: { maxStrikes: number };
  }): AttemptSessionEntity {
    const rawAnswers =
      (record.answersJson as Record<string, AnswerItemDTO>) || {};
    const answersMap = new Map<number, AnswerRecordEntity>();

    for (const [qidStr, dto] of Object.entries(rawAnswers)) {
      const qid = Number.parseInt(qidStr, 10);
      answersMap.set(
        qid,
        new AnswerRecordEntity({
          questionId: dto.questionId ?? qid,
          answer: dto.ans,
          flagged: dto.flag ?? false,
          updatedAt: dto.ts ?? Date.now(),
        }),
      );
    }

    const questionOrder = Array.isArray(record.questionOrder)
      ? (record.questionOrder as number[])
      : [];

    return new AttemptSessionEntity({
      id: record.id,
      moodleAttemptId: record.moodleAttemptId,
      examId: record.examId,
      userId: record.userId,
      status: record.status,
      startedAt: record.startedAt,
      finishedAt: record.finishedAt,
      extraTimeSeconds: record.extraTimeSeconds,
      strikeCount: record.strikeCount,
      maxStrikes: record.exam?.maxStrikes ?? 3,
      deviceHash: record.deviceHash,
      ipAddress: record.ipAddress,
      questionOrder,
      answers: answersMap,
      syncVersion: record.syncVersion,
      finalScore: record.finalScore,
      syncedToMoodle: record.syncedToMoodle,
      lastHeartbeatAt: record.lastHeartbeatAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public async findById(id: string): Promise<AttemptSessionEntity | null> {
    const record = await this.db.attempt.findUnique({
      where: { id },
      include: { exam: { select: { maxStrikes: true } } },
    });
    return record ? this.mapToEntity(record) : null;
  }

  public async findByExamAndUser(
    examId: string,
    userId: string,
  ): Promise<AttemptSessionEntity | null> {
    const record = await this.db.attempt.findUnique({
      where: { examId_userId: { examId, userId } },
      include: { exam: { select: { maxStrikes: true } } },
    });
    return record ? this.mapToEntity(record) : null;
  }

  public async findAll(): Promise<AttemptSessionEntity[]> {
    const records = await this.db.attempt.findMany({
      include: { exam: { select: { maxStrikes: true } } },
      orderBy: { startedAt: "desc" },
    });
    return records.map((r: Parameters<typeof this.mapToEntity>[0]) =>
      this.mapToEntity(r),
    );
  }

  public async save(
    entity: AttemptSessionEntity,
  ): Promise<AttemptSessionEntity> {
    const rawAnswers: Record<string, AnswerItemDTO> = {};
    for (const [qid, rec] of entity.answers.entries()) {
      rawAnswers[String(qid)] = rec.toDTO();
    }

    const prismaAnswers = rawAnswers as unknown as Prisma.InputJsonValue;
    const prismaOrder =
      entity.questionOrder as unknown as Prisma.InputJsonValue;

    const saved = await this.db.attempt.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        moodleAttemptId: entity.moodleAttemptId,
        examId: entity.examId,
        userId: entity.userId,
        status: entity.status,
        startedAt: entity.startedAt,
        finishedAt: entity.finishedAt,
        extraTimeSeconds: entity.extraTimeSeconds,
        strikeCount: entity.strikeCount,
        deviceHash: entity.deviceHash,
        ipAddress: entity.ipAddress,
        questionOrder: prismaOrder,
        answersJson: prismaAnswers,
        syncVersion: entity.syncVersion,
        finalScore: entity.finalScore,
        syncedToMoodle: entity.syncedToMoodle,
        lastHeartbeatAt: entity.lastHeartbeatAt,
      },
      update: {
        status: entity.status,
        finishedAt: entity.finishedAt,
        extraTimeSeconds: entity.extraTimeSeconds,
        strikeCount: entity.strikeCount,
        answersJson: prismaAnswers,
        syncVersion: entity.syncVersion,
        finalScore: entity.finalScore,
        syncedToMoodle: entity.syncedToMoodle,
        lastHeartbeatAt: entity.lastHeartbeatAt,
      },
      include: { exam: { select: { maxStrikes: true } } },
    });

    return this.mapToEntity(saved);
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.db.attempt.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  public async syncBatchAnswers(
    attemptId: string,
    incomingAnswers: AnswerRecordEntity[],
    expectedSyncVersion: number,
  ): Promise<BatchSyncResult> {
    const current = await this.findById(attemptId);
    if (!current) {
      throw new Error(`Attempt with id '${attemptId}' not found`);
    }

    // Apply Last-Write-Wins rehydration rule
    const rehydration = AnswerRehydrationRule.rehydrate(
      current.answers,
      incomingAnswers,
    );

    const rawAnswers: Record<string, AnswerItemDTO> = {};
    for (const [qid, rec] of rehydration.mergedAnswers.entries()) {
      rawAnswers[String(qid)] = rec.toDTO();
    }

    const nextSyncVersion =
      Math.max(current.syncVersion, expectedSyncVersion) + 1;
    const now = new Date();

    const updated = await this.db.attempt.update({
      where: { id: attemptId },
      data: {
        answersJson: rawAnswers as unknown as Prisma.InputJsonValue,
        syncVersion: nextSyncVersion,
        lastHeartbeatAt: now,
      },
      select: {
        status: true,
        syncVersion: true,
      },
    });

    return {
      success: true,
      syncVersion: updated.syncVersion,
      currentStatus: updated.status,
      syncedCount: rehydration.updatedCount,
    };
  }

  public async recordViolation(
    attemptId: string,
    violation: SecurityStrikeEntity,
    newStrikeCount: number,
    shouldLock: boolean,
  ): Promise<void> {
    await this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.violationLog.create({
        data: {
          attemptId,
          eventType: violation.eventType,
          details: (violation.details ??
            {}) as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          strikeCount: newStrikeCount,
          ...(shouldLock ? { status: "LOCKED" as AttemptStatus } : {}),
        },
      });
    });
  }

  public async submitAttempt(
    attemptId: string,
    finalScore: number,
    finishedAt: Date,
  ): Promise<void> {
    await this.db.attempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        finalScore,
        finishedAt,
      },
    });
  }
}
