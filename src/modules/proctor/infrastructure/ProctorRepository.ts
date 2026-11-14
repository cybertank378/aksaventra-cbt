import type { AttemptStatus, Prisma, ViolationEventType } from "@prisma/client";
import { prisma as defaultPrisma, type PrismaClient } from "@/libs/prisma";
import { ParticipantMonitorEntity } from "../domain/entities/ParticipantMonitorEntity";
import type {
  ProctorExamMeta,
  ProctorRepositoryInterface,
} from "../domain/interfaces/ProctorRepositoryInterface";

export class ProctorRepository implements ProctorRepositoryInterface {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  public async getExamMetadata(
    examId: string,
  ): Promise<ProctorExamMeta | null> {
    const exam = await this.db.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        activeToken: true,
        tokenExpiresAt: true,
        durationSeconds: true,
        maxStrikes: true,
        answerKeysJson: true,
      },
    });

    if (!exam) return null;

    return {
      id: exam.id,
      activeToken: exam.activeToken,
      tokenExpiresAt: exam.tokenExpiresAt,
      durationSeconds: exam.durationSeconds,
      maxStrikes: exam.maxStrikes,
      answerKeysJson: (exam.answerKeysJson as Record<string, string>) || {},
    };
  }

  public async updateExamToken(
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

  public async getRoomParticipants(
    examId: string,
    roomCode?: string,
    status?: AttemptStatus,
  ): Promise<ParticipantMonitorEntity[]> {
    const attempts = await this.db.attempt.findMany({
      where: {
        examId,
        ...(status ? { status } : {}),
        ...(roomCode ? { user: { roomCode } } : {}),
      },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
            className: true,
            roomCode: true,
          },
        },
        exam: {
          select: {
            durationSeconds: true,
            maxStrikes: true,
          },
        },
        violationLogs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { user: { fullName: "asc" } },
    });

    return attempts.map(
      (a: {
        id: string;
        userId: string;
        status: AttemptStatus;
        deviceHash: string;
        ipAddress: string;
        strikeCount: number;
        extraTimeSeconds: number;
        startedAt: Date;
        finishedAt: Date | null;
        lastHeartbeatAt: Date;
        answersJson: unknown;
        questionOrder: unknown;
        user: {
          username: string;
          fullName: string;
          className: string | null;
          roomCode: string | null;
        };
        exam: {
          durationSeconds: number;
          maxStrikes: number;
        };
        violationLogs: Array<{
          id: string;
          eventType: ViolationEventType;
          createdAt: Date;
          details: unknown;
        }>;
      }) => {
        const answers = (a.answersJson as Record<string, unknown>) || {};
        const answeredCount = Object.keys(answers).length;
        const order = Array.isArray(a.questionOrder)
          ? (a.questionOrder as number[])
          : [];
        const totalQuestions = order.length;

        return new ParticipantMonitorEntity({
          attemptId: a.id,
          userId: a.userId,
          username: a.user.username,
          fullName: a.user.fullName,
          className: a.user.className,
          roomCode: a.user.roomCode,
          status: a.status,
          deviceHash: a.deviceHash,
          ipAddress: a.ipAddress,
          answeredCount,
          totalQuestions,
          strikeCount: a.strikeCount,
          maxStrikes: a.exam.maxStrikes,
          durationSeconds: a.exam.durationSeconds,
          extraTimeSeconds: a.extraTimeSeconds,
          startedAt: a.startedAt,
          finishedAt: a.finishedAt,
          lastHeartbeatAt: a.lastHeartbeatAt,
          recentViolations: a.violationLogs.map((v) => ({
            id: v.id,
            eventType: v.eventType,
            createdAt: v.createdAt,
            details: v.details as Record<string, unknown> | null,
          })),
        });
      },
    );
  }

  public async unlockAttempt(
    attemptId: string,
    proctorId?: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      await this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.violationLog.create({
          data: {
            attemptId,
            eventType: "PROCTOR_UNLOCK",
            details: {
              proctorId: proctorId || "proctor",
              reason: reason || "False alarm unlocked by proctor",
              timestamp: new Date().toISOString(),
            } as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.attempt.update({
          where: { id: attemptId },
          data: {
            status: "IN_PROGRESS",
            strikeCount: 0,
          },
        });
      });
      return true;
    } catch {
      return false;
    }
  }

  public async resetDeviceBinding(
    attemptId: string,
    proctorId?: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      await this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.violationLog.create({
          data: {
            attemptId,
            eventType: "PROCTOR_RESET_DEVICE",
            details: {
              proctorId: proctorId || "proctor",
              reason: reason || "Device binding reset by proctor",
              timestamp: new Date().toISOString(),
            } as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.attempt.update({
          where: { id: attemptId },
          data: {
            deviceHash: "RESET_PENDING",
          },
        });
      });
      return true;
    } catch {
      return false;
    }
  }

  public async extendAttemptTime(
    attemptId: string,
    additionalSeconds: number,
    proctorId?: string,
    reason?: string,
  ): Promise<{ extraTimeSeconds: number } | null> {
    try {
      const updated = await this.db.$transaction(
        async (tx: Prisma.TransactionClient) => {
          await tx.violationLog.create({
            data: {
              attemptId,
              eventType: "TIME_EXTEND",
              details: {
                additionalSeconds,
                proctorId: proctorId || "proctor",
                reason: reason || "Extra time granted by proctor",
                timestamp: new Date().toISOString(),
              } as unknown as Prisma.InputJsonValue,
            },
          });

          return await tx.attempt.update({
            where: { id: attemptId },
            data: {
              extraTimeSeconds: { increment: additionalSeconds },
            },
            select: { extraTimeSeconds: true },
          });
        },
      );

      return { extraTimeSeconds: updated.extraTimeSeconds };
    } catch {
      return null;
    }
  }

  public async forceSubmitAttempt(
    attemptId: string,
    _finalScore: number,
    proctorId?: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      await this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        const attempt = await tx.attempt.findUnique({
          where: { id: attemptId },
          include: { exam: { select: { answerKeysJson: true } } },
        });

        if (!attempt) return;

        // Calculate score
        let score = 0;
        const answerKeys =
          (attempt.exam.answerKeysJson as Record<string, string>) || {};
        const studentAnswers =
          (attempt.answersJson as Record<
            string,
            { ans: unknown; flag: boolean }
          >) || {};

        const totalQuestions = Object.keys(answerKeys).length;
        if (totalQuestions > 0) {
          let correctCount = 0;
          for (const [qid, key] of Object.entries(answerKeys)) {
            const student = studentAnswers[qid];
            if (
              student &&
              String(student.ans).trim().toLowerCase() ===
                String(key).trim().toLowerCase()
            ) {
              correctCount++;
            }
          }
          score = Math.round((correctCount / totalQuestions) * 10000) / 100;
        }

        await tx.violationLog.create({
          data: {
            attemptId,
            eventType: "FORCE_SUBMIT",
            details: {
              proctorId: proctorId || "proctor",
              reason: reason || "Forcefully submitted by proctor",
              finalScore: score,
              timestamp: new Date().toISOString(),
            } as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.attempt.update({
          where: { id: attemptId },
          data: {
            status: "SUBMITTED",
            finalScore: score,
            finishedAt: new Date(),
          },
        });
      });
      return true;
    } catch {
      return false;
    }
  }
}
