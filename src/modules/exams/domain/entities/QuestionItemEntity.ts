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

  constructor(params: {
    slot: number;
    questionId: number;
    type: string;
    stemHtml: string;
    options?: QuestionOptionDTO[];
  }) {
    this.slot = params.slot;
    this.questionId = params.questionId;
    this.type = params.type;
    this.stemHtml = params.stemHtml;
    this.options = params.options ?? [];
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
    };
  }
}
