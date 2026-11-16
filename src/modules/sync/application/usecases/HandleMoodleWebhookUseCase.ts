import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  MoodleWebhookPayload,
  SyncCounts,
  SyncResult,
} from "../../domain/dto/SyncDTO";
import type { SyncRepositoryInterface } from "../../domain/interfaces/SyncRepositoryInterface";
import type { PullMoodleMasterDataUseCase } from "./PullMoodleMasterDataUseCase";

function emptyCounts(): SyncCounts {
  return {
    courses: 0,
    classes: 0,
    students: 0,
    exams: 0,
    questions: 0,
  };
}

export class HandleMoodleWebhookUseCase
  implements BaseUseCase<MoodleWebhookPayload, SyncResult, AppError>
{
  constructor(
    private readonly syncRepository: SyncRepositoryInterface,
    private readonly pullMasterDataUseCase: PullMoodleMasterDataUseCase,
  ) {}

  public async execute(
    event: MoodleWebhookPayload,
  ): Promise<Result<SyncResult, AppError>> {
    const counts = emptyCounts();
    const errors: string[] = [];

    try {
      if (event.action === "deleted" && event.objectId > 0) {
        await this.syncRepository.deleteEntity(event.entity, event.objectId);
        return Result.ok({
          success: true,
          counts,
          syncedAt: new Date().toISOString(),
          errors,
        });
      }

      if (event.entity === "cohort_member") {
        const classRes = await this.pullMasterDataUseCase.execute({
          entity: "cohort",
        });
        const studentRes = await this.pullMasterDataUseCase.execute({
          entity: "user",
        });

        const mergedErrors = [
          ...(classRes.isSuccess ? classRes.value.errors : []),
          ...(studentRes.isSuccess ? studentRes.value.errors : []),
        ];

        return Result.ok({
          success: mergedErrors.length === 0,
          counts: {
            ...counts,
            classes: classRes.isSuccess ? classRes.value.counts.classes : 0,
            students: studentRes.isSuccess
              ? studentRes.value.counts.students
              : 0,
          },
          syncedAt: new Date().toISOString(),
          errors: mergedErrors,
        });
      }

      return await this.pullMasterDataUseCase.execute({
        entity: event.entity,
      });
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : "Webhook sync processing failed",
      );
      return Result.ok({
        success: false,
        counts,
        syncedAt: new Date().toISOString(),
        errors,
      });
    }
  }
}
