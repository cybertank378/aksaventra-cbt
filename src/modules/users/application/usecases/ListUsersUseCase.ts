import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type { ListUsersOutput, ListUsersQuery } from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";

export class ListUsersUseCase
  implements BaseUseCase<ListUsersQuery, ListUsersOutput, AppError>
{
  constructor(private readonly usersRepository: UsersRepositoryInterface) {}

  public async execute(
    query: ListUsersQuery,
  ): Promise<Result<ListUsersOutput, AppError>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    const { users, total } = await this.usersRepository.listUsers({
      ...query,
      page,
      limit,
    });

    return Result.ok({
      users: users.map((u) => u.toDTO()),
      total,
      page,
      limit,
    });
  }
}
