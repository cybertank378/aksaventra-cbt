import type {
  BatchImportClassesInputDTO,
  BatchImportClassesResultDTO,
  BatchImportStudentsInputDTO,
  BatchImportStudentsResultDTO,
  BulkAssignRoomSeatsInputDTO,
  BulkAssignStudentsClassInputDTO,
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  EnrollStudentsInputDTO,
  EnrollStudentsResultDTO,
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
  private readonly classesRepo: ClassesRepositoryInterface;

  constructor(classesRepo: ClassesRepositoryInterface) {
    this.classesRepo = classesRepo;
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

  async batchImportStudents(
    input: BatchImportStudentsInputDTO,
  ): Promise<BatchImportStudentsResultDTO> {
    if (!this.classesRepo.batchImportStudents) {
      throw new Error("Batch import siswa tidak didukung oleh repository");
    }
    return await this.classesRepo.batchImportStudents(input);
  }

  async enrollStudents(
    input: EnrollStudentsInputDTO,
  ): Promise<EnrollStudentsResultDTO> {
    if (!this.classesRepo.enrollStudents) {
      throw new Error("Enrollment siswa tidak didukung oleh repository");
    }
    return await this.classesRepo.enrollStudents(input);
  }

  async batchImportClasses(
    input: BatchImportClassesInputDTO,
  ): Promise<BatchImportClassesResultDTO> {
    if (!this.classesRepo.batchImportClasses) {
      throw new Error("Batch import kelas tidak didukung oleh repository");
    }
    return await this.classesRepo.batchImportClasses(input);
  }

  async exportClassesCsv(): Promise<string> {
    if (!this.classesRepo.exportClassesCsv) {
      throw new Error("Export CSV kelas tidak didukung oleh repository");
    }
    return await this.classesRepo.exportClassesCsv();
  }

  async bulkAssignRoomAndSeats(
    input: BulkAssignRoomSeatsInputDTO,
  ): Promise<number> {
    if (!this.classesRepo.bulkAssignRoomAndSeats) {
      throw new Error(
        "Penempatan ruang & nomor meja massal tidak didukung oleh repository",
      );
    }
    return await this.classesRepo.bulkAssignRoomAndSeats(input);
  }
}
