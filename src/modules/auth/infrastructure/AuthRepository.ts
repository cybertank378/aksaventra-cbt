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

  public async validateMoodleLaunchToken(launchToken: string): Promise<{
    moodleUserId: number;
    username: string;
    fullName: string;
    cbtId: number;
  } | null> {
    const moodleBaseUrl =
      process.env.NEXT_PUBLIC_MOODLE_URL || "http://127.0.0.1:8080";

    try {
      const res = await fetch(
        `${moodleBaseUrl}/mod/cbt/validate_launch.php?launch_token=${encodeURIComponent(
          launchToken,
        )}`,
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.valid && data.userid) {
          return {
            moodleUserId: Number(data.userid),
            username: data.username,
            fullName: data.fullname || data.username,
            cbtId: Number(data.cbtid),
          };
        }
      }
    } catch {
      // Fallback
    }

    return null;
  }

  public async verifyMoodleCredentials(
    username: string,
    password: string,
  ): Promise<{
    token?: string;
    moodleUserId: number;
    username: string;
    fullName: string;
    role: UserRole;
  } | null> {
    const moodleBaseUrl =
      process.env.NEXT_PUBLIC_MOODLE_URL || "http://127.0.0.1:8080";

    try {
      const res = await fetch(`${moodleBaseUrl}/login/token.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
          service: "mod_cbt_service",
        }).toString(),
      });

      if (res.ok) {
        const data = await res.json();

        // 1. Success: Web service token issued (Admin or permitted role)
        if (data?.token && !data.error) {
          const wstoken = data.token as string;
          const siteInfoRes = await fetch(
            `${moodleBaseUrl}/webservice/rest/server.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                wstoken,
                wsfunction: "core_webservice_get_site_info",
                moodlewsrestformat: "json",
              }).toString(),
            },
          );

          if (siteInfoRes.ok) {
            const siteInfo = await siteInfoRes.json();
            if (siteInfo && !siteInfo.errorcode && siteInfo.userid) {
              const role: UserRole = siteInfo.userissiteadmin
                ? "ADMIN"
                : "STUDENT";

              return {
                token: wstoken,
                moodleUserId: Number(siteInfo.userid),
                username: siteInfo.username,
                fullName: siteInfo.fullname || siteInfo.username,
                role,
              };
            }
          }
        }

        // 2. Student password is valid, but Moodle restricts web service token generation
        if (data?.errorcode === "cannotcreatetoken") {
          try {
            const moodleUsers = (await this.db.$queryRawUnsafe(
              "SELECT id, username, firstname, lastname FROM moodle.mdl_user WHERE username = ? AND deleted = 0 LIMIT 1",
              username,
            )) as Array<{
              id: bigint | number;
              username: string;
              firstname: string;
              lastname: string;
            }>;

            if (moodleUsers && moodleUsers.length > 0) {
              const mu = moodleUsers[0];
              const fullName =
                `${mu.firstname || ""} ${mu.lastname || ""}`.trim() ||
                mu.username;
              return {
                moodleUserId: Number(mu.id),
                username: mu.username,
                fullName,
                role: "STUDENT",
              };
            }
          } catch {
            // Database query fallback error
          }
        }

        // 3. Invalid credentials
        if (data?.errorcode === "invalidlogin") {
          return null;
        }
      }
    } catch {
      // Moodle unreachable
    }

    return null;
  }

  public async syncMoodleUser(params: {
    moodleUserId: number;
    username: string;
    fullName: string;
    role?: UserRole;
  }): Promise<UserSessionEntity> {
    const role = params.role || "STUDENT";
    const synced = await this.db.user.upsert({
      where: { username: params.username },
      create: {
        username: params.username,
        fullName: params.fullName,
        role,
        passwordHash: "",
        moodleUserId: params.moodleUserId,
        isActive: true,
      },
      update: {
        fullName: params.fullName,
        role: params.role ? role : undefined,
        moodleUserId: params.moodleUserId,
        isActive: true,
      },
    });

    return new UserSessionEntity({
      id: synced.id,
      username: synced.username,
      fullName: synced.fullName,
      role: synced.role as UserRole,
      className: synced.className,
      roomCode: synced.roomCode,
      isActive: synced.isActive,
      createdAt: synced.createdAt,
      updatedAt: synced.updatedAt,
    });
  }

  public async ensureExamExistsForMoodleCbt(
    moodleCbtId: number,
  ): Promise<ExamTokenInfo> {
    const existing = await this.findExamByMoodleCbtId(moodleCbtId);
    if (existing) {
      return existing;
    }

    let title = `Ujian CBT Moodle #${moodleCbtId}`;
    let duration = 60;
    let activeToken = "CBT123";

    try {
      const moodleCbt = (await this.db.$queryRawUnsafe(
        "SELECT id, name, timelimit, active_token FROM moodle.mdl_cbt WHERE id = ? LIMIT 1",
        moodleCbtId,
      )) as Array<{
        id: bigint | number;
        name: string;
        timelimit: number;
        active_token: string | null;
      }>;

      if (moodleCbt && moodleCbt.length > 0) {
        const c = moodleCbt[0];
        if (c.name) title = c.name;
        if (c.timelimit && Number(c.timelimit) > 0) {
          duration = Math.floor(Number(c.timelimit) / 60) || 60;
        }
        if (c.active_token) activeToken = c.active_token;
      }
    } catch {
      // Fallback defaults
    }

    const created = await this.db.exam.create({
      data: {
        title,
        moodleCbtId,
        courseName: "Moodle Integrated Course",
        durationSeconds: duration * 60,
        activeToken,
        tokenExpiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        questionsJson: [],
        answerKeysJson: {},
        timeOpen: new Date(),
        timeClose: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      select: {
        id: true,
        activeToken: true,
        tokenExpiresAt: true,
        moodleCbtId: true,
      },
    });

    return {
      id: created.id,
      activeToken: created.activeToken,
      tokenExpiresAt: created.tokenExpiresAt,
      moodleCbtId: created.moodleCbtId,
    };
  }
}
