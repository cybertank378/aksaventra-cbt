import type { Prisma, PrismaClient } from "@prisma/client";
import { callMoodleApi as defaultCallMoodleApi } from "@/libs/moodleClient";
import { prisma as defaultPrisma } from "@/libs/prisma";
import type {
  MoodlePullPayload,
  OutboundSyncResult,
  SyncEntityType,
} from "../domain/dto/SyncDTO";
import type { SyncRepositoryInterface } from "../domain/interfaces/SyncRepositoryInterface";

export type MoodleApiCaller = <T = unknown>(
  wsfunction: string,
  params?: Record<string, unknown>,
  customToken?: string,
) => Promise<T>;

interface MoodleSyncMasterResponse {
  success: boolean;
  message: string;
  record_id?: number;
  data_json: string;
}

interface MoodleManageGroupsResponse {
  success: boolean;
  message: string;
  record_id?: number;
}

interface MoodleManageScheduleResponse {
  success: boolean;
  message: string;
  cbt_id?: number;
}

const VALID_QUESTION_TYPES = new Set([
  "multichoice",
  "mcma",
  "truefalse",
  "shortanswer",
  "numerical",
  "matching",
  "cloze",
  "essay",
]);

function normalizeQuestionType(rawType: string): string {
  const lower = rawType.toLowerCase().trim();
  if (VALID_QUESTION_TYPES.has(lower)) {
    return lower;
  }
  return "multichoice";
}

export class SyncRepository implements SyncRepositoryInterface {
  constructor(
    private readonly db: PrismaClient = defaultPrisma,
    private readonly callMoodle: MoodleApiCaller = defaultCallMoodleApi,
  ) {}

  public async pullFromMoodle(action: string): Promise<MoodlePullPayload> {
    const res = await this.callMoodle<MoodleSyncMasterResponse>(
      "mod_cbt_sync_master",
      {
        action,
        payload: "{}",
      },
    );

    if (!res?.data_json) {
      return {};
    }

    return JSON.parse(res.data_json) as MoodlePullPayload;
  }

  public async deleteEntity(
    entity: SyncEntityType,
    objectId: number,
  ): Promise<void> {
    switch (entity) {
      case "course":
        await this.db.subject.deleteMany({
          where: { moodleCourseId: objectId },
        });
        break;
      case "cohort": {
        const targets = await this.db.classGroup.findMany({
          where: { moodleId: objectId },
          select: { id: true },
        });
        if (targets.length > 0) {
          await this.db.user.updateMany({
            where: { classGroupId: { in: targets.map((t) => t.id) } },
            data: { classGroupId: null, className: null },
          });
        }
        await this.db.classGroup.deleteMany({
          where: { moodleId: objectId },
        });
        break;
      }
      case "user":
        await this.db.user.updateMany({
          where: { moodleUserId: objectId },
          data: { isActive: false },
        });
        break;
      case "cbt":
        await this.db.exam.deleteMany({
          where: { moodleCbtId: objectId },
        });
        break;
      case "question":
        await this.db.question.deleteMany({
          where: { moodleQuestionId: objectId },
        });
        break;
      default:
        break;
    }
  }

  public async upsertCourses(
    courses: NonNullable<MoodlePullPayload["courses"]>,
  ): Promise<number> {
    let count = 0;
    for (const c of courses) {
      const name = c.name?.trim();
      if (!name) continue;

      const existing = await this.db.subject.findFirst({
        where: {
          OR: [{ moodleCourseId: c.id }, { name }],
        },
      });

      if (existing) {
        await this.db.subject.update({
          where: { id: existing.id },
          data: {
            moodleCourseId: c.id,
            name,
            shortName: c.short_name || existing.shortName,
            description: c.description ?? existing.description,
          },
        });
      } else {
        await this.db.subject.create({
          data: {
            moodleCourseId: c.id,
            name,
            shortName: c.short_name || null,
            description: c.description || null,
          },
        });
      }
      count++;
    }
    return count;
  }

