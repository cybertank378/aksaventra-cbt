import { ExamCardsService } from "@/modules/exam-cards/application/service/ExamCardsService";
import { ExamCardsController } from "@/modules/exam-cards/infrastructure/ExamCardsController";

const examCardsService = new ExamCardsService();
export const examCardsController = new ExamCardsController(examCardsService);
