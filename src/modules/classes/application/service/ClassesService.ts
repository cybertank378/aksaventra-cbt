import type {
  BulkAssignStudentsClassInputDTO,
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
  UpdateStudentInputDTO,
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

  async updateClass(
    id: string,
    input: UpdateClassGroupInputDTO,
  ): Promise<ClassGroupDTO | null> {
    return await this.manageClassesUseCase.updateClass(id, input);
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

  async getStudentById(id: string): Promise<StudentDTO | null> {
    return await this.createStudentUseCase.getStudentById(id);
  }

  async updateStudent(
    id: string,
    input: UpdateStudentInputDTO,
  ): Promise<StudentDTO | null> {
    return await this.createStudentUseCase.updateStudent(id, input);
  }

  async deleteStudent(id: string): Promise<boolean> {
    return await this.createStudentUseCase.deleteStudent(id);
  }

  async bulkAssignStudentsToClass(
    input: BulkAssignStudentsClassInputDTO,
  ): Promise<number> {
    return await this.createStudentUseCase.bulkAssignStudentsToClass(input);
  }
}
