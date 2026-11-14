import { BaseEntity } from "@/core/base/BaseEntity";
import type { AnswerItemDTO, AnswerValue } from "../dto/SyncBatchDTO";

export interface AnswerRecordProps {
  questionId: number;
  answer: AnswerValue;
  flagged: boolean;
  updatedAt: number;
}

export class AnswerRecordEntity extends BaseEntity<number> {
  public readonly questionId: number;
  public readonly answer: AnswerValue;
  public readonly flagged: boolean;
  public readonly timestamp: number;

  constructor(props: AnswerRecordProps) {
    super(props.questionId, undefined, new Date(props.updatedAt));
    this.questionId = props.questionId;
    this.answer = props.answer;
    this.flagged = props.flagged;
    this.timestamp = props.updatedAt;
  }

  get updatedAtMs(): number {
    return this.timestamp;
  }

  public toDTO(): AnswerItemDTO {
    return {
      questionId: this.questionId,
      ans: this.answer,
      flag: this.flagged,
      ts: this.timestamp,
    };
  }

  public static fromDTO(dto: AnswerItemDTO): AnswerRecordEntity {
    return new AnswerRecordEntity({
      questionId: dto.questionId,
      answer: dto.ans,
      flagged: dto.flag,
      updatedAt: dto.ts,
    });
  }
}
