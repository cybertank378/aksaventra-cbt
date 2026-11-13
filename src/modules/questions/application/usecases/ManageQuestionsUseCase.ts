import type {
  CreateQuestionInputDTO,
  QuestionDTO,
  QuestionsFilterQueryDTO,
} from "../../domain/dto/QuestionDTO";
import type { QuestionsRepositoryInterface } from "../../domain/interfaces/QuestionsRepositoryInterface";
import {
  QuestionBusinessRules,
  QuestionValidationError,
} from "../../domain/rules/QuestionBusinessRules";

export class ManageQuestionsUseCase {
  constructor(private readonly questionsRepo: QuestionsRepositoryInterface) {}

  /**
   * Retrieves questions with domain filtering and newest-first business sorting.
   */
  async getQuestions(filter?: QuestionsFilterQueryDTO): Promise<QuestionDTO[]> {
    const questions = await this.questionsRepo.findMany(filter);
    return questions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((q) => q.toDTO());
  }

  /**
   * Retrieves single question with input integrity validation.
   */
  async getQuestionById(id: string): Promise<QuestionDTO | null> {
    if (!id || id.trim().length === 0) {
      throw new QuestionValidationError("ID butir soal tidak valid.");
    }
    const question = await this.questionsRepo.findById(id.trim());
    return question ? question.toDTO() : null;
  }

  /**
   * Business process for updating an existing question:
   * 1. Verifies question existence
   * 2. Merges updated fields with existing question data
   * 3. Validates business constraints (options, answer key, points)
   * 4. Normalizes updated values
   * 5. Persists and returns updated question DTO
   */
  async updateQuestion(
    id: string,
    data: Partial<CreateQuestionInputDTO>,
  ): Promise<QuestionDTO | null> {
    if (!id || id.trim().length === 0) {
      throw new QuestionValidationError("ID butir soal tidak valid.");
    }

    const existing = await this.questionsRepo.findById(id.trim());
    if (!existing) {
      return null;
    }

    // Merge existing values with partial update
    const mergedInput: CreateQuestionInputDTO = {
      subject: (data.subject ?? existing.subject).trim(),
      gradeLevel: (data.gradeLevel ?? existing.gradeLevel).trim(),
      type: data.type ?? existing.type,
      stem: (data.stem ?? existing.stem).trim(),
      imageUrl:
        data.imageUrl !== undefined
          ? data.imageUrl?.trim() || undefined
          : existing.imageUrl,
      points: Number(data.points ?? existing.points) || 1,
      tolerance:
        (data.type ?? existing.type) === "numerical"
          ? (data.tolerance ?? existing.tolerance)
          : undefined,
      options:
        (data.type ?? existing.type) === "essay"
          ? []
          : (data.options ?? existing.options).map((opt, i) => ({
              ...opt,
              label: opt.label?.trim() || String.fromCharCode(65 + i),
              text: opt.text?.trim() || "",
              isCorrect: Boolean(opt.isCorrect),
            })),
      explanation: (data.explanation ?? existing.explanation)?.trim() || undefined,
    };

    // Enforce business rules on merged result
    QuestionBusinessRules.validate(mergedInput);

    const updated = await this.questionsRepo.update(id.trim(), mergedInput);
    return updated ? updated.toDTO() : null;
  }

  /**
   * Business process for deleting a question:
   * Verifies existence before deletion.
   */
  async deleteQuestion(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new QuestionValidationError("ID butir soal tidak valid.");
    }

    const existing = await this.questionsRepo.findById(id.trim());
    if (!existing) {
      return false;
    }

    return await this.questionsRepo.delete(id.trim());
  }
}

