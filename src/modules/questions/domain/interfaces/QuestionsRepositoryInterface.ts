import type {
  CreateQuestionInputDTO,
  QuestionsFilterQueryDTO,
} from "../dto/QuestionDTO";
import type { QuestionEntity } from "../entities/QuestionEntity";

export interface QuestionsRepositoryInterface {
  findMany(filter?: QuestionsFilterQueryDTO): Promise<QuestionEntity[]>;
  findById(id: string): Promise<QuestionEntity | null>;
  create(data: CreateQuestionInputDTO): Promise<QuestionEntity>;
  update(
    id: string,
    data: Partial<CreateQuestionInputDTO>,
  ): Promise<QuestionEntity | null>;
  delete(id: string): Promise<boolean>;
}
