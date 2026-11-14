import type {
  CreateQuestionInputDTO,
  QuestionDTO,
} from "../../domain/dto/QuestionDTO";
import type { QuestionsRepositoryInterface } from "../../domain/interfaces/QuestionsRepositoryInterface";
import { QuestionBusinessRules } from "../../domain/rules/QuestionBusinessRules";

export class CreateQuestionUseCase {
  constructor(private readonly questionsRepo: QuestionsRepositoryInterface) {}

  /**
   * Executes the business process of creating a new CBT question item.
   * Enforces answer key validity, point constraints, stem sanitization,
   * and option structure before storing in the repository.
   */
  async execute(input: CreateQuestionInputDTO): Promise<QuestionDTO> {
    // 1. Domain Business Rule Validation
    QuestionBusinessRules.validate(input);

    // 2. Data Normalization Business Process
    const normalizedOptions = (input.options || [])
      .map((opt, index) => ({
        ...opt,
        label: opt.label?.trim() || String.fromCharCode(65 + index),
        text: opt.text?.trim() || "",
        isCorrect: Boolean(opt.isCorrect),
      }))
      .filter((opt) => opt.text.length > 0);

    const normalizedInput: CreateQuestionInputDTO = {
      subject: input.subject.trim(),
      gradeLevel: input.gradeLevel.trim(),
      type: input.type,
      stem: input.stem.trim(),
      imageUrl: input.imageUrl?.trim() || undefined,
      points: Number(input.points) || 1,
      tolerance:
        input.type === "numerical" && input.tolerance !== undefined
          ? Number(input.tolerance)
          : undefined,
      options: input.type === "essay" ? [] : normalizedOptions,
      explanation: input.explanation?.trim() || undefined,
    };

    // 3. Persist through Repository
    const created = await this.questionsRepo.create(normalizedInput);
    return created.toDTO();
  }
}

