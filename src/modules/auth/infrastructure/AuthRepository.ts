import argon2 from "argon2";
import { prisma as defaultPrisma, type PrismaClient } from "@/libs/prisma";
import type { UserRole } from "@/security/rbacConfig";
import { UserSessionEntity } from "../domain/entities/UserSessionEntity";
import type {
  ActiveAttemptInfo,
  AuthRepositoryInterface,
  ExamTokenInfo,
} from "../domain/interfaces/AuthRepositoryInterface";

export class AuthRepository implements AuthRepositoryInterface {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  public async findUserByUsername(
    username: string,
  ): Promise<UserSessionEntity | null> {
    const user = await this.db.user.findUnique({
      where: { username },
    });

    if (!user) return null;

    return new UserSessionEntity({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as UserRole,
      className: user.className,
      roomCode: user.roomCode,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  public async findUserById(id: string): Promise<UserSessionEntity | null> {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new UserSessionEntity({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as UserRole,
      className: user.className,
      roomCode: user.roomCode,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  public async findUserByMoodleId(
    moodleUserId: number,
  ): Promise<UserSessionEntity | null> {
    const user = await this.db.user.findUnique({
      where: { moodleUserId },
    });

    if (!user) return null;

    return new UserSessionEntity({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as UserRole,
      className: user.className,
      roomCode: user.roomCode,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  public async verifyUserPassword(
    userId: string,
    plainTextPassword: string,
  ): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) return false;

    try {
      return await argon2.verify(user.passwordHash, plainTextPassword);
    } catch (_err) {
      return false;
    }
  }

  public async findActiveAttempt(
    userId: string,
    examId?: string,
  ): Promise<ActiveAttemptInfo | null> {
    const attempt = await this.db.attempt.findFirst({
      where: {
        userId,
        status: "IN_PROGRESS",
        ...(examId ? { examId } : {}),
      },
      select: {
        id: true,
        examId: true,
        deviceHash: true,
        status: true,
      },
    });

    if (!attempt) return null;

    return {
      id: attempt.id,
      examId: attempt.examId,
      deviceHash: attempt.deviceHash,
      status: attempt.status,
    };
  }

  public async findExamById(examId: string): Promise<ExamTokenInfo | null> {
    const exam = await this.db.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        activeToken: true,
        tokenExpiresAt: true,
        moodleCbtId: true,
      },
    });

    if (!exam) return null;

    return {
      id: exam.id,
      activeToken: exam.activeToken,
      tokenExpiresAt: exam.tokenExpiresAt,
      moodleCbtId: exam.moodleCbtId,
    };
  }

  public async findExamByMoodleCbtId(
    moodleCbtId: number,
  ): Promise<ExamTokenInfo | null> {
    const exam = await this.db.exam.findUnique({
      where: { moodleCbtId },
      select: {
        id: true,
        activeToken: true,
        tokenExpiresAt: true,
        moodleCbtId: true,
      },
    });

    if (!exam) return null;

    return {
      id: exam.id,
      activeToken: exam.activeToken,
      tokenExpiresAt: exam.tokenExpiresAt,
      moodleCbtId: exam.moodleCbtId,
    };
  }

  public async updateAttemptDeviceBinding(
    attemptId: string,
    deviceHash: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.db.attempt.update({
      where: { id: attemptId },
      data: {
        deviceHash,
        ...(ipAddress ? { ipAddress } : {}),
        lastHeartbeatAt: new Date(),
      },
    });
  }

  public async createAttemptIfNotExists(params: {
    examId: string;
    userId: string;
    deviceHash: string;
    ipAddress: string;
  }): Promise<{ id: string }> {
    const existing = await this.db.attempt.findUnique({
      where: {
        examId_userId: {
          examId: params.examId,
          userId: params.userId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return existing;
    }

    const created = await this.db.attempt.create({
      data: {
        examId: params.examId,
        userId: params.userId,
        deviceHash: params.deviceHash,
        ipAddress: params.ipAddress,
        questionOrder: [],
        answersJson: {},
        status: "IN_PROGRESS",
      },
      select: { id: true },
    });

    return created;
  }
}
