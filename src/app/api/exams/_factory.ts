import { ExamService } from "@/modules/exams/application/ExamService";
import { CreateExamUseCase } from "@/modules/exams/application/usecases/CreateExamUseCase";
import { GetExamSnapshotUseCase } from "@/modules/exams/application/usecases/GetExamSnapshotUseCase";
import { UpdateExamUseCase } from "@/modules/exams/application/usecases/UpdateExamUseCase";
import { ExamController } from "@/modules/exams/infrastructure/ExamController";
import { ExamRepository } from "@/modules/exams/infrastructure/ExamRepository";

export function createExamController(): ExamController {
  const examRepository = new ExamRepository();
  const getExamSnapshotUseCase = new GetExamSnapshotUseCase(examRepository);
  const createExamUseCase = new CreateExamUseCase(examRepository);
  const updateExamUseCase = new UpdateExamUseCase(examRepository);

  const examService = new ExamService(
    examRepository,
    getExamSnapshotUseCase,
    createExamUseCase,
    updateExamUseCase,
  );

  return new ExamController(examService);
}

export const examController = createExamController();
