import type { UserRole } from "@/security/rbacConfig";

export interface UserResponseDTO {
  id: string;
  moodleUserId?: number | null;
  username: string;
  fullName: string;
  role: UserRole;
  className?: string | null;
  roomCode?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListUsersQuery {
  role?: UserRole;
  excludeRole?: UserRole;
  roomCode?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListUsersOutput {
  users: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateStaffUserInputDTO {
  username: string;
  fullName: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "PROCTOR";
  roomCode?: string | null;
  isActive?: boolean;
}

export interface UpdateStaffUserInputDTO {
  fullName?: string;
  password?: string;
  role?: "ADMIN" | "TEACHER" | "PROCTOR";
  roomCode?: string | null;
  isActive?: boolean;
}

export interface BulkUpdateUserRoleInputDTO {
  userIds: string[];
  role: UserRole;
  roomCode?: string | null;
}

export interface BulkUpdateUserRoleOutputDTO {
  updatedCount: number;
  skippedCount: number;
  moodleSyncedCount: number;
  users: UserResponseDTO[];
}
