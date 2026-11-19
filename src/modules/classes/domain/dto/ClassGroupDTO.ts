export interface ClassGroupDTO {
  id: string;
  moodleId?: number | null;
  name: string;
  code?: string | null;
  description?: string | null;
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDTO {
  id: string;
  username: string; // NIS or username
  fullName: string;
  email?: string;
  className?: string | null;
  classGroupId?: string | null;
  roomCode?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateClassGroupInputDTO {
  name: string;
  code?: string;
  description?: string;
  studentIds?: string[];
}

export interface UpdateClassGroupInputDTO {
  name?: string;
  code?: string | null;
  description?: string | null;
  studentIds?: string[];
}

export interface BatchImportClassesInputDTO {
  csvText: string;
}

export interface BatchImportClassesResultDTO {
  processedCount: number;
  assignedStudentsCount: number;
  moodleSyncedCount: number;
  errors: string[];
}

export interface CreateStudentInputDTO {
  username: string; // NIS
  fullName: string;
  email?: string;
  password?: string;
  classGroupId?: string;
  className?: string;
  roomCode?: string;
}

export interface UpdateStudentInputDTO {
  username?: string;
  fullName?: string;
  password?: string;
  classGroupId?: string | null;
  className?: string | null;
  roomCode?: string | null;
  isActive?: boolean;
}

export interface BulkAssignStudentsClassInputDTO {
  studentIds: string[];
  classGroupId: string | null;
}

export interface BatchImportStudentsInputDTO {
  csvText: string;
  defaultClassGroupId?: string | null;
  subjectId?: string | null;
  courseName?: string | null;
  examId?: string | null;
  roomCode?: string;
  seatPrefix?: string;
}

export interface BatchImportStudentsResultDTO {
  processedCount: number;
  createdClasses: number;
  enrolledCount: number;
  moodleSyncedCount: number;
  errors: string[];
}

export interface EnrollStudentsInputDTO {
  studentIds?: string[];
  classGroupIds?: string[];
  subjectId?: string | null;
  courseName?: string | null;
  examId?: string | null;
  roomCode?: string;
  seatPrefix?: string;
}

export interface EnrollStudentsResultDTO {
  enrolledCount: number;
  moodleSynced: boolean;
  courseName?: string | null;
  examTitle?: string | null;
}
