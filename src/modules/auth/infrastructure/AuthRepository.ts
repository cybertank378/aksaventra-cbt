import argon2 from "argon2";
import { callMoodleApi } from "@/libs/moodleClient";
import { verifyStoredPasswordHash } from "@/libs/passwordVerifier";
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

  private async resolveMoodleUserRole(
    moodleUserId: number,
    username: string,
    isSiteAdminHint?: boolean,
  ): Promise<UserRole> {
    if (isSiteAdminHint === true || username.toLowerCase() === "admin") {
      return "ADMIN";
    }

    // 1. Check local CBT database for existing elevated role (ADMIN, TEACHER, PROCTOR)
    let localRole: UserRole | undefined;
    try {
      const existing = await this.db.user.findUnique({
        where: { username },
        select: { role: true },
      });
      if (
        existing?.role === "ADMIN" ||
        existing?.role === "TEACHER" ||
        existing?.role === "PROCTOR"
      ) {
        localRole = existing.role;
      }
    } catch {
      // Ignore local lookup error
    }

    // 2. Check Moodle siteadmins & mdl_role_assignments if Moodle DB is directly queryable
    try {
      const siteAdmins = (await this.db.$queryRaw`
        SELECT value FROM moodle.mdl_config WHERE name = 'siteadmins' LIMIT 1
      `) as Array<{ value: string }>;
      const adminIds =
        siteAdmins?.[0]?.value?.split(",")?.map((s) => s.trim()) || [];
      if (adminIds.includes(String(moodleUserId))) {
        return "ADMIN";
      }

      const roleRows = (await this.db.$queryRaw`
        SELECT r.shortname, ctx.contextlevel
          FROM moodle.mdl_role_assignments ra
          JOIN moodle.mdl_role r ON r.id = ra.roleid
          JOIN moodle.mdl_context ctx ON ctx.id = ra.contextid
         WHERE ra.userid = ${moodleUserId}
      `) as Array<{ shortname: string; contextlevel?: number }>;

      let hasTeacher = false;
      let hasSystemManager = false;
      let hasOtherManager = false;
      let hasProctor = false;
      for (const rr of roleRows ?? []) {
        const short = (rr.shortname || "").trim().toLowerCase();
        const ctxLevel = Number(rr.contextlevel ?? 0);
        if (short === "coursecreator" || short === "editingteacher") {
          hasTeacher = true;
        } else if (short === "manager") {
          if (ctxLevel === 10) {
            hasSystemManager = true;
          } else {
            hasOtherManager = true;
          }
        } else if (short === "teacher") {
          hasProctor = true;
        }
      }
      if (hasTeacher) {
        return "TEACHER";
      }
      if (hasSystemManager) {
        return "ADMIN";
      }
      if (hasOtherManager) {
        return "TEACHER";
      }
      if (hasProctor) {
        return "PROCTOR";
      }
    } catch {
      // Ignore cross-database lookup error
    }

    return localRole ?? "STUDENT";
  }

  public async findUserByUsername(
    username: string,
  ): Promise<UserSessionEntity | null> {
    const trimmed = username.trim();
    let user = await this.db.user.findUnique({
      where: { username: trimmed },
    });
    if (!user && trimmed !== trimmed.toLowerCase()) {
      user = await this.db.user.findUnique({
        where: { username: trimmed.toLowerCase() },
      });
    }

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
      const lowerUsername = trimmed.toLowerCase();
      const moodleUsers = (await this.db.$queryRaw`
        SELECT id, username, firstname, lastname, email, password, auth
          FROM moodle.mdl_user
         WHERE username = ${lowerUsername} AND deleted = 0
         LIMIT 1
      `) as Array<{
        id: bigint | number;
        username: string;
        firstname: string;
        lastname: string;
        email: string;
        password?: string;
      }>;

      if (moodleUsers && moodleUsers.length > 0) {
        const mu = moodleUsers[0];
        const moodleId = Number(mu.id);
        const fullName =
          `${mu.firstname || ""} ${mu.lastname || ""}`.trim() || mu.username;

        const role = await this.resolveMoodleUserRole(moodleId, mu.username);

        const syncedUser = await this.db.user.upsert({
          where: { username: mu.username },
          create: {
            username: mu.username,
            fullName,
            role,
            passwordHash: mu.password || "",
            moodleUserId: moodleId,
            isActive: true,
          },
          update: {
            fullName,
            role,
            ...(mu.password ? { passwordHash: mu.password } : {}),
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

    // 1. Fast local verification first (Argon2id / Argon2i or Moodle synced $6$ SHA-512 crypt)
    if (user.passwordHash) {
      const localCheck = await verifyStoredPasswordHash(
        user.passwordHash,
        plainTextPassword,
      );
      if (localCheck.valid) {
        if (localCheck.needsArgon2Upgrade) {
          try {
            const upgradedHash = await argon2.hash(plainTextPassword);
            await this.db.user.update({
              where: { id: userId },
              data: { passwordHash: upgradedHash },
            });
          } catch {
            // Ignore upgrade failure
          }
        }
        return true;
      }
    }

    // 2. Fallback: If user is a Moodle account or has no valid local password hash, authenticate with Moodle token.php
    if (user.moodleUserId !== null || !user.passwordHash) {
      const moodleBaseUrl = (
        process.env.MOODLE_INTERNAL_URL ||
        process.env.MOODLE_URL ||
        process.env.NEXT_PUBLIC_MOODLE_URL ||
        "http://127.0.0.1:8080"
      ).replace(/\/+$/, "");
      try {
        const res = await fetch(
          `${moodleBaseUrl}/login/token.php?username=${encodeURIComponent(
            user.username,
          )}&password=${encodeURIComponent(
            plainTextPassword,
          )}&service=mod_cbt_service`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; AksaventraCBT/1.0)",
            },
            signal: AbortSignal.timeout(2000),
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (
            (data?.token && !data.error) ||
            data?.errorcode === "cannotcreatetoken" ||
            data?.errorcode === "usernotallowed" ||
            data?.errorcode === "nowsaccess"
          ) {
            try {
              const upgradedHash = await argon2.hash(plainTextPassword);
              await this.db.user.update({
                where: { id: userId },
                data: { passwordHash: upgradedHash },
              });
            } catch {
              // Ignore hash save error
            }
            return true;
          }
        }
      } catch {
        // Fallback failed
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
        if (data?.valid && data.userid) {
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
    // 0a. Ultra-fast local DB verification (< 20ms, zero network latency) when user already has a valid Argon2, $2y$ Bcrypt, or $6$ hash
    if (process.env.NODE_ENV !== "test") {
      try {
        const trimmed = username.trim();
        let localUser = await this.db.user.findUnique({
          where: { username: trimmed },
          select: {
            moodleUserId: true,
            username: true,
            fullName: true,
            role: true,
            passwordHash: true,
            isActive: true,
          },
        });
        if (!localUser && trimmed !== trimmed.toLowerCase()) {
          localUser = await this.db.user.findUnique({
            where: { username: trimmed.toLowerCase() },
            select: {
              moodleUserId: true,
              username: true,
              fullName: true,
              role: true,
              passwordHash: true,
              isActive: true,
            },
          });
        }
        if (localUser?.isActive && localUser.passwordHash) {
          const check = await verifyStoredPasswordHash(
            localUser.passwordHash,
            password,
          );
          if (check.valid) {
            return {
              moodleUserId:
                localUser.moodleUserId ?? (localUser.role === "ADMIN" ? 2 : 0),
              username: localUser.username,
              fullName: localUser.fullName,
              role: localUser.role as UserRole,
            };
          }
        }
      } catch {
        // Proceed to Moodle web service check
      }
    }

    // 0b. Fast & reliable path via mod_cbt_sync_master (works for Site Admins, Teachers, Proctors, and Students!)
    if (process.env.NODE_ENV !== "test") {
      try {
        const wsVerify = await callMoodleApi<{
          success: boolean;
          record_id?: number;
          data_json?: string;
        }>("mod_cbt_sync_master", {
          action: "verify_user_credentials",
          payload: JSON.stringify({ username, password }),
        });

        if (wsVerify?.data_json) {
          const parsed = JSON.parse(wsVerify.data_json) as {
            valid?: boolean;
            user_id?: number;
            username?: string;
            full_name?: string;
            role?: UserRole;
          };
          if (parsed.valid && parsed.user_id) {
            const moodleId = Number(parsed.user_id);
            const resolvedRole =
              parsed.role === "ADMIN" ||
              parsed.role === "TEACHER" ||
              parsed.role === "PROCTOR" ||
              parsed.role === "STUDENT"
                ? parsed.role
                : await this.resolveMoodleUserRole(
                    moodleId,
                    parsed.username || username,
                  );
            return {
              moodleUserId: moodleId,
              username: parsed.username || username,
              fullName: parsed.full_name || username,
              role: resolvedRole,
            };
          }
          if (parsed.valid === false) {
            return null;
          }
        }
      } catch {
        // Fallback to /login/token.php and direct DB check
      }
    }

    const wsEndpointBase = process.env.MOODLE_WS_ENDPOINT
      ? process.env.MOODLE_WS_ENDPOINT.replace(
          /\/webservice\/rest\/server\.php$/,
          "",
        )
      : undefined;

    const configuredUrls = [
      process.env.MOODLE_INTERNAL_URL,
      process.env.MOODLE_URL,
      wsEndpointBase,
      process.env.NEXT_PUBLIC_MOODLE_URL,
    ]
      .filter((u): u is string => Boolean(u))
      .map((u) => u.replace(/\/+$/, ""));

    const candidateUrls = Array.from(
      new Set(
        configuredUrls.length > 0
          ? configuredUrls
          : ["http://127.0.0.1:8080", "http://localhost:8080"],
      ),
    );

    for (const moodleBaseUrl of candidateUrls) {
      try {
        const res = await fetch(`${moodleBaseUrl}/login/token.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (compatible; AksaventraCBT/1.0)",
          },
          body: new URLSearchParams({
            username,
            password,
            service: "mod_cbt_service",
          }).toString(),
          signal: AbortSignal.timeout(2000),
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
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "User-Agent": "Mozilla/5.0 (compatible; AksaventraCBT/1.0)",
                },
                body: new URLSearchParams({
                  wstoken,
                  wsfunction: "core_webservice_get_site_info",
                  moodlewsrestformat: "json",
                }).toString(),
                signal: AbortSignal.timeout(2000),
              },
            );

            if (siteInfoRes.ok) {
              const siteInfo = await siteInfoRes.json();
              if (siteInfo && !siteInfo.errorcode && siteInfo.userid) {
                const moodleId = Number(siteInfo.userid);
                const role = await this.resolveMoodleUserRole(
                  moodleId,
                  siteInfo.username || username,
                  Boolean(siteInfo.userissiteadmin),
                );

                return {
                  token: wstoken,
                  moodleUserId: moodleId,
                  username: siteInfo.username,
                  fullName: siteInfo.fullname || siteInfo.username,
                  role,
                };
              }
            }
          }

          // 2. Password is valid, but Moodle restricts web service token generation (e.g., Site Admin or Student)
          if (
            data?.errorcode === "cannotcreatetoken" ||
            data?.errorcode === "usernotallowed" ||
            data?.errorcode === "nowsaccess"
          ) {
            try {
              const moodleUsers = (await this.db.$queryRaw`
                SELECT id, username, firstname, lastname
                  FROM moodle.mdl_user
                 WHERE username = ${username} AND deleted = 0
                 LIMIT 1
              `) as Array<{
                id: bigint | number;
                username: string;
                firstname: string;
                lastname: string;
              }>;

              if (moodleUsers && moodleUsers.length > 0) {
                const mu = moodleUsers[0];
                const moodleId = Number(mu.id);
                const fullName =
                  `${mu.firstname || ""} ${mu.lastname || ""}`.trim() ||
                  mu.username;

                const resolvedRole = await this.resolveMoodleUserRole(
                  moodleId,
                  mu.username,
                );

                return {
                  moodleUserId: moodleId,
                  username: mu.username,
                  fullName,
                  role: resolvedRole,
                };
              }
            } catch {
              // Database query fallback error
            }

            const localUser = await this.db.user
              .findUnique({
                where: { username },
                select: {
                  moodleUserId: true,
                  username: true,
                  fullName: true,
                  role: true,
                },
              })
              .catch(() => null);

            const isDefaultAdmin = username.toLowerCase() === "admin";
            const resolvedRole =
              (localUser?.role as UserRole | undefined) ??
              (await this.resolveMoodleUserRole(
                localUser?.moodleUserId ?? (isDefaultAdmin ? 2 : 0),
                localUser?.username ?? username,
                isDefaultAdmin,
              ));
            return {
              moodleUserId: localUser?.moodleUserId ?? (isDefaultAdmin ? 2 : 0),
              username: localUser?.username ?? username,
              fullName:
                localUser?.fullName ??
                (isDefaultAdmin ? "Administrator" : username),
              role: resolvedRole,
            };
          }

          // 3. Invalid credentials
          if (data?.errorcode === "invalidlogin") {
            return null;
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    return null;
  }

  public async syncMoodleUser(params: {
    moodleUserId: number;
    username: string;
    fullName: string;
    role?: UserRole;
    rawPassword?: string;
  }): Promise<UserSessionEntity> {
    let role: UserRole = params.role || "STUDENT";
    if (!params.role || params.role === "STUDENT") {
      try {
        const existing = await this.db.user.findUnique({
          where: { username: params.username },
          select: { role: true },
        });
        if (
          existing?.role === "ADMIN" ||
          existing?.role === "TEACHER" ||
          existing?.role === "PROCTOR"
        ) {
          role = existing.role;
        }
      } catch {
        // Ignore lookup error
      }
    }
    let passwordHash: string | undefined;
    if (params.rawPassword) {
      try {
        passwordHash = await argon2.hash(params.rawPassword);
      } catch {
        // ignore hash error
      }
    }

    const synced = await this.db.user.upsert({
      where: { username: params.username },
      create: {
        username: params.username,
        fullName: params.fullName,
        role,
        passwordHash: passwordHash || "",
        moodleUserId: params.moodleUserId,
        isActive: true,
      },
      update: {
        fullName: params.fullName,
        role: params.role ? role : undefined,
        passwordHash: passwordHash || undefined,
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
      const moodleCbt = (await this.db.$queryRaw`
        SELECT id, name, timelimit, active_token
          FROM moodle.mdl_cbt
         WHERE id = ${moodleCbtId}
         LIMIT 1
      `) as Array<{
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
