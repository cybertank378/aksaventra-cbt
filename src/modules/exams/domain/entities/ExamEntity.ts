import { BaseEntity } from "@/core/base/BaseEntity";
import type { ExamSnapshotDTO } from "../dto/ExamSnapshotDTO";
import type { QuestionItemEntity } from "./QuestionItemEntity";

export class ExamEntity extends BaseEntity<string> {
  public readonly moodleCbtId: number;
  public readonly title: string;
  public readonly courseName: string;
  public readonly durationSeconds: number;
  public readonly maxStrikes: number;
  public readonly sebRequired: boolean;
  public readonly sebConfigKey?: string | null;
  public readonly activeToken: string;
  public readonly tokenExpiresAt: Date;
  public readonly snapshotHash?: string | null;
  public readonly questions: QuestionItemEntity[];
  public readonly timeOpen: Date;
  public readonly timeClose: Date;

  constructor(params: {
    id: string;
    moodleCbtId: number;
    title: string;
    courseName: string;
    durationSeconds?: number;
    maxStrikes?: number;
    sebRequired?: boolean;
    sebConfigKey?: string | null;
    activeToken: string;
    tokenExpiresAt: Date;
    snapshotHash?: string | null;
    questions?: QuestionItemEntity[];
    timeOpen: Date;
    timeClose: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params.id, params.createdAt, params.updatedAt);
    this.moodleCbtId = params.moodleCbtId;
    this.title = params.title;
    this.courseName = params.courseName;
    this.durationSeconds = params.durationSeconds ?? 7200;
    this.maxStrikes = params.maxStrikes ?? 3;
    this.sebRequired = params.sebRequired ?? false;
    this.sebConfigKey = params.sebConfigKey;
    this.activeToken = params.activeToken;
    this.tokenExpiresAt = params.tokenExpiresAt;
    this.snapshotHash = params.snapshotHash;
    this.questions = params.questions ?? [];
    this.timeOpen = params.timeOpen;
    this.timeClose = params.timeClose;
  }

  /**
   * Checks if exam window is currently open.
   */
  public isWindowOpen(currentDate = new Date()): boolean {
    return currentDate >= this.timeOpen && currentDate <= this.timeClose;
  }

  /**
   * Exports student-safe manifest snapshot DTO.
   * STRICT GUARANTEE: Never exposes answerKeys to client.
   */
  public toClientSnapshotDTO(serverTimestamp?: number): ExamSnapshotDTO {
    const timestampSec = serverTimestamp ?? Math.floor(Date.now() / 1000);

    return {
      examId: this.id,
      moodleCbtId: this.moodleCbtId,
      title: this.title,
      courseName: this.courseName,
      durationSeconds: this.durationSeconds,
      maxStrikes: this.maxStrikes,
      sebRequired: this.sebRequired,
      sebConfigKey: this.sebConfigKey,
      serverTimestamp: timestampSec,
      questions: this.questions.map((q) => q.toDTO()),
      snapshotHash: this.snapshotHash,
    };
  }
}
