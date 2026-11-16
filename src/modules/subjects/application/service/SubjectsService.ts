import type {
  CreateSubjectInputDTO,
  SubjectDetailDTO,
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "../../domain/dto/SubjectDTO";
import type { SubjectsRepositoryInterface } from "../../domain/interfaces/SubjectsRepositoryInterface";
import { ManageSubjectsUseCase } from "../usecases/ManageSubjectsUseCase";

export class SubjectsService {
  private readonly manageSubjectsUseCase: ManageSubjectsUseCase;

  constructor(subjectsRepo: SubjectsRepositoryInterface) {
    this.manageSubjectsUseCase = new ManageSubjectsUseCase(subjectsRepo);
  }

  async getAllNames(): Promise<string[]> {
    return await this.manageSubjectsUseCase.getAllNames();
  }

  async getAllDetailed(): Promise<SubjectDTO[]> {
    return await this.manageSubjectsUseCase.getAllDetailed();
  }

  async getById(id: string): Promise<SubjectDetailDTO | null> {
    return await this.manageSubjectsUseCase.getById(id);
  }

  async create(input: CreateSubjectInputDTO): Promise<SubjectDTO> {
    return await this.manageSubjectsUseCase.create(input);
  }

  async update(
    id: string,
    input: UpdateSubjectInputDTO,
  ): Promise<SubjectDTO | null> {
    return await this.manageSubjectsUseCase.update(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.manageSubjectsUseCase.delete(id);
  }
}
