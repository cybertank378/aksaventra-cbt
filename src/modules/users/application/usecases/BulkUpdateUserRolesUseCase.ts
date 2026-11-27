import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import {
  moodleSyncService as defaultMoodleSyncService,
  type MoodleSyncService,
} from "@/modules/sync/application/MoodleSyncService";
import type {
  BulkUpdateUserRoleInputDTO,
  BulkUpdateUserRoleOutputDTO,
} from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";

const MOODLE_PUSH_BATCH_SIZE = 10;

export interface BulkUpdateUserRolesCommand extends BulkUpdateUserRoleInputDTO {
  actorUserId: string;
}

export class BulkUpdateUserRolesUseCase
  implements
    BaseUseCase<
      BulkUpdateUserRolesCommand,
      BulkUpdateUserRoleOutputDTO,
      AppError
    >
{
  constructor(
    private readonly usersRepository: UsersRepositoryInterface,
    private readonly syncService: MoodleSyncService = defaultMoodleSyncService,
  ) {}

  public async execute(
    input: BulkUpdateUserRolesCommand,
  ): Promise<Result<BulkUpdateUserRoleOutputDTO, AppError>> {
    const uniqueIds = Array.from(new Set(input.userIds));
    const targetRole = input.role;
    const normalizedRoom = input.roomCode?.trim().toUpperCase() || null;

    if (targetRole === "PROCTOR" && !normalizedRoom) {
      return Result.fail(
        new DomainError(
          "Kode ruang ujian wajib diisi saat mengubah peran massal menjadi Proktor.",
          400,
          "ROOM_REQUIRED",
        ),
      );
    }

    const existingUsers = await this.usersRepository.findManyByIds(uniqueIds);
    if (existingUsers.length === 0) {
      return Result.fail(
        new DomainError(
          "Tidak ada pengguna yang ditemukan untuk diperbarui.",
          404,
          "NOT_FOUND",
        ),
      );
    }

    const eligibleUsers = existingUsers.filter((u) => {
      const isPrimaryAdmin = u.username.trim().toLowerCase() === "admin";
      const isSelf = u.id === input.actorUserId;
      if ((isPrimaryAdmin || isSelf) && targetRole !== "ADMIN") {
        return false;
      }
      return true;
    });

    const skippedCount = existingUsers.length - eligibleUsers.length;
    if (eligibleUsers.length === 0) {
      return Result.fail(
        new DomainError(
          "Akun admin utama dan akun yang sedang Anda gunakan tidak dapat diturunkan dari peran Admin.",
          400,
          "PROTECTED_ADMIN",
        ),
      );
    }

    const eligibleIds = eligibleUsers.map((u) => u.id);
    const updatedUsers = await this.usersRepository.bulkUpdateRoles(
      eligibleIds,
      {
        role: targetRole,
        roomCode: targetRole === "PROCTOR" ? normalizedRoom : null,
        clearClass: targetRole !== "STUDENT",
      },
    );

    let moodleSyncedCount = 0;
    for (let i = 0; i < updatedUsers.length; i += MOODLE_PUSH_BATCH_SIZE) {
      const batch = updatedUsers.slice(i, i + MOODLE_PUSH_BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((u) =>
          this.syncService.pushStudentToMoodle({
            id: u.id,
            moodleUserId: u.moodleUserId,
            username: u.username,
            fullName: u.fullName,
            role: u.role,
            isActive: u.isActive,
          }),
        ),
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.synced) {
          moodleSyncedCount++;
        }
      }
    }

    return Result.ok({
      updatedCount: updatedUsers.length,
      skippedCount,
      moodleSyncedCount,
      users: updatedUsers.map((u) => u.toDTO()),
    });
  }
}
