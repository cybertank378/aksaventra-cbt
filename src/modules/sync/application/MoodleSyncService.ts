import type { Prisma, PrismaClient } from "@prisma/client";
import { callMoodleApi as defaultCallMoodleApi } from "@/libs/moodleClient";
import { prisma as defaultPrisma } from "@/libs/prisma";
import type {
  MoodlePullPayload,
  MoodleWebhookPayload,
  OutboundSyncResult,
  SyncCounts,
  SyncResult,
} from "../domain/dto/SyncDTO";

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

function emptyCounts(): SyncCounts {
  return {
    courses: 0,
    classes: 0,
    students: 0,
    exams: 0,
    questions: 0,
  };
}

export class MoodleSyncService {
  constructor(
    private readonly db: PrismaClient = defaultPrisma,
    private readonly callMoodle: MoodleApiCaller = defaultCallMoodleApi,
  ) {}

  private async pullPayload(action: string): Promise<MoodlePullPayload> {
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

  public async syncCoursesFromMoodle(): Promise<number> {
    const payload = await this.pullPayload("pull_courses");
    return await this.upsertCourses(payload.courses ?? []);
  }

  public async syncClassesFromMoodle(): Promise<number> {
    const payload = await this.pullPayload("pull_classes");
    return await this.upsertClasses(payload.classes ?? []);
  }

  public async syncStudentsFromMoodle(): Promise<number> {
    const payload = await this.pullPayload("pull_students");
    return await this.upsertStudents(payload.students ?? []);
  }

  public async syncExamsFromMoodle(): Promise<number> {
    const payload = await this.pullPayload("pull_exams");
    return await this.upsertExams(payload.exams ?? []);
  }

  public async syncQuestionsFromMoodle(): Promise<number> {
    const payload = await this.pullPayload("pull_questions");
    return await this.upsertQuestions(payload.questions ?? []);
  }

  public async pullAllFromMoodle(): Promise<SyncResult> {
    const counts = emptyCounts();
    const errors: string[] = [];

    try {
      const payload = await this.pullPayload("pull_all");

      counts.courses = await this.upsertCourses(payload.courses ?? []);
      counts.classes = await this.upsertClasses(payload.classes ?? []);
      counts.students = await this.upsertStudents(payload.students ?? []);
      counts.exams = await this.upsertExams(payload.exams ?? []);
      counts.questions = await this.upsertQuestions(payload.questions ?? []);
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : "Failed to pull master data from Moodle",
      );
    }

    return {
      success: errors.length === 0,
      counts,
      syncedAt: new Date().toISOString(),
      errors,
    };
  }

  public async handleWebhookEvent(
    event: MoodleWebhookPayload,
  ): Promise<SyncResult> {
    const counts = emptyCounts();
    const errors: string[] = [];

    try {
      if (event.action === "deleted" && event.objectId > 0) {
        await this.handleDeletedEntity(event.entity, event.objectId);
        return {
          success: true,
          counts,
          syncedAt: new Date().toISOString(),
          errors,
        };
      }

      switch (event.entity) {
        case "course":
          counts.courses = await this.syncCoursesFromMoodle();
          break;
        case "cohort":
          counts.classes = await this.syncClassesFromMoodle();
          break;
        case "cohort_member":
          counts.classes = await this.syncClassesFromMoodle();
          counts.students = await this.syncStudentsFromMoodle();
          break;
        case "user":
          counts.students = await this.syncStudentsFromMoodle();
          break;
        case "cbt":
          counts.exams = await this.syncExamsFromMoodle();
          break;
        case "question":
          counts.questions = await this.syncQuestionsFromMoodle();
          break;
        case "all":
        default:
          return await this.pullAllFromMoodle();
      }
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : "Webhook sync processing failed",
      );
    }

    return {
      success: errors.length === 0,
      counts,
      syncedAt: new Date().toISOString(),
      errors,
    };
  }

  private async handleDeletedEntity(
    entity: MoodleWebhookPayload["entity"],
    objectId: number,
  ): Promise<void> {
    switch (entity) {
      case "course":
        await this.db.subject.deleteMany({
          where: { moodleCourseId: objectId },
        });
        break;
      case "cohort":
        await this.db.classGroup.deleteMany({
          where: { moodleId: objectId },
        });
        break;
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

  private async upsertCourses(
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

  private async upsertClasses(
    classes: NonNullable<MoodlePullPayload["classes"]>,
  ): Promise<number> {
    let count = 0;
    for (const cls of classes) {
      const name = cls.name?.trim();
      if (!name) continue;

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
            description: cls.description ?? existing.description,
          },
        });
      } else {
        await this.db.classGroup.create({
          data: {
            moodleId: cls.id,
            name,
            code: cls.code || null,
            description: cls.description || null,
          },
        });
      }
      count++;
    }
    return count;
  }

  private async upsertStudents(
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
            ...(classGroupId ? { classGroupId } : {}),
            ...(className ? { className } : {}),
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

  private async upsertExams(
    exams: NonNullable<MoodlePullPayload["exams"]>,
  ): Promise<number> {
    let count = 0;
    for (const e of exams) {
      if (!e.id || !e.title) continue;

      const timeOpen = new Date((e.time_open || Math.floor(Date.now() / 1000)) * 1000);
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

  private async upsertQuestions(
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

  // ==================== OUTBOUND SYNC (Next.js -> Moodle) ====================

  public async pushClassToMoodle(input: {
    id: string;
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
        error: err instanceof Error ? err.message : "Failed to push class to Moodle",
      };
    }
  }

  public async pushStudentToMoodle(input: {
    id: string;
    username: string;
    fullName: string;
    password?: string;
    classGroupId?: string | null;
  }): Promise<OutboundSyncResult> {
    try {
      let moodleClassId = 0;
      if (input.classGroupId) {
        const cls = await this.db.classGroup.findUnique({
          where: { id: input.classGroupId },
          select: { moodleId: true },
        });
        moodleClassId = cls?.moodleId ?? 0;
      }

      const parts = input.fullName.trim().split(/\s+/);
      const firstname = parts[0] || input.username;
      const lastname = parts.slice(1).join(" ") || "-";

      const res = await this.callMoodle<MoodleManageGroupsResponse>(
        "mod_cbt_manage_groups",
        {
          action: "create_student",
          payload: JSON.stringify({
            username: input.username,
            firstname,
            lastname,
            password: input.password || "",
            class_id: moodleClassId,
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
        error: err instanceof Error ? err.message : "Failed to push student to Moodle",
      };
    }
  }

  public async pushSubjectToMoodle(input: {
    id: string;
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
        error: err instanceof Error ? err.message : "Failed to push subject to Moodle",
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
            id: input.moodleCbtId && input.moodleCbtId > 0 ? input.moodleCbtId : 0,
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
        error: err instanceof Error ? err.message : "Failed to push exam to Moodle",
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
        error: err instanceof Error ? err.message : "Failed to push question to Moodle",
      };
    }
  }
}

export const moodleSyncService = new MoodleSyncService();
