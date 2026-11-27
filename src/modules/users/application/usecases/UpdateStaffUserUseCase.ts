import argon2 from "argon2";
import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import {
  moodleSyncService as defaultMoodleSyncService,
  type MoodleSyncService,
} from "@/modules/sync/application/MoodleSyncService";
import type {
  UpdateStaffUserInputDTO,
  UserResponseDTO,
} from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";

export interface UpdateStaffUserCommand extends UpdateStaffUserInputDTO {
  id: string;
}

export class UpdateStaffUserUseCase
  implements BaseUseCase<UpdateStaffUserCommand, UserResponseDTO, AppError>
{
  constructor(
    private readonly usersRepository: UsersRepositoryInterface,
    private readonly syncService: MoodleSyncService = defaultMoodleSyncService,
  ) {}

  public async execute(
    input: UpdateStaffUserCommand,
  ): Promise<Result<UserResponseDTO, AppError>> {
    const existing = await this.usersRepository.findById(input.id);
    if (!existing) {
      return Result.fail(
        new DomainError("Pengguna tidak ditemukan.", 404, "NOT_FOUND"),
      );
    }

    const nextRole = input.role ?? existing.role;
    const nextRoomCode =
      input.roomCode !== undefined
        ? input.roomCode?.trim().toUpperCase() || null
        : (existing.roomCode ?? null);

    if (nextRole === "PROCTOR" && !nextRoomCode) {
      return Result.fail(
        new DomainError(
          "Kode ruang ujian wajib diisi untuk akun Proktor (1 Proktor = 1 Ruang).",
          400,
          "ROOM_REQUIRED",
        ),
      );
    }

    const passwordHash = input.password
      ? await argon2.hash(input.password, { type: argon2.argon2id })
      : undefined;

    const updated = await this.usersRepository.updateStaffUser(input.id, {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(passwordHash ? { passwordHash } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      roomCode: nextRole === "PROCTOR" ? nextRoomCode : null,
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    await this.syncService
      .pushStudentToMoodle({
        id: updated.id,
        moodleUserId: updated.moodleUserId,
        username: updated.username,
        fullName: updated.fullName,
        password: input.password,
        role: updated.role,
        isActive: updated.isActive,
      })
      .catch(() => undefined);

    return Result.ok(updated.toDTO());
  }
}
