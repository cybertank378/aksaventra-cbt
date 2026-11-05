import { AuthService } from "@/modules/auth/application/AuthService";
import { ExchangeMoodleLaunchTokenUseCase } from "@/modules/auth/application/usecases/ExchangeMoodleLaunchTokenUseCase";
import { LoginUseCase } from "@/modules/auth/application/usecases/LoginUseCase";
import { LogoutUseCase } from "@/modules/auth/application/usecases/LogoutUseCase";
import { VerifyExamTokenUseCase } from "@/modules/auth/application/usecases/VerifyExamTokenUseCase";
import { AuthController } from "@/modules/auth/infrastructure/AuthController";
import { AuthRepository } from "@/modules/auth/infrastructure/AuthRepository";
import { jwtProvider } from "@/modules/auth/infrastructure/JwtProvider";

export function createAuthController(): AuthController {
  const authRepository = new AuthRepository();
  const loginUseCase = new LoginUseCase(authRepository, jwtProvider);
  const logoutUseCase = new LogoutUseCase();
  const verifyExamTokenUseCase = new VerifyExamTokenUseCase(authRepository);
  const exchangeMoodleLaunchTokenUseCase = new ExchangeMoodleLaunchTokenUseCase(
    authRepository,
    jwtProvider,
  );

  const authService = new AuthService(
    loginUseCase,
    logoutUseCase,
    verifyExamTokenUseCase,
    exchangeMoodleLaunchTokenUseCase,
  );

  return new AuthController(authService);
}

export const authController = createAuthController();
