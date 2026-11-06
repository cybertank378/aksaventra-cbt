import { BaseService } from "@/core/base/BaseService";
import type { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  ListUsersOutput,
  ListUsersQuery,
  UserResponseDTO,
} from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";
import { GetUserProfileUseCase } from "../usecases/GetUserProfileUseCase";
import { ListUsersUseCase } from "../usecases/ListUsersUseCase";

/* ============================================================
 * USERS SERVICE
 * ============================================================
 * Responsibility:
 * - Application Facade & UseCase Orchestrator
 * - Thin Application Entry Point
 * - Delegates all business logic to dedicated Use Cases
 * ============================================================
 */
export class UsersService extends BaseService {
  private readonly getUserProfileUseCase: GetUserProfileUseCase;
  private readonly listUsersUseCase: ListUsersUseCase;

  constructor(
    repository: UsersRepositoryInterface,
    useCases?: {
      getUserProfileUseCase?: GetUserProfileUseCase;
      listUsersUseCase?: ListUsersUseCase;
    },
  ) {
    super("UsersService");

    this.getUserProfileUseCase =
      useCases?.getUserProfileUseCase ?? new GetUserProfileUseCase(repository);
    this.listUsersUseCase =
      useCases?.listUsersUseCase ?? new ListUsersUseCase(repository);
  }

  public getProfile(
    userId: string,
  ): Promise<Result<UserResponseDTO, AppError>> {
    return this.execute(() => this.getUserProfileUseCase.execute({ userId }));
  }

  public listUsers(
    query: ListUsersQuery,
  ): Promise<Result<ListUsersOutput, AppError>> {
    return this.execute(() => this.listUsersUseCase.execute(query));
  }
}
