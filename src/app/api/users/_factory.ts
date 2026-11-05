import { UsersService } from "@/modules/users/application/UsersService";
import { GetUserProfileUseCase } from "@/modules/users/application/usecases/GetUserProfileUseCase";
import { ListUsersUseCase } from "@/modules/users/application/usecases/ListUsersUseCase";
import { UsersController } from "@/modules/users/infrastructure/UsersController";
import { UsersRepository } from "@/modules/users/infrastructure/UsersRepository";

export function createUsersController(): UsersController {
  const usersRepository = new UsersRepository();
  const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository);
  const listUsersUseCase = new ListUsersUseCase(usersRepository);
  const usersService = new UsersService(
    getUserProfileUseCase,
    listUsersUseCase,
  );

  return new UsersController(usersService);
}

export const usersController = createUsersController();
