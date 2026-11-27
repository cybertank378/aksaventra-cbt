import type { BaseRepository } from "@/core/base/BaseRepository";
import type { UserRole } from "@/security/rbacConfig";
import type { ListUsersQuery } from "../dto/UserDTO";
import type { UserEntity } from "../entities/UserEntity";

export interface CreateStaffUserRecordData {
  username: string;
  fullName: string;
  passwordHash: string;
  role: "ADMIN" | "TEACHER" | "PROCTOR";
  roomCode: string | null;
  isActive: boolean;
}

export interface UpdateStaffUserRecordData {
  fullName?: string;
  passwordHash?: string;
  role?: "ADMIN" | "TEACHER" | "PROCTOR";
  roomCode: string | null;
  isActive?: boolean;
}

export interface BulkUpdateUserRoleRecordData {
  role: UserRole;
  roomCode: string | null;
  clearClass: boolean;
}

export interface UsersRepositoryInterface
  extends BaseRepository<UserEntity, string> {
  findByUsername(username: string): Promise<UserEntity | null>;
  findByMoodleId(moodleUserId: number): Promise<UserEntity | null>;
  findByRole(role: UserRole): Promise<UserEntity[]>;
  findManyByIds(ids: string[]): Promise<UserEntity[]>;
  listUsers(
    query: ListUsersQuery,
  ): Promise<{ users: UserEntity[]; total: number }>;
  createStaffUser(data: CreateStaffUserRecordData): Promise<UserEntity>;
  updateStaffUser(
    id: string,
    data: UpdateStaffUserRecordData,
  ): Promise<UserEntity>;
  deleteById(id: string): Promise<void>;
  bulkUpdateRoles(
    ids: string[],
    data: BulkUpdateUserRoleRecordData,
  ): Promise<UserEntity[]>;
}
