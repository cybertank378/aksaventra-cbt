import { ExamService } from "@/modules/exams/application/services/ExamService";
import { ExamController } from "@/modules/exams/infrastructure/ExamController";
import { ExamRepository } from "@/modules/exams/infrastructure/ExamRepository";

export function createExamController(): ExamController {
  const examRepository = new ExamRepository();
  const examService = new ExamService(examRepository);
  return new ExamController(examService);
}

export const examController = createExamController();
