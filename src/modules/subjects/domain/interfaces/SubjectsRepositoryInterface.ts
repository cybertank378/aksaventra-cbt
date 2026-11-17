import type {
  CreateSubjectInputDTO,
  SubjectDetailDTO,
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "../dto/SubjectDTO";

export interface SubjectsRepositoryInterface {
  getAllDetailed(): Promise<SubjectDTO[]>;
  getAllNames(): Promise<string[]>;
  getById(id: string): Promise<SubjectDetailDTO | null>;
  create(data: CreateSubjectInputDTO): Promise<SubjectDTO>;
  update(id: string, data: UpdateSubjectInputDTO): Promise<SubjectDTO | null>;
  delete(id: string): Promise<boolean>;
}