  public async upsertClasses(
    classes: NonNullable<MoodlePullPayload["classes"]>,
  ): Promise<number> {
    let count = 0;
    for (const cls of classes) {
      const name = cls.name?.trim();
      if (!name) continue;
      const cleanDescription =
        typeof cls.description === "string"
          ? cls.description.replace(/<[^>]*>/g, "").trim() || null
          : null;

      const existing = await this.db.classGroup.findFirst({
        where: {
          OR: [{ moodleId: cls.id }, { name }],
        },
      });

      if (existing) {
        await this.db.classGroup.update({
          where: { id: existing.id },
          data: {
            moodleId: cls.id,
            name,
            code: cls.code || existing.code,
            description: cleanDescription ?? existing.description,
          },
        });
        if (existing.name !== name) {
          await this.db.user.updateMany({
            where: { classGroupId: existing.id },
            data: { className: name },
          });
        }
      } else {
        await this.db.classGroup.create({
          data: {
            moodleId: cls.id,
            name,
            code: cls.code || null,
            description: cleanDescription,
          },
        });
      }
      count++;
    }
    return count;
  }

  public async upsertStudents(
    students: NonNullable<MoodlePullPayload["students"]>,
  ): Promise<number> {
    let count = 0;
    for (const s of students) {
      const username = s.username?.trim().toLowerCase();
      if (!username) continue;

      let classGroupId: string | null = null;
      let className: string | null = s.class_name?.trim() || null;

      if (s.class_id && s.class_id > 0) {
        const cls = await this.db.classGroup.findUnique({
          where: { moodleId: s.class_id },
        });
        if (cls) {
          classGroupId = cls.id;
          className = cls.name;
        }
      }

      const existing = await this.db.user.findFirst({
        where: {
          OR: [{ moodleUserId: s.user_id }, { username }],
        },
      });

      if (existing) {
        await this.db.user.update({
          where: { id: existing.id },
          data: {
            moodleUserId: s.user_id,
            fullName: s.full_name?.trim() || existing.fullName,
            classGroupId,
            className,
            isActive: true,
          },
        });
      } else {
        await this.db.user.create({
          data: {
            moodleUserId: s.user_id,
            username,
            fullName: s.full_name?.trim() || username,
            passwordHash: "Siswa123*",
            role: "STUDENT",
            classGroupId,
            className,
            roomCode: "LAB-01",
            isActive: true,
          },
        });
      }
      count++;
    }
    return count;
  }

  public async upsertExams(
    exams: NonNullable<MoodlePullPayload["exams"]>,
  ): Promise<number> {
    let count = 0;
    for (const e of exams) {
      if (!e.id || !e.title) continue;

      const timeOpen = new Date(
        (e.time_open || Math.floor(Date.now() / 1000)) * 1000,
      );
      const timeClose = new Date(
        (e.time_close || Math.floor(Date.now() / 1000) + 86400) * 1000,
      );
      const tokenExpiry = new Date(
        (e.token_expiry || Math.floor(Date.now() / 1000) + 900) * 1000,
      );

      const existing = await this.db.exam.findUnique({
        where: { moodleCbtId: e.id },
      });

      if (existing) {
        await this.db.exam.update({
          where: { id: existing.id },
          data: {
            title: e.title,
            courseName: e.course_name || existing.courseName,
            durationSeconds: e.duration_seconds || existing.durationSeconds,
            maxStrikes: e.max_strikes || existing.maxStrikes,
            activeToken: e.active_token || existing.activeToken,
            tokenExpiresAt: tokenExpiry,
            timeOpen,
            timeClose,
          },
        });
      } else {
        await this.db.exam.create({
          data: {
            moodleCbtId: e.id,
            title: e.title,
            courseName: e.course_name || "Mata Pelajaran",
            durationSeconds: e.duration_seconds || 7200,
            maxStrikes: e.max_strikes || 3,
            sebRequired: false,
            activeToken: e.active_token || "CBT001",
            tokenExpiresAt: tokenExpiry,
            questionsJson: [] as unknown as Prisma.InputJsonValue,
            answerKeysJson: {} as unknown as Prisma.InputJsonValue,
            timeOpen,
            timeClose,
          },
        });
      }
      count++;
    }
    return count;
  }

