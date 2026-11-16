import type { PrismaClient } from "@prisma/client";
import { callMoodleApi as defaultCallMoodleApi } from "@/libs/moodleClient";
import { prisma as defaultPrisma } from "@/libs/prisma";
import type {
  MoodleWebhookPayload,
  OutboundSyncResult,
  SyncResult,
} from "../domain/dto/SyncDTO";
import {
  type MoodleApiCaller,
  SyncRepository,
} from "../infrastructure/SyncRepository";
import { HandleMoodleWebhookUseCase } from "./usecases/HandleMoodleWebhookUseCase";
import { PullMoodleMasterDataUseCase } from "./usecases/PullMoodleMasterDataUseCase";
import { PushEntityToMoodleUseCase } from "./usecases/PushEntityToMoodleUseCase";

export type { MoodleApiCaller };

/**
 * Facade delegating bidirectional sync operations to Clean Architecture UseCases & SyncRepository.
 */
export class MoodleSyncService {
  private readonly repository: SyncRepository;
  private readonly pullUseCase: PullMoodleMasterDataUseCase;
  private readonly webhookUseCase: HandleMoodleWebhookUseCase;
  private readonly pushUseCase: PushEntityToMoodleUseCase;

  constructor(
    db: PrismaClient = defaultPrisma,
    callMoodle: MoodleApiCaller = defaultCallMoodleApi,
  ) {
    this.repository = new SyncRepository(db, callMoodle);
    this.pullUseCase = new PullMoodleMasterDataUseCase(this.repository);
    this.webhookUseCase = new HandleMoodleWebhookUseCase(
      this.repository,
      this.pullUseCase,
    );
    this.pushUseCase = new PushEntityToMoodleUseCase(this.repository);
  }

  public async syncCoursesFromMoodle(): Promise<number> {
    const res = await this.pullUseCase.execute({ entity: "course" });
    return res.isSuccess ? res.value.counts.courses : 0;
  }

  public async syncClassesFromMoodle(): Promise<number> {
    const res = await this.pullUseCase.execute({ entity: "cohort" });
    return res.isSuccess ? res.value.counts.classes : 0;
  }

  public async syncStudentsFromMoodle(): Promise<number> {
    const res = await this.pullUseCase.execute({ entity: "user" });
    return res.isSuccess ? res.value.counts.students : 0;
  }

  public async syncExamsFromMoodle(): Promise<number> {
    const res = await this.pullUseCase.execute({ entity: "cbt" });
    return res.isSuccess ? res.value.counts.exams : 0;
  }

  public async syncQuestionsFromMoodle(): Promise<number> {
    const res = await this.pullUseCase.execute({ entity: "question" });
    return res.isSuccess ? res.value.counts.questions : 0;
  }

  public async pullAllFromMoodle(): Promise<SyncResult> {
    const res = await this.pullUseCase.execute({ entity: "all" });
    return res.value;
  }

  public async handleWebhookEvent(
    event: MoodleWebhookPayload,
  ): Promise<SyncResult> {
    const res = await this.webhookUseCase.execute(event);
    return res.value;
  }

  public async pushClassToMoodle(input: {
    id: string;
    moodleId?: number | null;
    name: string;
    code?: string | null;
    description?: string | null;
  }): Promise<OutboundSyncResult> {
    const res = await this.pushUseCase.execute({ type: "class", data: input });
    return res.value;
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
    const res = await this.pushUseCase.execute({
      type: "student",
      data: input,
    });
    return res.value;
  }

  public async pushSubjectToMoodle(input: {
    id: string;
    moodleCourseId?: number | null;
    name: string;
    shortName?: string | null;
    description?: string | null;
  }): Promise<OutboundSyncResult> {
    const res = await this.pushUseCase.execute({
      type: "subject",
      data: input,
    });
    return res.value;
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
    const res = await this.pushUseCase.execute({ type: "exam", data: input });
    return res.value;
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
    const res = await this.pushUseCase.execute({
      type: "question",
      data: input,
    });
    return res.value;
  }

  public async deleteEntityInMoodle(
    entity: "course" | "cohort" | "user" | "cbt" | "question",
    moodleId?: number | null,
  ): Promise<OutboundSyncResult> {
    if (!moodleId || moodleId <= 0) {
      return { synced: false };
    }
    return await this.repository.deleteEntityInMoodle(entity, moodleId);
  }
}

export const moodleSyncService = new MoodleSyncService();
