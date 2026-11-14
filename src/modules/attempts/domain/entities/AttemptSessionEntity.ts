import type { AttemptStatus } from "@prisma/client";
import { BaseEntity } from "@/core/base/BaseEntity";
import type { AnswerRecordEntity } from "./AnswerRecordEntity";

export interface AttemptSessionProps {
  id: string;
  moodleAttemptId?: number | null;
  examId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: Date;
  finishedAt?: Date | null;
  extraTimeSeconds: number;
  strikeCount: number;
  maxStrikes: number;
  deviceHash: string;
  ipAddress: string;
  questionOrder: number[];
  answers: Map<number, AnswerRecordEntity>;
  syncVersion: number;
  finalScore?: number | null;
  syncedToMoodle: boolean;
  lastHeartbeatAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AttemptSessionEntity extends BaseEntity<string> {
  public readonly moodleAttemptId?: number | null;
  public readonly examId: string;
  public readonly userId: string;
  public status: AttemptStatus;
  public readonly startedAt: Date;
  public finishedAt?: Date | null;
  public extraTimeSeconds: number;
  public strikeCount: number;
  public readonly maxStrikes: number;
  public readonly deviceHash: string;
  public readonly ipAddress: string;
  public readonly questionOrder: number[];
  public answers: Map<number, AnswerRecordEntity>;
  public syncVersion: number;
  public finalScore?: number | null;
  public syncedToMoodle: boolean;
  public lastHeartbeatAt: Date;

  constructor(props: AttemptSessionProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.moodleAttemptId = props.moodleAttemptId;
    this.examId = props.examId;
    this.userId = props.userId;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.finishedAt = props.finishedAt;
    this.extraTimeSeconds = props.extraTimeSeconds;
    this.strikeCount = props.strikeCount;
    this.maxStrikes = props.maxStrikes;
    this.deviceHash = props.deviceHash;
    this.ipAddress = props.ipAddress;
    this.questionOrder = props.questionOrder;
    this.answers = props.answers;
    this.syncVersion = props.syncVersion;
    this.finalScore = props.finalScore;
    this.syncedToMoodle = props.syncedToMoodle;
    this.lastHeartbeatAt = props.lastHeartbeatAt;
  }

  public isLocked(): boolean {
    return this.status === "LOCKED";
  }

  public isSubmitted(): boolean {
    return this.status === "SUBMITTED";
  }

  public canBeModified(): boolean {
    return this.status === "IN_PROGRESS";
  }

  public applyExtraTime(seconds: number): void {
    if (seconds <= 0) return;
    this.extraTimeSeconds += seconds;
  }

  public recordStrike(increment = 1): {
    isLocked: boolean;
    strikeCount: number;
  } {
    this.strikeCount += increment;
    if (this.strikeCount >= this.maxStrikes) {
      this.status = "LOCKED";
    }
    return {
      isLocked: this.isLocked(),
      strikeCount: this.strikeCount,
    };
  }

  public lock(): void {
    this.status = "LOCKED";
  }

  public unlock(): void {
    this.status = "IN_PROGRESS";
    this.strikeCount = 0;
  }

  public submit(finalScore: number, finishedAt = new Date()): void {
    this.status = "SUBMITTED";
    this.finalScore = finalScore;
    this.finishedAt = finishedAt;
  }

  public updateAnswer(answer: AnswerRecordEntity): void {
    this.answers.set(answer.questionId, answer);
    this.syncVersion += 1;
    this.lastHeartbeatAt = new Date();
  }

  public touchHeartbeat(): void {
    this.lastHeartbeatAt = new Date();
  }
}
