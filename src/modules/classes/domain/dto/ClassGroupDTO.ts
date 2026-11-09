export interface ClassGroupDTO {
  id: string;
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
