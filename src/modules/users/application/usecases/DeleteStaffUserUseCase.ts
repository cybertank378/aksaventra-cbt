import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import {
  moodleSyncService as defaultMoodleSyncService,
  type MoodleSyncService,
} from "@/modules/sync/application/MoodleSyncService";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";

export interface DeleteStaffUserCommand {
  id: string;
  actorUserId: string;
}

export interface DeleteStaffUserOutput {
  id: string;
  deleted: boolean;
}

export class DeleteStaffUserUseCase
  implements
    BaseUseCase<DeleteStaffUserCommand, DeleteStaffUserOutput, AppError>
{
  constructor(
    private readonly usersRepository: UsersRepositoryInterface,
    private readonly syncService: MoodleSyncService = defaultMoodleSyncService,
  ) {}

  public async execute(
    input: DeleteStaffUserCommand,
  ): Promise<Result<DeleteStaffUserOutput, AppError>> {
    if (input.id === input.actorUserId) {
      return Result.fail(
        new DomainError(
          "Anda tidak dapat menghapus akun Anda sendiri.",
          400,
          "CANNOT_DELETE_SELF",
        ),
      );
    }

    const existing = await this.usersRepository.findById(input.id);
    if (!existing) {
      return Result.fail(
        new DomainError("Pengguna tidak ditemukan.", 404, "NOT_FOUND"),
      );
    }

    await this.usersRepository.deleteById(input.id);

    if (existing.moodleUserId && existing.moodleUserId > 0) {
      await this.syncService
        .deleteEntityInMoodle("user", existing.moodleUserId)
        .catch(() => undefined);
    }

    return Result.ok({ id: input.id, deleted: true });
  }
}
