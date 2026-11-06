import { AuthService } from "@/modules/auth/application/services/AuthService";
import { AuthController } from "@/modules/auth/infrastructure/AuthController";
import { AuthRepository } from "@/modules/auth/infrastructure/AuthRepository";
import { jwtProvider } from "@/modules/auth/infrastructure/JwtProvider";

export function createAuthController(): AuthController {
  const authRepository = new AuthRepository();
  const authService = new AuthService(authRepository, jwtProvider);
  return new AuthController(authService);
}

export const authController = createAuthController();
