import { AttemptService } from "@/modules/attempts/application/service/AttemptService";
import { AttemptController } from "@/modules/attempts/infrastructure/AttemptController";
import { AttemptRepository } from "@/modules/attempts/infrastructure/AttemptRepository";
import { ExamRepository } from "@/modules/exams/infrastructure/ExamRepository";

export function createAttemptController(): AttemptController {
  const attemptRepo = new AttemptRepository();
  const examRepo = new ExamRepository();
  const attemptService = new AttemptService(attemptRepo, examRepo);
  return new AttemptController(attemptService);
}

export const attemptController = createAttemptController();

