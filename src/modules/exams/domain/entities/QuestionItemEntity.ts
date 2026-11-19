import type {
  QuestionItemDTO,
  QuestionOptionDTO,
} from "../dto/ExamSnapshotDTO";

export class QuestionItemEntity {
  public readonly slot: number;
  public readonly questionId: number;
  public readonly type: string;
  public readonly stemHtml: string;
  public readonly options: QuestionOptionDTO[];
  public readonly points?: number;
  public readonly maxScore?: number;
  public readonly tolerance?: number | null;

  constructor(params: {
    slot: number;
    questionId: number;
    type: string;
    stemHtml: string;
    options?: QuestionOptionDTO[];
    points?: number;
    maxScore?: number;
    tolerance?: number | null;
  }) {
    this.slot = params.slot;
    this.questionId = params.questionId;
    this.type = params.type;
    this.stemHtml = params.stemHtml;
    this.options = params.options ?? [];
    this.points = params.points;
    this.maxScore = params.maxScore;
    this.tolerance = params.tolerance;
  }

  public toDTO(): QuestionItemDTO {
    return {
      slot: this.slot,
      questionId: this.questionId,
      type: this.type,
      stemHtml: this.stemHtml,
      options: this.options.map((opt) => ({
        key: opt.key,
        html: opt.html,
      })),
      ...(this.points !== undefined ? { points: this.points } : {}),
      ...(this.maxScore !== undefined ? { maxScore: this.maxScore } : {}),
      ...(this.tolerance !== undefined ? { tolerance: this.tolerance } : {}),
    };
  }
}
