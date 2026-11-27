import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  BulkUpdateUserRoleOutputDTO,
  CreateStaffUserInputDTO,
  ListUsersOutput,
  ListUsersQuery,
  UserResponseDTO,
} from "../../domain/dto/UserDTO";
import type { UsersRepositoryInterface } from "../../domain/interfaces/UsersRepositoryInterface";
import {
  type BulkUpdateUserRolesCommand,
  BulkUpdateUserRolesUseCase,
} from "../usecases/BulkUpdateUserRolesUseCase";
import { CreateStaffUserUseCase } from "../usecases/CreateStaffUserUseCase";
import {
  type DeleteStaffUserCommand,
  type DeleteStaffUserOutput,
  DeleteStaffUserUseCase,
} from "../usecases/DeleteStaffUserUseCase";
import { GetUserProfileUseCase } from "../usecases/GetUserProfileUseCase";
import { ListUsersUseCase } from "../usecases/ListUsersUseCase";
import {
  type UpdateStaffUserCommand,
  UpdateStaffUserUseCase,
} from "../usecases/UpdateStaffUserUseCase";

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
  private readonly createStaffUserUseCase: CreateStaffUserUseCase;
  private readonly updateStaffUserUseCase: UpdateStaffUserUseCase;
  private readonly deleteStaffUserUseCase: DeleteStaffUserUseCase;
  private readonly bulkUpdateUserRolesUseCase: BulkUpdateUserRolesUseCase;

  constructor(
    repository: UsersRepositoryInterface,
    useCases?: {
      getUserProfileUseCase?: GetUserProfileUseCase;
      listUsersUseCase?: ListUsersUseCase;
      createStaffUserUseCase?: CreateStaffUserUseCase;
      updateStaffUserUseCase?: UpdateStaffUserUseCase;
      deleteStaffUserUseCase?: DeleteStaffUserUseCase;
      bulkUpdateUserRolesUseCase?: BulkUpdateUserRolesUseCase;
    },
  ) {
    super("UsersService");

    this.getUserProfileUseCase =
      useCases?.getUserProfileUseCase ?? new GetUserProfileUseCase(repository);
    this.listUsersUseCase =
      useCases?.listUsersUseCase ?? new ListUsersUseCase(repository);
    this.createStaffUserUseCase =
      useCases?.createStaffUserUseCase ??
      new CreateStaffUserUseCase(repository);
    this.updateStaffUserUseCase =
      useCases?.updateStaffUserUseCase ??
      new UpdateStaffUserUseCase(repository);
    this.deleteStaffUserUseCase =
      useCases?.deleteStaffUserUseCase ??
      new DeleteStaffUserUseCase(repository);
    this.bulkUpdateUserRolesUseCase =
      useCases?.bulkUpdateUserRolesUseCase ??
      new BulkUpdateUserRolesUseCase(repository);
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

  public createStaffUser(
    input: CreateStaffUserInputDTO,
  ): Promise<Result<UserResponseDTO, AppError>> {
    return this.execute(() => this.createStaffUserUseCase.execute(input));
  }

  public updateStaffUser(
    input: UpdateStaffUserCommand,
  ): Promise<Result<UserResponseDTO, AppError>> {
    return this.execute(() => this.updateStaffUserUseCase.execute(input));
  }

  public deleteStaffUser(
    input: DeleteStaffUserCommand,
  ): Promise<Result<DeleteStaffUserOutput, AppError>> {
    return this.execute(() => this.deleteStaffUserUseCase.execute(input));
  }

  public bulkUpdateUserRoles(
    input: BulkUpdateUserRolesCommand,
  ): Promise<Result<BulkUpdateUserRoleOutputDTO, AppError>> {
    return this.execute(() => this.bulkUpdateUserRolesUseCase.execute(input));
  }
}
