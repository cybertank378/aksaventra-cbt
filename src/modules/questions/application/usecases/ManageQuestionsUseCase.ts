import type {
  QuestionDTO,
  QuestionsFilterQueryDTO,
} from "../../domain/dto/QuestionDTO";
import type { QuestionsRepositoryInterface } from "../../domain/interfaces/QuestionsRepositoryInterface";

export class ManageQuestionsUseCase {
  constructor(private readonly questionsRepo: QuestionsRepositoryInterface) {}

  async getQuestions(filter?: QuestionsFilterQueryDTO): Promise<QuestionDTO[]> {
    const questions = await this.questionsRepo.findMany(filter);
    return questions.map((q) => q.toDTO());
  }

  async getQuestionById(id: string): Promise<QuestionDTO | null> {
    const question = await this.questionsRepo.findById(id);
    return question ? question.toDTO() : null;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return await this.questionsRepo.delete(id);
  }
}
