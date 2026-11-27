import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  SyncCounts,
  SyncResult,
  TriggerSyncInput,
} from "../../domain/dto/SyncDTO";
import type { SyncRepositoryInterface } from "../../domain/interfaces/SyncRepositoryInterface";

function emptyCounts(): SyncCounts {
  return {
    courses: 0,
    classes: 0,
    students: 0,
    exams: 0,
    questions: 0,
  };
}

export class PullMoodleMasterDataUseCase
  implements BaseUseCase<TriggerSyncInput, SyncResult, AppError>
{
  constructor(private readonly syncRepository: SyncRepositoryInterface) {}

  public async execute(
    input: TriggerSyncInput = { entity: "all" },
  ): Promise<Result<SyncResult, AppError>> {
    const entity = input.entity ?? "all";
    const counts = emptyCounts();
    const errors: string[] = [];

    try {
      switch (entity) {
        case "course": {
          const payload =
            await this.syncRepository.pullFromMoodle("pull_courses");
          counts.courses = await this.syncRepository.upsertCourses(
            payload.courses ?? [],
          );
          break;
        }
        case "cohort": {
          const payload =
            await this.syncRepository.pullFromMoodle("pull_classes");
          counts.classes = await this.syncRepository.upsertClasses(
            payload.classes ?? [],
          );
          break;
        }
        case "user":
        case "cohort_member": {
          const payload =
            await this.syncRepository.pullFromMoodle("pull_students");
          counts.students = await this.syncRepository.upsertStudents(
            payload.students ?? [],
          );
          break;
        }
        case "cbt": {
          const payload =
            await this.syncRepository.pullFromMoodle("pull_exams");
          counts.exams = await this.syncRepository.upsertExams(
            payload.exams ?? [],
          );
          break;
        }
        case "question": {
          const payload =
            await this.syncRepository.pullFromMoodle("pull_questions");
          counts.questions = await this.syncRepository.upsertQuestions(
            payload.questions ?? [],
          );
          break;
        }
        default: {
          const payload = await this.syncRepository.pullFromMoodle("pull_all");
          if (Array.isArray(payload.errors) && payload.errors.length > 0) {
            errors.push(...payload.errors);
          }

          const runStep = async (
            label: string,
            fn: () => Promise<number>,
          ): Promise<number> => {
            try {
              return await fn();
            } catch (stepErr) {
              errors.push(
                `${label}: ${stepErr instanceof Error ? stepErr.message : "Sync step failed"}`,
              );
              return 0;
            }
          };

          counts.courses = await runStep("courses", () =>
            this.syncRepository.upsertCourses(payload.courses ?? []),
          );
          counts.classes = await runStep("classes", () =>
            this.syncRepository.upsertClasses(payload.classes ?? []),
          );
          counts.students = await runStep("students", () =>
            this.syncRepository.upsertStudents(payload.students ?? []),
          );
          counts.exams = await runStep("exams", () =>
            this.syncRepository.upsertExams(payload.exams ?? []),
          );
          counts.questions = await runStep("questions", () =>
            this.syncRepository.upsertQuestions(payload.questions ?? []),
          );
          break;
        }
      }
    } catch (err) {
      errors.push(
        err instanceof Error
          ? err.message
          : "Failed to pull master data from Moodle",
      );
    }

    return Result.ok({
      success: errors.length === 0,
      counts,
      syncedAt: new Date().toISOString(),
      errors,
    });
  }
}
