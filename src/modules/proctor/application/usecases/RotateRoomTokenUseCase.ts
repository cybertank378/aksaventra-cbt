import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  RotateRoomTokenInputDTO,
  RotateRoomTokenResponseDTO,
} from "../../domain/dto/ProctorActionDTO";
import type { ProctorRepositoryInterface } from "../../domain/interfaces/ProctorRepositoryInterface";

const BASE32_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateBase32Token(length = 6): string {
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE32_ALPHABET.length);
    token += BASE32_ALPHABET[randomIndex];
  }
  return token;
}

export class RotateRoomTokenUseCase
  implements
    BaseUseCase<RotateRoomTokenInputDTO, RotateRoomTokenResponseDTO, AppError>
{
  constructor(private readonly proctorRepo: ProctorRepositoryInterface) {}

  public async execute(
    input: RotateRoomTokenInputDTO,
  ): Promise<Result<RotateRoomTokenResponseDTO, AppError>> {
    const examMeta = await this.proctorRepo.getExamMetadata(input.examId);
    if (!examMeta) {
      return Result.fail(DomainError.notFound("Exam", input.examId));
    }

    const token =
      input.manualToken && input.manualToken.trim().length > 0
        ? input.manualToken.trim().toUpperCase()
        : generateBase32Token(6);

    const expiresInSeconds = input.expiresInSeconds ?? 900; // 15 mins
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.proctorRepo.updateExamToken(input.examId, token, expiresAt);

    return Result.ok({
      examId: input.examId,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  }
}
