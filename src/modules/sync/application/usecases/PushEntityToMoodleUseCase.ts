import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  OutboundSyncResult,
  PushEntityInput,
} from "../../domain/dto/SyncDTO";
import type { SyncRepositoryInterface } from "../../domain/interfaces/SyncRepositoryInterface";

export class PushEntityToMoodleUseCase
  implements BaseUseCase<PushEntityInput, OutboundSyncResult, AppError>
{
  constructor(private readonly syncRepository: SyncRepositoryInterface) {}

  public async execute(
    input: PushEntityInput,
  ): Promise<Result<OutboundSyncResult, AppError>> {
    switch (input.type) {
      case "class":
        return Result.ok(
          await this.syncRepository.pushClassToMoodle(input.data),
        );
      case "student":
        return Result.ok(
          await this.syncRepository.pushStudentToMoodle(input.data),
        );
      case "subject":
        return Result.ok(
          await this.syncRepository.pushSubjectToMoodle(input.data),
        );
      case "exam":
        return Result.ok(
          await this.syncRepository.pushExamToMoodle(input.data),
        );
      case "question":
        return Result.ok(
          await this.syncRepository.pushQuestionToMoodle(input.data),
        );
    }
  }

  public async pushById(
    entity: "class" | "student" | "subject" | "exam" | "question",
    id: string,
  ): Promise<Result<OutboundSyncResult, AppError>> {
    return Result.ok(
      await this.syncRepository.findLocalEntityForPush(entity, id),
    );
  }
}
