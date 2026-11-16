import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";

export class DeleteExamUseCase
  implements BaseUseCase<{ id: string }, boolean, AppError>
{
  constructor(private readonly examRepository: ExamRepositoryInterface) {}

  public async execute(input: {
    id: string;
  }): Promise<Result<boolean, AppError>> {
    const existing = await this.examRepository.findById(input.id);
    if (!existing) {
      return Result.fail(
        new DomainError(
          `Ujian dengan ID '${input.id}' tidak ditemukan`,
          404,
          "EXAM_NOT_FOUND",
        ),
      );
    }

    const deleted = Boolean(await this.examRepository.deleteExam?.(input.id));
    return Result.ok(deleted);
  }
}
