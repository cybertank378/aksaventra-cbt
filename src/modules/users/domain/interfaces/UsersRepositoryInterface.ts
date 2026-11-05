import type { BaseRepository } from "@/core/base/BaseRepository";
import type { UserRole } from "@/security/rbacConfig";
import type { ListUsersQuery } from "../dto/UserDTO";
import type { UserEntity } from "../entities/UserEntity";

export interface UsersRepositoryInterface
  extends BaseRepository<UserEntity, string> {
  findByUsername(username: string): Promise<UserEntity | null>;
  findByMoodleId(moodleUserId: number): Promise<UserEntity | null>;
  findByRole(role: UserRole): Promise<UserEntity[]>;
  listUsers(
    query: ListUsersQuery,
  ): Promise<{ users: UserEntity[]; total: number }>;
}
