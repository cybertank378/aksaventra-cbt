import type {
  CreateSubjectInputDTO,
  SubjectDetailDTO,
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "../../domain/dto/SubjectDTO";
import type { SubjectsRepositoryInterface } from "../../domain/interfaces/SubjectsRepositoryInterface";

export class ManageSubjectsUseCase {
  constructor(private readonly subjectsRepo: SubjectsRepositoryInterface) {}

  async getAllNames(): Promise<string[]> {
    return await this.subjectsRepo.getAllNames();
  }

  async getAllDetailed(): Promise<SubjectDTO[]> {
    return await this.subjectsRepo.getAllDetailed();
  }

  async getById(id: string): Promise<SubjectDetailDTO | null> {
    return await this.subjectsRepo.getById(id);
  }

  async create(input: CreateSubjectInputDTO): Promise<SubjectDTO> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Nama mata pelajaran wajib diisi");
    }
    return await this.subjectsRepo.create(input);
  }

  async update(
    id: string,
    input: UpdateSubjectInputDTO,
  ): Promise<SubjectDTO | null> {
    return await this.subjectsRepo.update(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.subjectsRepo.delete(id);
  }
}
