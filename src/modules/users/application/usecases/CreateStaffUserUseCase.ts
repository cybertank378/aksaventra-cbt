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
  CreateStaffUserInputDTO,
  UserResponseDTO,
} from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";

export class CreateStaffUserUseCase
  implements BaseUseCase<CreateStaffUserInputDTO, UserResponseDTO, AppError>
{
  constructor(
    private readonly usersRepository: UsersRepositoryInterface,
    private readonly syncService: MoodleSyncService = defaultMoodleSyncService,
  ) {}

  public async execute(
    input: CreateStaffUserInputDTO,
  ): Promise<Result<UserResponseDTO, AppError>> {
    const normalizedRoom = input.roomCode?.trim().toUpperCase() || null;
    const isActive = input.isActive ?? true;

    if (input.role === "PROCTOR" && !normalizedRoom) {
      return Result.fail(
        new DomainError(
          "Kode ruang ujian wajib diisi untuk akun Proktor (1 Proktor = 1 Ruang).",
          400,
          "ROOM_REQUIRED",
        ),
      );
    }

    const existing = await this.usersRepository.findByUsername(input.username);
    if (existing) {
      return Result.fail(
        new DomainError(
          `Username '${input.username}' sudah terdaftar.`,
          409,
          "USERNAME_EXISTS",
        ),
      );
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    const created = await this.usersRepository.createStaffUser({
      username: input.username,
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      roomCode: input.role === "PROCTOR" ? normalizedRoom : null,
      isActive,
    });

    const syncResult = await this.syncService
      .pushStudentToMoodle({
        id: created.id,
        username: created.username,
        fullName: created.fullName,
        password: input.password,
        role: created.role,
        isActive: created.isActive,
      })
      .catch(() => ({ synced: false, moodleId: undefined }));

    const dto = created.toDTO();
    return Result.ok({
      ...dto,
      moodleUserId: syncResult.moodleId ?? dto.moodleUserId,
    });
  }
}
