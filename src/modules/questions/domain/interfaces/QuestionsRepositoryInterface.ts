import type {
  CreateQuestionInputDTO,
  QuestionsFilterQueryDTO,
} from "../dto/QuestionDTO";
import type { QuestionEntity } from "../entities/QuestionEntity";

export interface QuestionsRepositoryInterface {
  findMany(filter?: QuestionsFilterQueryDTO): Promise<QuestionEntity[]>;
  findById(id: string): Promise<QuestionEntity | null>;
  create(data: CreateQuestionInputDTO): Promise<QuestionEntity>;
  delete(id: string): Promise<boolean>;
}
