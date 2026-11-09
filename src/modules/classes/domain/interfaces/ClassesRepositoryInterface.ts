import type {
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  StudentDTO,
} from "../dto/ClassGroupDTO";

export interface ClassesRepositoryInterface {
  getAllClasses(): Promise<ClassGroupDTO[]>;
  getClassById(
    id: string,
  ): Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null>;
  createClass(data: CreateClassGroupInputDTO): Promise<ClassGroupDTO>;
  deleteClass(id: string): Promise<boolean>;

  getAllStudents(classGroupId?: string): Promise<StudentDTO[]>;
  createStudent(data: CreateStudentInputDTO): Promise<StudentDTO>;
  assignStudentToClass(
    studentId: string,
    classGroupId: string,
    className?: string,
  ): Promise<boolean>;
}
