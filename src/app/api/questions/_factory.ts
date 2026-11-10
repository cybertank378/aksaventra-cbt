import { QuestionsService } from "@/modules/questions/application/service/QuestionsService";
import { QuestionsController } from "@/modules/questions/infrastructure/QuestionsController";
import { QuestionsRepository } from "@/modules/questions/infrastructure/QuestionsRepository";

const questionsRepository = new QuestionsRepository();
const questionsService = new QuestionsService(questionsRepository);
export const questionsController = new QuestionsController(questionsService);