  public async upsertQuestions(
    questions: NonNullable<MoodlePullPayload["questions"]>,
  ): Promise<number> {
    let count = 0;
    for (const q of questions) {
      const code = q.code?.trim() || `MDL-Q-${q.id}`;
      const type = normalizeQuestionType(q.type || "multichoice");
      const optionsJson = (q.options ?? []) as unknown as Prisma.InputJsonValue;

      const existing = await this.db.question.findFirst({
        where: {
          OR: [{ moodleQuestionId: q.id }, { code }],
        },
      });

      if (existing) {
        await this.db.question.update({
          where: { id: existing.id },
          data: {
            moodleQuestionId: q.id,
            subject: q.subject || existing.subject,
            gradeLevel: q.grade_level || existing.gradeLevel,
            type,
            stem: q.stem || existing.stem,
            points: q.points ?? existing.points,
            optionsJson,
            explanation: q.explanation ?? existing.explanation,
          },
        });
      } else {
        await this.db.question.create({
          data: {
            moodleQuestionId: q.id,
            code,
            subject: q.subject || "Umum",
            gradeLevel: q.grade_level || "X",
            type,
            stem: q.stem || "",
            points: q.points ?? 1,
            optionsJson,
            explanation: q.explanation || null,
          },
        });
      }
      count++;
    }
    return count;
  }

