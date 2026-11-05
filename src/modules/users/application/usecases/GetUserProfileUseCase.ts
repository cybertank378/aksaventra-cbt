import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { UserResponseDTO } from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";

export interface GetUserProfileInput {
  userId: string;
}

export class GetUserProfileUseCase
  implements BaseUseCase<GetUserProfileInput, UserResponseDTO, AppError>
{
  constructor(private readonly usersRepository: UsersRepositoryInterface) {}

  public async execute(
    input: GetUserProfileInput,
  ): Promise<Result<UserResponseDTO, AppError>> {
    const user = await this.usersRepository.findById(input.userId);
    if (!user) {
      return Result.fail(
        new DomainError(
          "Profil pengguna tidak ditemukan",
          404,
          "USER_NOT_FOUND",
        ),
      );
    }

    return Result.ok(user.toDTO());
  }
}
