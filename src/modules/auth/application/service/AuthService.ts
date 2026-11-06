import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  ExchangeMoodleLaunchInput,
  ExchangeMoodleLaunchOutput,
  LoginInput,
  LoginOutput,
  VerifyExamTokenInput,
  VerifyExamTokenOutput,
} from "../../domain/dto/AuthDTO";
import type { AuthRepositoryInterface } from "../../domain/interfaces/AuthRepositoryInterface";
import type { JwtProvider } from "../../infrastructure/JwtProvider";
import { ExchangeMoodleLaunchTokenUseCase } from "../usecases/ExchangeMoodleLaunchTokenUseCase";
import { LoginUseCase } from "../usecases/LoginUseCase";
import {
  type LogoutInput,
  type LogoutOutput,
  LogoutUseCase,
} from "../usecases/LogoutUseCase";
import { VerifyExamTokenUseCase } from "../usecases/VerifyExamTokenUseCase";

/* ============================================================
 * AUTH SERVICE
 * ============================================================
 * Responsibility:
 * - Application Facade & UseCase Orchestrator
 * - Thin Application Entry Point
 * - Delegates all business logic to dedicated Use Cases
 * ============================================================
 */
export class AuthService extends BaseService {
  private readonly loginUseCase: LoginUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly verifyExamTokenUseCase: VerifyExamTokenUseCase;
  private readonly exchangeMoodleLaunchTokenUseCase: ExchangeMoodleLaunchTokenUseCase;

  constructor(
    repository: AuthRepositoryInterface,
    jwtProvider: JwtProvider,
    useCases?: {
      loginUseCase?: LoginUseCase;
      logoutUseCase?: LogoutUseCase;
      verifyExamTokenUseCase?: VerifyExamTokenUseCase;
      exchangeMoodleLaunchTokenUseCase?: ExchangeMoodleLaunchTokenUseCase;
    },
  ) {
    super("AuthService");

    this.loginUseCase =
      useCases?.loginUseCase ?? new LoginUseCase(repository, jwtProvider);
    this.logoutUseCase = useCases?.logoutUseCase ?? new LogoutUseCase();
    this.verifyExamTokenUseCase =
      useCases?.verifyExamTokenUseCase ??
      new VerifyExamTokenUseCase(repository);
    this.exchangeMoodleLaunchTokenUseCase =
      useCases?.exchangeMoodleLaunchTokenUseCase ??
      new ExchangeMoodleLaunchTokenUseCase(repository, jwtProvider);
  }

  public login(input: LoginInput): Promise<Result<LoginOutput, AppError>> {
    return this.execute(() => this.loginUseCase.execute(input));
  }

  public logout(input: LogoutInput): Promise<Result<LogoutOutput, AppError>> {
    return this.execute(() => this.logoutUseCase.execute(input));
  }

  public verifyExamToken(
    input: VerifyExamTokenInput,
  ): Promise<Result<VerifyExamTokenOutput, AppError>> {
    return this.execute(() => this.verifyExamTokenUseCase.execute(input));
  }

  public exchangeMoodleLaunch(
    input: ExchangeMoodleLaunchInput,
  ): Promise<Result<ExchangeMoodleLaunchOutput, AppError>> {
    return this.execute(() =>
      this.exchangeMoodleLaunchTokenUseCase.execute(input),
    );
  }
}