  public async pushClassToMoodle(input: {
    id: string;
    moodleId?: number | null;
    name: string;
    code?: string | null;
    description?: string | null;
  }): Promise<OutboundSyncResult> {
    try {
      const res = await this.callMoodle<MoodleManageGroupsResponse>(
        "mod_cbt_manage_groups",
        {
          action: "create_class",
          payload: JSON.stringify({
            moodle_id: input.moodleId ?? 0,
            name: input.name,
            code: input.code ?? "",
            description: input.description ?? "",
          }),
        },
      );

      if (res?.record_id && res.record_id > 0) {
        await this.db.classGroup.update({
          where: { id: input.id },
          data: { moodleId: res.record_id },
        });
      }

      return { synced: Boolean(res?.success), moodleId: res?.record_id };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error ? err.message : "Failed to push class to Moodle",
      };
    }
  }

  public async pushStudentToMoodle(input: {
    id: string;
    moodleUserId?: number | null;
    username: string;
    fullName: string;
    password?: string;
    classGroupId?: string | null;
    isActive?: boolean;
    replaceCohort?: boolean;
  }): Promise<OutboundSyncResult> {
    try {
      let moodleClassId = 0;
      if (input.classGroupId) {
        const cls = await this.db.classGroup.findUnique({
          where: { id: input.classGroupId },
          select: {
            id: true,
            moodleId: true,
            name: true,
            code: true,
            description: true,
          },
        });
        if (cls) {
          if (cls.moodleId && cls.moodleId > 0) {
            moodleClassId = cls.moodleId;
          } else {
            const pushedClass = await this.pushClassToMoodle({
              id: cls.id,
              name: cls.name,
              code: cls.code,
              description: cls.description,
            });
            moodleClassId = pushedClass.moodleId ?? 0;
          }
        }
      }

      const parts = input.fullName.trim().split(/\s+/);
      const firstname = parts[0] || input.username;
      const lastname = parts.slice(1).join(" ") || "-";

      const res = await this.callMoodle<MoodleManageGroupsResponse>(
        "mod_cbt_manage_groups",
        {
          action: "create_student",
          payload: JSON.stringify({
            moodle_user_id: input.moodleUserId ?? 0,
            username: input.username,
            firstname,
            lastname,
            password: input.password || "",
            class_id: moodleClassId,
            replace_cohort: input.replaceCohort ?? true,
            ...(input.isActive !== undefined
              ? { is_active: input.isActive }
              : {}),
          }),
        },
      );

      if (res?.record_id && res.record_id > 0) {
        await this.db.user.update({
          where: { id: input.id },
          data: { moodleUserId: res.record_id },
        });
      }

      return { synced: Boolean(res?.success), moodleId: res?.record_id };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to push student to Moodle",
      };
    }
  }

  public async pushSubjectToMoodle(input: {
    id: string;
    moodleCourseId?: number | null;
    name: string;
    shortName?: string | null;
    description?: string | null;
  }): Promise<OutboundSyncResult> {
    try {
      const res = await this.callMoodle<MoodleSyncMasterResponse>(
        "mod_cbt_sync_master",
        {
          action: "push_course",
          payload: JSON.stringify({
            moodle_course_id: input.moodleCourseId ?? 0,
            name: input.name,
            short_name: input.shortName ?? "",
            description: input.description ?? "",
          }),
        },
      );

      if (res?.record_id && res.record_id > 0) {
        await this.db.subject.update({
          where: { id: input.id },
          data: { moodleCourseId: res.record_id },
        });
      }

      return { synced: Boolean(res?.success), moodleId: res?.record_id };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to push subject to Moodle",
      };
    }
  }

  public async pushExamToMoodle(input: {
    id: string;
    moodleCbtId?: number;
    title: string;
    courseName?: string;
    durationSeconds: number;
    maxStrikes: number;
    activeToken: string;
    timeOpen: Date;
    timeClose: Date;
  }): Promise<OutboundSyncResult> {
    try {
      let courseId = 1;
      if (input.courseName) {
        const subject = await this.db.subject.findFirst({
          where: { name: input.courseName },
          select: { moodleCourseId: true },
        });
        if (subject?.moodleCourseId) {
          courseId = subject.moodleCourseId;
        }
      }

      const res = await this.callMoodle<MoodleManageScheduleResponse>(
        "mod_cbt_manage_schedule",
        {
          action: "save",
          data: JSON.stringify({
            id:
              input.moodleCbtId && input.moodleCbtId > 0
                ? input.moodleCbtId
                : 0,
            course_id: courseId,
            title: input.title,
            time_open: Math.floor(input.timeOpen.getTime() / 1000),
            time_close: Math.floor(input.timeClose.getTime() / 1000),
            duration_seconds: input.durationSeconds,
            max_strikes: input.maxStrikes,
            active_token: input.activeToken,
          }),
        },
      );

      if (res?.cbt_id && res.cbt_id > 0 && res.cbt_id !== input.moodleCbtId) {
        await this.db.exam.update({
          where: { id: input.id },
          data: { moodleCbtId: res.cbt_id },
        });
      }

      return { synced: Boolean(res?.success), moodleId: res?.cbt_id };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error ? err.message : "Failed to push exam to Moodle",
      };
    }
  }

  public async pushQuestionToMoodle(input: {
    id: string;
    moodleQuestionId?: number | null;
    code: string;
    type: string;
    stem: string;
    points: number;
    explanation?: string | null;
    options: Array<{ text: string; isCorrect?: boolean }>;
  }): Promise<OutboundSyncResult> {
    try {
      const res = await this.callMoodle<MoodleSyncMasterResponse>(
        "mod_cbt_sync_master",
        {
          action: "push_question",
          payload: JSON.stringify({
            moodle_question_id: input.moodleQuestionId ?? 0,
            code: input.code,
            type: input.type,
            stem: input.stem,
            points: input.points,
            explanation: input.explanation ?? "",
            options: input.options,
          }),
        },
      );

      if (res?.record_id && res.record_id > 0) {
        await this.db.question.update({
          where: { id: input.id },
          data: { moodleQuestionId: res.record_id },
        });
      }

      return { synced: Boolean(res?.success), moodleId: res?.record_id };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to push question to Moodle",
      };
    }
  }

  public async findLocalEntityForPush(
    entity: "class" | "student" | "subject" | "exam" | "question",
    id: string,
  ): Promise<OutboundSyncResult> {
    switch (entity) {
      case "class": {
        const cls = await this.db.classGroup.findUnique({ where: { id } });
        if (!cls) return { synced: false, error: "Kelas tidak ditemukan" };
        return await this.pushClassToMoodle(cls);
      }
      case "student": {
        const usr = await this.db.user.findUnique({ where: { id } });
        if (!usr) return { synced: false, error: "Siswa tidak ditemukan" };
        return await this.pushStudentToMoodle(usr);
      }
      case "subject": {
        const sub = await this.db.subject.findUnique({ where: { id } });
        if (!sub) {
          return { synced: false, error: "Mata pelajaran tidak ditemukan" };
        }
        return await this.pushSubjectToMoodle(sub);
      }
      case "exam": {
        const exam = await this.db.exam.findUnique({ where: { id } });
        if (!exam) return { synced: false, error: "Ujian tidak ditemukan" };
        return await this.pushExamToMoodle(exam);
      }
      case "question": {
        const q = await this.db.question.findUnique({ where: { id } });
        if (!q) return { synced: false, error: "Soal tidak ditemukan" };
        const options = Array.isArray(q.optionsJson)
          ? (q.optionsJson as Array<{ text: string; isCorrect?: boolean }>)
          : [];
        return await this.pushQuestionToMoodle({
          id: q.id,
          moodleQuestionId: q.moodleQuestionId,
          code: q.code,
          type: q.type,
          stem: q.stem,
          points: q.points,
          explanation: q.explanation,
          options,
        });
      }
    }
  }

  public async deleteEntityInMoodle(
    entity: "course" | "cohort" | "user" | "cbt" | "question",
    moodleId: number,
  ): Promise<OutboundSyncResult> {
    if (!moodleId || moodleId <= 0) {
      return { synced: false, error: "Invalid Moodle ID" };
    }
    try {
      const res = await this.callMoodle<MoodleSyncMasterResponse>(
        "mod_cbt_sync_master",
        {
          action: "delete_entity",
          payload: JSON.stringify({
            entity,
            moodle_id: moodleId,
          }),
        },
      );
      return { synced: Boolean(res?.success), moodleId };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to delete entity in Moodle",
      };
    }
  }

  public async enrollStudentsInMoodle(input: {
    courseName?: string | null;
    moodleCourseId?: number | null;
    moodleCbtId?: number | null;
    cohortMoodleIds?: number[];
    userMoodleIds?: number[];
    roomCode?: string;
    seatPrefix?: string;
  }): Promise<OutboundSyncResult> {
    try {
      let courseId = input.moodleCourseId ?? 0;
      if (courseId <= 1 && input.courseName) {
        const sub = await this.db.subject
          .findFirst({
            where: { name: input.courseName },
            select: { moodleCourseId: true },
          })
          .catch(() => null);
        if (sub?.moodleCourseId && sub.moodleCourseId > 1) {
          courseId = sub.moodleCourseId;
        }
      }

      const res = await this.callMoodle<MoodleManageGroupsResponse>(
        "mod_cbt_manage_groups",
        {
          action: "enroll_students",
          payload: JSON.stringify({
            course_id: courseId,
            course_name: input.courseName ?? "",
            cbt_id: input.moodleCbtId ?? 0,
            cohort_ids: (input.cohortMoodleIds ?? []).filter((id) => id > 0),
            user_ids: (input.userMoodleIds ?? []).filter((id) => id > 0),
            room_code: input.roomCode ?? "LAB-01",
            seat_prefix: input.seatPrefix ?? "M",
          }),
        },
      );

      return { synced: Boolean(res?.success), moodleId: res?.record_id };
    } catch (err) {
      return {
        synced: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to enroll students in Moodle",
      };
    }
  }

  public async pushPendingLocalToMoodle(): Promise<void> {
    try {
      const pendingSubjects = await this.db.subject.findMany({
        where: { moodleCourseId: null },
        take: 25,
      });
      await Promise.allSettled(
        pendingSubjects.map((sub) => this.pushSubjectToMoodle(sub)),
      );

      const pendingClasses = await this.db.classGroup.findMany({
        where: { moodleId: null },
        take: 25,
      });
      await Promise.allSettled(
        pendingClasses.map((cls) => this.pushClassToMoodle(cls)),
      );

      const pendingStudents = await this.db.user.findMany({
        where: { role: "STUDENT", moodleUserId: null, isActive: true },
        take: 25,
      });
      await Promise.allSettled(
        pendingStudents.map((student) => this.pushStudentToMoodle(student)),
      );

      const pendingQuestions = await this.db.question.findMany({
        where: { moodleQuestionId: null },
        take: 25,
      });
      await Promise.allSettled(
        pendingQuestions.map((q) => {
          const options = Array.isArray(q.optionsJson)
            ? (q.optionsJson as Array<{ text: string; isCorrect?: boolean }>)
            : [];
          return this.pushQuestionToMoodle({
            id: q.id,
            moodleQuestionId: q.moodleQuestionId,
            code: q.code,
            type: q.type,
            stem: q.stem,
            points: q.points,
            explanation: q.explanation,
            options,
          });
        }),
      );
    } catch {
      // Never block inbound pull if outbound pre-push encounters offline Moodle
    }
  }
}
