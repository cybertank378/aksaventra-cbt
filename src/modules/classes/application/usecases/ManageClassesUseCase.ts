import type {
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  StudentDTO,
} from "../../domain/dto/ClassGroupDTO";
import type { ClassesRepositoryInterface } from "../../domain/interfaces/ClassesRepositoryInterface";

export class ManageClassesUseCase {
  constructor(private readonly classesRepo: ClassesRepositoryInterface) {}

  async getAllClasses(): Promise<ClassGroupDTO[]> {
    return await this.classesRepo.getAllClasses();
  }

  async getClassDetails(
    id: string,
  ): Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null> {
    return await this.classesRepo.getClassById(id);
  }

  async createClass(input: CreateClassGroupInputDTO): Promise<ClassGroupDTO> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Nama kelas wajib diisi");
    }
    return await this.classesRepo.createClass({
      name: input.name.trim(),
      code: input.code?.trim(),
      description: input.description?.trim(),
    });
  }

  async deleteClass(id: string): Promise<boolean> {
    return await this.classesRepo.deleteClass(id);
  }
}
