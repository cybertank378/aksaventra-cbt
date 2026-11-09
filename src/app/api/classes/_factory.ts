import { ClassesService } from "@/modules/classes/application/service/ClassesService";
import { ClassesController } from "@/modules/classes/infrastructure/ClassesController";
import { ClassesRepository } from "@/modules/classes/infrastructure/ClassesRepository";

export function createClassesController(): ClassesController {
  const classesRepository = new ClassesRepository();
  const classesService = new ClassesService(classesRepository);
  return new ClassesController(classesService);
}

export const classesController = createClassesController();
