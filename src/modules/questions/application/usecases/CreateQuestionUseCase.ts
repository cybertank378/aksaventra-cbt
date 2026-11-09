import type {
  CreateQuestionInputDTO,
  QuestionDTO,
} from "../../domain/dto/QuestionDTO";
import type { QuestionsRepositoryInterface } from "../../domain/interfaces/QuestionsRepositoryInterface";

export class CreateQuestionUseCase {
  constructor(private readonly questionsRepo: QuestionsRepositoryInterface) {}

  async execute(input: CreateQuestionInputDTO): Promise<QuestionDTO> {
    const created = await this.questionsRepo.create(input);
    return created.toDTO();
  }
}
