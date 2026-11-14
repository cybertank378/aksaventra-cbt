import type {
  CreateStudentInputDTO,
  StudentDTO,
} from "../../domain/dto/ClassGroupDTO";
import type { ClassesRepositoryInterface } from "../../domain/interfaces/ClassesRepositoryInterface";

export class CreateStudentUseCase {
  constructor(private readonly classesRepo: ClassesRepositoryInterface) {}

  async getAllStudents(classGroupId?: string): Promise<StudentDTO[]> {
    return await this.classesRepo.getAllStudents(classGroupId);
  }

  async createStudent(input: CreateStudentInputDTO): Promise<StudentDTO> {
    if (!input.username || input.username.trim().length === 0) {
      throw new Error("NIS/Username wajib diisi");
    }
    if (!input.fullName || input.fullName.trim().length === 0) {
      throw new Error("Nama lengkap siswa wajib diisi");
    }

    return await this.classesRepo.createStudent({
      username: input.username.trim(),
      fullName: input.fullName.trim(),
      email: input.email?.trim(),
      password: input.password || "Siswa123*",
      classGroupId: input.classGroupId,
      className: input.className,
      roomCode: input.roomCode,
    });
  }

  async assignStudentToClass(
    studentId: string,
    classGroupId: string,
    className?: string,
  ): Promise<boolean> {
    return await this.classesRepo.assignStudentToClass(
      studentId,
      classGroupId,
      className,
    );
  }
}
