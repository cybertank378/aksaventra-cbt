import type { BaseRepository } from "@/core/base/BaseRepository";
import type { ExamEntity } from "../entities/ExamEntity";

export interface ExamRepositoryInterface
  extends BaseRepository<ExamEntity, string> {
  save(
    exam: ExamEntity,
    answerKeysJson?: Record<string, string>,
  ): Promise<ExamEntity>;
  findByMoodleCbtId(moodleCbtId: number): Promise<ExamEntity | null>;
  getAnswerKeys(examId: string): Promise<Record<string, string> | null>;
  updateRoomToken(
    examId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  updateExamMetadata(
    examId: string,
    params: {
      title?: string;
      durationSeconds?: number;
      maxStrikes?: number;
      sebRequired?: boolean;
      sebConfigKey?: string | null;
      timeOpen?: Date;
      timeClose?: Date;
    },
  ): Promise<ExamEntity>;
}
