import { BaseService } from "@/core/base/BaseService";
import type { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  ListUsersOutput,
  ListUsersQuery,
  UserResponseDTO,
} from "../domain/dto/UserDTO";
import type { GetUserProfileUseCase } from "./usecases/GetUserProfileUseCase";
import type { ListUsersUseCase } from "./usecases/ListUsersUseCase";

export class UsersService extends BaseService {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {
    super();
  }

  public async getProfile(
    userId: string,
  ): Promise<Result<UserResponseDTO, AppError>> {
    return await this.getUserProfileUseCase.execute({ userId });
  }

  public async listUsers(
    query: ListUsersQuery,
  ): Promise<Result<ListUsersOutput, AppError>> {
    return await this.listUsersUseCase.execute(query);
  }
}
