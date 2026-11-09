import type {
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
} from "../../domain/dto/ClassGroupDTO";
import type { ClassesRepositoryInterface } from "../../domain/interfaces/ClassesRepositoryInterface";
import { CreateStudentUseCase } from "../usecases/CreateStudentUseCase";
import { ManageClassesUseCase } from "../usecases/ManageClassesUseCase";

export class ClassesService {
  private readonly manageClassesUseCase: ManageClassesUseCase;
  private readonly createStudentUseCase: CreateStudentUseCase;

  constructor(classesRepo: ClassesRepositoryInterface) {
    this.manageClassesUseCase = new ManageClassesUseCase(classesRepo);
    this.createStudentUseCase = new CreateStudentUseCase(classesRepo);
  }

  async getAllClasses(): Promise<ClassGroupDTO[]> {
    return await this.manageClassesUseCase.getAllClasses();
  }

  async getClassDetails(
    id: string,
  ): Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null> {
    return await this.manageClassesUseCase.getClassDetails(id);
  }

  async createClass(input: CreateClassGroupInputDTO): Promise<ClassGroupDTO> {
    return await this.manageClassesUseCase.createClass(input);
  }

  async deleteClass(id: string): Promise<boolean> {
    return await this.manageClassesUseCase.deleteClass(id);
  }

  async getAllStudents(classGroupId?: string): Promise<StudentDTO[]> {
    return await this.createStudentUseCase.getAllStudents(classGroupId);
  }

  async createStudent(input: CreateStudentInputDTO): Promise<StudentDTO> {
    return await this.createStudentUseCase.createStudent(input);
  }

  async assignStudentToClass(
    studentId: string,
    classGroupId: string,
    className?: string,
  ): Promise<boolean> {
    return await this.createStudentUseCase.assignStudentToClass(
      studentId,
      classGroupId,
      className,
    );
  }
}
