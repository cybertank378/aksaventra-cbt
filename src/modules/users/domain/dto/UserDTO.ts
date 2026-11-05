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
