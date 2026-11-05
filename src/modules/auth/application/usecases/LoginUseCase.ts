import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { LoginInput, LoginOutput } from "../../domain/dto/AuthDTO";
import type { AuthRepositoryInterface } from "../../domain/interfaces/AuthRepositoryInterface";
import { SingleDeviceRule } from "../../domain/rules/SingleDeviceRule";
import type { JwtProvider } from "../../infrastructure/JwtProvider";

export class LoginUseCase
  implements BaseUseCase<LoginInput, LoginOutput, AppError>
{
  constructor(
    private readonly authRepository: AuthRepositoryInterface,
    private readonly jwtProvider: JwtProvider,
  ) {}

  public async execute(
    input: LoginInput,
  ): Promise<Result<LoginOutput, AppError>> {
    const { username, password, deviceHash, ipAddress, examId } = input;

    // 1. Find user by username
    const user = await this.authRepository.findUserByUsername(username);
    if (!user || !user.isActive) {
      return Result.fail(
        new DomainError(
          "Username atau kata sandi tidak valid",
          401,
          "INVALID_CREDENTIALS",
        ),
      );
    }

    // 2. Verify password hash using argon2 in repository
    const isPasswordValid = await this.authRepository.verifyUserPassword(
      user.id,
      password,
    );
    if (!isPasswordValid) {
      return Result.fail(
        new DomainError(
          "Username atau kata sandi tidak valid",
          401,
          "INVALID_CREDENTIALS",
        ),
      );
    }

    // 3. For students, enforce Single-Device Session Binding if exam context exists
    if (user.role === "STUDENT") {
      const activeAttempt = await this.authRepository.findActiveAttempt(
        user.id,
        examId,
      );

      if (activeAttempt && activeAttempt.status === "IN_PROGRESS") {
        const evaluation = SingleDeviceRule.evaluate({
          incomingDeviceHash: deviceHash,
          boundDeviceHash: activeAttempt.deviceHash,
        });

        if (evaluation.isFailure) {
          return Result.fail(evaluation.error);
        }

        // If previously unbound, bind device now
        if (!activeAttempt.deviceHash && deviceHash) {
          await this.authRepository.updateAttemptDeviceBinding(
            activeAttempt.id,
            deviceHash,
            ipAddress,
          );
        }
      }
    }

    // 4. Generate JWT session token
    const token = await this.jwtProvider.signToken(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      "12h",
    );

    return Result.ok({
      token,
      user: user.toDTO(),
      expiresInSeconds: 12 * 3600,
    });
  }
}
