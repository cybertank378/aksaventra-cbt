import { BaseService } from "@/core/base/BaseService";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  ExamCardItemDTO,
  ExamCardsQueryDTO,
} from "../../domain/dto/ExamCardDTO";
import { GenerateExamCardsUseCase } from "../usecases/GenerateExamCardsUseCase";

export class ExamCardsService extends BaseService {
  private readonly generateExamCardsUseCase: GenerateExamCardsUseCase;

  constructor() {
    super("ExamCardsService");
    this.generateExamCardsUseCase = new GenerateExamCardsUseCase();
  }

  public async getCards(
    query?: ExamCardsQueryDTO,
  ): Promise<Result<ExamCardItemDTO[], AppError>> {
    return this.execute(async () =>
      Result.ok(await this.generateExamCardsUseCase.execute(query)),
    );
  }
}
