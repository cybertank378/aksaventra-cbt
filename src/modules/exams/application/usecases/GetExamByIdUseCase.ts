import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ExamEntity } from "../../domain/entities/ExamEntity";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";

export interface GetExamByIdInput {
  id: string;
}

export class GetExamByIdUseCase
  implements BaseUseCase<GetExamByIdInput, ExamEntity, AppError>
{
  constructor(private readonly examRepository: ExamRepositoryInterface) {}

  public async execute(
    input: GetExamByIdInput,
  ): Promise<Result<ExamEntity, AppError>> {
    const exam = await this.examRepository.findById(input.id);
    if (!exam) {
      return Result.fail(
        new DomainError(
          `Ujian dengan ID '${input.id}' tidak ditemukan`,
          404,
          "EXAM_NOT_FOUND",
        ),
      );
    }
    return Result.ok(exam);
  }
}
