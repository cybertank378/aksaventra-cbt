import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  ExchangeMoodleLaunchInput,
  ExchangeMoodleLaunchOutput,
} from "../../domain/dto/AuthDTO";
import type { AuthRepositoryInterface } from "../../domain/interfaces/AuthRepositoryInterface";
import { SingleDeviceRule } from "../../domain/rules/SingleDeviceRule";
import type { JwtProvider } from "../../infrastructure/JwtProvider";

export class ExchangeMoodleLaunchTokenUseCase
  implements
    BaseUseCase<ExchangeMoodleLaunchInput, ExchangeMoodleLaunchOutput, AppError>
{
  constructor(
    private readonly authRepository: AuthRepositoryInterface,
    private readonly jwtProvider: JwtProvider,
  ) {}

  public async execute(
    input: ExchangeMoodleLaunchInput,
  ): Promise<Result<ExchangeMoodleLaunchOutput, AppError>> {
    const {
      moodleUserId,
      moodleCbtId,
      launchToken,
      deviceHash,
      ipAddress = "",
    } = input;

    // 1. Resolve student by Moodle user ID or by validating launch token
    let user = moodleUserId
      ? await this.authRepository.findUserByMoodleId(moodleUserId)
      : null;

    if (!user) {
      // Validate launch token against Moodle bridge
      const validated =
        await this.authRepository.validateMoodleLaunchToken(launchToken);
      if (!validated) {
        return Result.fail(
          new DomainError(
            "Token launch Moodle tidak valid atau telah kedaluwarsa",
            401,
            "INVALID_LAUNCH_TOKEN",
          ),
        );
      }

      user = await this.authRepository.syncMoodleUser({
        moodleUserId: validated.moodleUserId,
        username: validated.username,
        fullName: validated.fullName,
        role: "STUDENT",
      });
    }

    if (!user || !user.isActive) {
      return Result.fail(
        new DomainError(
          "Akun siswa Moodle tidak ditemukan atau tidak aktif",
          404,
          "USER_NOT_FOUND",
        ),
      );
    }

    // 2. Resolve exam by Moodle cbt ID
    let exam = await this.authRepository.findExamByMoodleCbtId(moodleCbtId);
    if (!exam) {
      try {
        exam =
          await this.authRepository.ensureExamExistsForMoodleCbt(moodleCbtId);
      } catch {
        // Exam creation failed
      }
    }

    if (!exam) {
      return Result.fail(
        new DomainError(
          "Modul ujian CBT Moodle tidak ditemukan",
          404,
          "EXAM_NOT_FOUND",
        ),
      );
    }

    // 3. Resolve active attempt or register attempt
    let activeAttempt = await this.authRepository.findActiveAttempt(
      user.id,
      exam.id,
    );

    if (activeAttempt) {
      // Evaluate Single-Device Binding
      const ruleResult = SingleDeviceRule.evaluate({
        incomingDeviceHash: deviceHash,
        boundDeviceHash: activeAttempt.deviceHash,
      });

      if (ruleResult.isFailure) {
        return Result.fail(ruleResult.error);
      }

      if (!activeAttempt.deviceHash && deviceHash) {
        await this.authRepository.updateAttemptDeviceBinding(
          activeAttempt.id,
          deviceHash,
          ipAddress,
        );
      }
    } else {
      // Create new initial attempt record
      const created = await this.authRepository.createAttemptIfNotExists({
        examId: exam.id,
        userId: user.id,
        deviceHash,
        ipAddress,
      });
      activeAttempt = {
        id: created.id,
        examId: exam.id,
        deviceHash,
        status: "IN_PROGRESS",
      };
    }

    // 4. Issue authenticated session token
    const token = await this.jwtProvider.signToken(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        attemptId: activeAttempt.id,
        cbtId: exam.moodleCbtId,
      },
      "12h",
    );

    return Result.ok({
      token,
      user: user.toDTO(),
      examId: exam.id,
      attemptId: activeAttempt.id,
      redirectUrl: `/student/lobby/${exam.id}`,
    });
  }
}
