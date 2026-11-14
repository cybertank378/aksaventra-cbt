import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import { getDefaultRedirectForRole } from "@/security/rbacConfig";
import type { LoginInput, LoginOutput } from "../../domain/dto/AuthDTO";
import type { UserSessionEntity } from "../../domain/entities/UserSessionEntity";
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

    let user: UserSessionEntity | null = null;
    let moodleToken: string | undefined;

    // 1. Primary path: Verify credentials against Moodle (/login/token.php & core_webservice_get_site_info)
    try {
      const moodleAuth = await this.authRepository.verifyMoodleCredentials(
        username,
        password,
      );

      if (moodleAuth) {
        moodleToken = moodleAuth.token;
        user = await this.authRepository.syncMoodleUser({
          moodleUserId: moodleAuth.moodleUserId,
          username: moodleAuth.username,
          fullName: moodleAuth.fullName,
          role: moodleAuth.role,
          rawPassword: password,
        });
      }
    } catch {
      // Fallback to local database authentication
    }

    // 2. Secondary path: Fallback to local database & Argon2 password hash
    if (!user) {
      user = await this.authRepository.findUserByUsername(username);
      if (!user || !user.isActive) {
        return Result.fail(
          new DomainError(
            "Username atau kata sandi tidak valid",
            401,
            "INVALID_CREDENTIALS",
          ),
        );
      }

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
    }

    if (!user.isActive) {
      return Result.fail(
        new DomainError("Akun pengguna dinonaktifkan", 403, "ACCOUNT_DISABLED"),
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
        moodleToken,
      },
      "12h",
    );

    const redirectUrl =
      examId && user.role === "STUDENT"
        ? `/student/lobby/${examId}`
        : getDefaultRedirectForRole(user.role);

    return Result.ok({
      token,
      user: user.toDTO(),
      expiresInSeconds: 12 * 3600,
      redirectUrl,
    });
  }
}
