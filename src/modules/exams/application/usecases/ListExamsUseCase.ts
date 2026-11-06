import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type { ExamEntity } from "../../domain/entities/ExamEntity";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";

export class ListExamsUseCase
  implements BaseUseCase<void, ExamEntity[], AppError>
{
  constructor(private readonly examRepository: ExamRepositoryInterface) {}

  public async execute(): Promise<Result<ExamEntity[], AppError>> {
    const exams = this.examRepository.findAll
      ? await this.examRepository.findAll()
      : [];
    return Result.ok(exams);
  }
}
