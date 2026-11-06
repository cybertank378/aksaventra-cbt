import { UsersService } from "@/modules/users/application/service/UsersService";
import { UsersController } from "@/modules/users/infrastructure/UsersController";
import { UsersRepository } from "@/modules/users/infrastructure/UsersRepository";

export function createUsersController(): UsersController {
  const usersRepository = new UsersRepository();
  const usersService = new UsersService(usersRepository);
  return new UsersController(usersService);
}

export const usersController = createUsersController();
