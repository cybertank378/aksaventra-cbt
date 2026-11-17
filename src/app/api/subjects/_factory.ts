import { SubjectsService } from "@/modules/subjects/application/service/SubjectsService";
import { SubjectsController } from "@/modules/subjects/infrastructure/SubjectsController";
import { SubjectsRepository } from "@/modules/subjects/infrastructure/SubjectsRepository";

export function createSubjectsController(): SubjectsController {
  const repository = new SubjectsRepository();
  const service = new SubjectsService(repository);
  return new SubjectsController(service);
}

export const subjectsController = createSubjectsController();
