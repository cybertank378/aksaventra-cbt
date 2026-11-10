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

    if (user) {
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

    // Fallback: Query Moodle database directly if user not yet synced in local DB
    try {
      const moodleUsers = (await this.db.$queryRawUnsafe(
        "SELECT id, username, firstname, lastname, email, auth FROM moodle.mdl_user WHERE username = ? AND deleted = 0 LIMIT 1",
        username,
      )) as Array<{
        id: bigint | number;
        username: string;
        firstname: string;
        lastname: string;
        email: string;
      }>;

      if (moodleUsers && moodleUsers.length > 0) {
        const mu = moodleUsers[0];
        const moodleId = Number(mu.id);
        const fullName =
          `${mu.firstname || ""} ${mu.lastname || ""}`.trim() || mu.username;

        let role: UserRole = "STUDENT";
        try {
          const siteAdmins = (await this.db.$queryRawUnsafe(
            "SELECT value FROM moodle.mdl_config WHERE name = 'siteadmins' LIMIT 1",
          )) as Array<{ value: string }>;
          const adminIds =
            siteAdmins?.[0]?.value?.split(",")?.map((s) => s.trim()) || [];
          if (adminIds.includes(String(moodleId))) {
            role = "ADMIN";
          }
        } catch {
          // Ignore role lookup error
        }

        const syncedUser = await this.db.user.upsert({
          where: { username: mu.username },
          create: {
            username: mu.username,
            fullName,
            role,
            passwordHash: "",
            moodleUserId: moodleId,
            isActive: true,
          },
          update: {
            fullName,
            role,
            moodleUserId: moodleId,
            isActive: true,
          },
        });

        return new UserSessionEntity({
          id: syncedUser.id,
          username: syncedUser.username,
          fullName: syncedUser.fullName,
          role: syncedUser.role as UserRole,
          className: syncedUser.className,
          roomCode: syncedUser.roomCode,
          isActive: syncedUser.isActive,
          createdAt: syncedUser.createdAt,
          updatedAt: syncedUser.updatedAt,
        });
      }
    } catch {
      // Ignore if moodle database is not directly queryable
    }

    return null;
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
      select: { username: true, passwordHash: true, moodleUserId: true },
    });

    if (!user) return false;

    // 1. If user is a Moodle account or has no local password hash, authenticate with Moodle token.php
    if (user.moodleUserId !== null || !user.passwordHash) {
      const moodleBaseUrl =
        process.env.NEXT_PUBLIC_MOODLE_URL || "http://127.0.0.1:8080";
      try {
        const res = await fetch(
          `${moodleBaseUrl}/login/token.php?username=${encodeURIComponent(
            user.username,
          )}&password=${encodeURIComponent(
            plainTextPassword,
          )}&service=mod_cbt_service`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.token && !data.error) {
            return true;
          }
        }
      } catch {
        // Fallback to local hash verify
      }
    }

    // 2. Fallback to argon2 verification for local passwords
    if (user.passwordHash) {
      try {
        return await argon2.verify(user.passwordHash, plainTextPassword);
      } catch (_err) {
        return false;
      }
    }

    return false;
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
