import type { AttemptStatus, ViolationEventType } from "@prisma/client";
import { BaseEntity } from "@/core/base/BaseEntity";
import type { ParticipantMonitorDTO } from "../dto/ProctorActionDTO";

export interface ParticipantViolationInfo {
  id: string;
  eventType: ViolationEventType;
  createdAt: Date;
  details?: Record<string, unknown> | null;
}

export interface ParticipantMonitorProps {
  attemptId: string;
  userId: string;
  username: string;
  fullName: string;
  className?: string | null;
  roomCode?: string | null;
  status: AttemptStatus;
  deviceHash: string;
  ipAddress: string;
  answeredCount: number;
  totalQuestions: number;
  strikeCount: number;
  maxStrikes: number;
  durationSeconds: number;
  extraTimeSeconds: number;
  startedAt: Date;
  finishedAt?: Date | null;
  lastHeartbeatAt: Date;
  recentViolations?: ParticipantViolationInfo[];
}

export class ParticipantMonitorEntity extends BaseEntity<string> {
  public readonly userId: string;
  public readonly username: string;
  public readonly fullName: string;
  public readonly className?: string | null;
  public readonly roomCode?: string | null;
  public status: AttemptStatus;
  public readonly deviceHash: string;
  public readonly ipAddress: string;
  public readonly answeredCount: number;
  public readonly totalQuestions: number;
  public strikeCount: number;
  public readonly maxStrikes: number;
  public readonly durationSeconds: number;
  public extraTimeSeconds: number;
  public readonly startedAt: Date;
  public finishedAt?: Date | null;
  public lastHeartbeatAt: Date;
  public readonly recentViolations: ParticipantViolationInfo[];

  constructor(props: ParticipantMonitorProps) {
    super(props.attemptId, props.startedAt);
    this.userId = props.userId;
    this.username = props.username;
    this.fullName = props.fullName;
    this.className = props.className;
    this.roomCode = props.roomCode;
    this.status = props.status;
    this.deviceHash = props.deviceHash;
    this.ipAddress = props.ipAddress;
    this.answeredCount = props.answeredCount;
    this.totalQuestions = props.totalQuestions;
    this.strikeCount = props.strikeCount;
    this.maxStrikes = props.maxStrikes;
    this.durationSeconds = props.durationSeconds;
    this.extraTimeSeconds = props.extraTimeSeconds;
    this.startedAt = props.startedAt;
    this.finishedAt = props.finishedAt;
    this.lastHeartbeatAt = props.lastHeartbeatAt;
    this.recentViolations = props.recentViolations ?? [];
  }

  get attemptId(): string {
    return this.id;
  }

  public isOnline(now = new Date()): boolean {
    if (this.status === "SUBMITTED" || this.status === "ABANDONED") {
      return false;
    }
    const diffMs = now.getTime() - this.lastHeartbeatAt.getTime();
    return diffMs <= 60_000;
  }

  public calculateRemainingSeconds(now = new Date()): number {
    if (this.status === "SUBMITTED" || this.status === "ABANDONED") {
      return 0;
    }
    const totalAllowedSeconds = this.durationSeconds + this.extraTimeSeconds;
    const elapsedSeconds = Math.floor(
      (now.getTime() - this.startedAt.getTime()) / 1000,
    );
    return Math.max(0, totalAllowedSeconds - elapsedSeconds);
  }

  public calculateProgressPercentage(): number {
    if (this.totalQuestions <= 0) return 0;
    const pct = (this.answeredCount / this.totalQuestions) * 100;
    return Math.min(100, Math.round(pct * 10) / 10);
  }

  public toDTO(now = new Date()): ParticipantMonitorDTO {
    return {
      attemptId: this.attemptId,
      userId: this.userId,
      username: this.username,
      fullName: this.fullName,
      className: this.className,
      roomCode: this.roomCode,
      status: this.status,
      isOnline: this.isOnline(now),
      deviceHash: this.deviceHash,
      ipAddress: this.ipAddress,
      answeredCount: this.answeredCount,
      totalQuestions: this.totalQuestions,
      progressPercentage: this.calculateProgressPercentage(),
      strikeCount: this.strikeCount,
      maxStrikes: this.maxStrikes,
      extraTimeSeconds: this.extraTimeSeconds,
      remainingSeconds: this.calculateRemainingSeconds(now),
      startedAt: this.startedAt.toISOString(),
      finishedAt: this.finishedAt ? this.finishedAt.toISOString() : null,
      lastHeartbeatAt: this.lastHeartbeatAt.toISOString(),
      recentViolations: this.recentViolations.map((v) => ({
        id: v.id,
        eventType: v.eventType,
        createdAt: v.createdAt.toISOString(),
        details: v.details,
      })),
    };
  }
}
