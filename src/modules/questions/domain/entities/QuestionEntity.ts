import type {
  CBTQuestionType,
  CreateQuestionInputDTO,
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
    public readonly imageUrl?: string,
  ) {}

  public update(data: Partial<CreateQuestionInputDTO>): QuestionEntity {
    return new QuestionEntity(
      this.id,
      this.code,
      data.subject ?? this.subject,
      data.gradeLevel ?? this.gradeLevel,
      data.type ?? this.type,
      data.stem ?? this.stem,
      data.points ?? this.points,
      data.tolerance !== undefined ? data.tolerance : this.tolerance,
      data.options ?? this.options,
      data.explanation !== undefined ? data.explanation : this.explanation,
      this.createdAt,
      new Date(),
      data.imageUrl !== undefined ? data.imageUrl : this.imageUrl,
    );
  }

  public toDTO(): QuestionDTO {
    return {
      id: this.id,
      code: this.code,
      subject: this.subject,
      gradeLevel: this.gradeLevel,
      type: this.type,
      stem: this.stem,
      imageUrl: this.imageUrl,
      points: this.points,
      tolerance: this.tolerance,
      options: this.options,
      explanation: this.explanation,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
