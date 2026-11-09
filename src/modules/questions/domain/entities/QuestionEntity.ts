import type {
  CBTQuestionType,
  QuestionDTO,
  QuestionOptionDTO,
} from "../dto/QuestionDTO";

export class QuestionEntity {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly subject: string,
    public readonly gradeLevel: string,
    public readonly type: CBTQuestionType,
    public readonly stem: string,
    public readonly points: number,
    public readonly tolerance: number | undefined,
    public readonly options: QuestionOptionDTO[],
    public readonly explanation: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public toDTO(): QuestionDTO {
    return {
      id: this.id,
      code: this.code,
      subject: this.subject,
      gradeLevel: this.gradeLevel,
      type: this.type,
      stem: this.stem,
      points: this.points,
      tolerance: this.tolerance,
      options: this.options,
      explanation: this.explanation,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
