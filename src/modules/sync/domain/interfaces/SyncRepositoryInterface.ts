import type {
  MoodlePullPayload,
  OutboundSyncResult,
  SyncEntityType,
} from "../dto/SyncDTO";

export interface SyncRepositoryInterface {
  pullFromMoodle(action: string): Promise<MoodlePullPayload>;
  upsertCourses(
    courses: NonNullable<MoodlePullPayload["courses"]>,
  ): Promise<number>;
  upsertClasses(
    classes: NonNullable<MoodlePullPayload["classes"]>,
  ): Promise<number>;
  upsertStudents(
    students: NonNullable<MoodlePullPayload["students"]>,
  ): Promise<number>;
  upsertExams(exams: NonNullable<MoodlePullPayload["exams"]>): Promise<number>;
  upsertQuestions(
    questions: NonNullable<MoodlePullPayload["questions"]>,
  ): Promise<number>;
  deleteEntity(entity: SyncEntityType, objectId: number): Promise<void>;

  pushClassToMoodle(input: {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
  }): Promise<OutboundSyncResult>;

  pushStudentToMoodle(input: {
    id: string;
    username: string;
    fullName: string;
    password?: string;
    classGroupId?: string | null;
  }): Promise<OutboundSyncResult>;

  pushSubjectToMoodle(input: {
    id: string;
    name: string;
    shortName?: string | null;
    description?: string | null;
  }): Promise<OutboundSyncResult>;

  pushExamToMoodle(input: {
    id: string;
    moodleCbtId?: number;
    title: string;
    courseName?: string;
    durationSeconds: number;
    maxStrikes: number;
    activeToken: string;
    timeOpen: Date;
    timeClose: Date;
  }): Promise<OutboundSyncResult>;

  pushQuestionToMoodle(input: {
    id: string;
    moodleQuestionId?: number | null;
    code: string;
    type: string;
    stem: string;
    points: number;
    explanation?: string | null;
    options: Array<{ text: string; isCorrect?: boolean }>;
  }): Promise<OutboundSyncResult>;

  findLocalEntityForPush(
    entity: "class" | "student" | "subject" | "exam" | "question",
    id: string,
  ): Promise<OutboundSyncResult>;

  pushPendingLocalToMoodle?(): Promise<void>;
}
