import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ExamSnapshotDTO } from "../../domain/dto/ExamSnapshotDTO";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";

export interface GetExamSnapshotInput {
  examId: string;
  checkWindow?: boolean;
  serverTimestamp?: number;
}

export class GetExamSnapshotUseCase
  implements BaseUseCase<GetExamSnapshotInput, ExamSnapshotDTO, AppError>
{
  constructor(private readonly examRepository: ExamRepositoryInterface) {}

  public async execute(
    input: GetExamSnapshotInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    const { examId, checkWindow = false, serverTimestamp } = input;

    // 1. Fetch exam entity
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      return Result.fail(
        new DomainError(
          `Ujian dengan ID '${examId}' tidak ditemukan`,
          404,
          "EXAM_NOT_FOUND",
        ),
      );
    }

    // 2. Optional: verify exam schedule window
    if (checkWindow) {
      const now = new Date();
      if (now < exam.timeOpen) {
        return Result.fail(
          new DomainError(
            "Sesi ujian ini belum dibuka. Silakan tunggu jadwal pelaksanaan.",
            403,
            "EXAM_NOT_OPEN",
            { timeOpen: exam.timeOpen },
          ),
        );
      }

      if (now > exam.timeClose) {
        return Result.fail(
          new DomainError("Sesi ujian ini telah ditutup.", 403, "EXAM_CLOSED", {
            timeClose: exam.timeClose,
          }),
        );
      }
    }

    // 3. Return client-safe snapshot (strict: answerKeys are stripped)
    return Result.ok(exam.toClientSnapshotDTO(serverTimestamp));
  }
}
