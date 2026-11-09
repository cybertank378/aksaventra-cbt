import { BaseService } from "@/core/base/BaseService";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  CreateQuestionInputDTO,
  QuestionDTO,
  QuestionsFilterQueryDTO,
} from "../../domain/dto/QuestionDTO";
import type { QuestionsRepositoryInterface } from "../../domain/interfaces/QuestionsRepositoryInterface";
import { CreateQuestionUseCase } from "../usecases/CreateQuestionUseCase";
import { ManageQuestionsUseCase } from "../usecases/ManageQuestionsUseCase";

export class QuestionsService extends BaseService {
  private readonly manageQuestionsUseCase: ManageQuestionsUseCase;
  private readonly createQuestionUseCase: CreateQuestionUseCase;

  constructor(repository: QuestionsRepositoryInterface) {
    super("QuestionsService");
    this.manageQuestionsUseCase = new ManageQuestionsUseCase(repository);
    this.createQuestionUseCase = new CreateQuestionUseCase(repository);
  }

  public async getQuestions(
    filter?: QuestionsFilterQueryDTO,
  ): Promise<Result<QuestionDTO[], AppError>> {
    return this.execute(async () =>
      Result.ok(await this.manageQuestionsUseCase.getQuestions(filter)),
    );
  }

  public async getQuestionById(
    id: string,
  ): Promise<Result<QuestionDTO | null, AppError>> {
    return this.execute(async () =>
      Result.ok(await this.manageQuestionsUseCase.getQuestionById(id)),
    );
  }

  public async createQuestion(
    input: CreateQuestionInputDTO,
  ): Promise<Result<QuestionDTO, AppError>> {
    return this.execute(async () =>
      Result.ok(await this.createQuestionUseCase.execute(input)),
    );
  }

  public async deleteQuestion(id: string): Promise<Result<boolean, AppError>> {
    return this.execute(async () =>
      Result.ok(await this.manageQuestionsUseCase.deleteQuestion(id)),
    );
  }
}
