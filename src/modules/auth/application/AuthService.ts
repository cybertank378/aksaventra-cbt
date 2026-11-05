import { BaseService } from "@/core/base/BaseService";
import type { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  ExchangeMoodleLaunchInput,
  ExchangeMoodleLaunchOutput,
  LoginInput,
  LoginOutput,
  VerifyExamTokenInput,
  VerifyExamTokenOutput,
} from "../domain/dto/AuthDTO";
import type { ExchangeMoodleLaunchTokenUseCase } from "./usecases/ExchangeMoodleLaunchTokenUseCase";
import type { LoginUseCase } from "./usecases/LoginUseCase";
import type {
  LogoutInput,
  LogoutOutput,
  LogoutUseCase,
} from "./usecases/LogoutUseCase";
import type { VerifyExamTokenUseCase } from "./usecases/VerifyExamTokenUseCase";

export class AuthService extends BaseService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly verifyExamTokenUseCase: VerifyExamTokenUseCase,
    private readonly exchangeMoodleLaunchTokenUseCase: ExchangeMoodleLaunchTokenUseCase,
  ) {
    super();
  }

  public async login(
    input: LoginInput,
  ): Promise<Result<LoginOutput, AppError>> {
    return await this.loginUseCase.execute(input);
  }

  public async logout(
    input: LogoutInput,
  ): Promise<Result<LogoutOutput, AppError>> {
    return await this.logoutUseCase.execute(input);
  }

  public async verifyExamToken(
    input: VerifyExamTokenInput,
  ): Promise<Result<VerifyExamTokenOutput, AppError>> {
    return await this.verifyExamTokenUseCase.execute(input);
  }

  public async exchangeMoodleLaunch(
    input: ExchangeMoodleLaunchInput,
  ): Promise<Result<ExchangeMoodleLaunchOutput, AppError>> {
    return await this.exchangeMoodleLaunchTokenUseCase.execute(input);
  }
}
