import type {
  BatchImportStudentsInputDTO,
  BatchImportStudentsResultDTO,
  ClassGroupDTO,
  CreateClassGroupInputDTO,
  CreateStudentInputDTO,
  EnrollStudentsInputDTO,
  EnrollStudentsResultDTO,
  StudentDTO,
  UpdateClassGroupInputDTO,
  UpdateStudentInputDTO,
} from "../dto/ClassGroupDTO";

export interface ClassesRepositoryInterface {
  getAllClasses(): Promise<ClassGroupDTO[]>;
  getClassById(
    id: string,
  ): Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null>;
  createClass(data: CreateClassGroupInputDTO): Promise<ClassGroupDTO>;
  updateClass(
    id: string,
    data: UpdateClassGroupInputDTO,
  ): Promise<ClassGroupDTO | null>;
  deleteClass(id: string): Promise<boolean>;

  getAllStudents(classGroupId?: string): Promise<StudentDTO[]>;
  getStudentById(id: string): Promise<StudentDTO | null>;
  createStudent(data: CreateStudentInputDTO): Promise<StudentDTO>;
  updateStudent(
    id: string,
    data: UpdateStudentInputDTO,
  ): Promise<StudentDTO | null>;
  deleteStudent(id: string): Promise<boolean>;
  assignStudentToClass(
    studentId: string,
    classGroupId: string,
    className?: string,
  ): Promise<boolean>;
  bulkAssignStudentsToClass(
    studentIds: string[],
    classGroupId: string | null,
  ): Promise<number>;
  batchImportStudents?(
    input: BatchImportStudentsInputDTO,
  ): Promise<BatchImportStudentsResultDTO>;
  enrollStudents?(
    input: EnrollStudentsInputDTO,
  ): Promise<EnrollStudentsResultDTO>;
}
