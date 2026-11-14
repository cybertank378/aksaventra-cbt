import { createHash } from "node:crypto";
import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  CreateExamInput,
  ExamSnapshotDTO,
} from "../../domain/dto/ExamSnapshotDTO";
import { ExamEntity } from "../../domain/entities/ExamEntity";
import { QuestionItemEntity } from "../../domain/entities/QuestionItemEntity";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";

export class CreateExamUseCase
  implements BaseUseCase<CreateExamInput, ExamSnapshotDTO, AppError>
{
  constructor(private readonly examRepository: ExamRepositoryInterface) {}

  public async execute(
    input: CreateExamInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    const questionEntities = input.questions.map(
      (q) =>
        new QuestionItemEntity({
          slot: q.slot,
          questionId: q.questionId,
          type: q.type,
          stemHtml: q.stemHtml,
          options: q.options,
        }),
    );

    // Compute deterministic snapshot hash (SHA-256 of questions payload)
    const questionsString = JSON.stringify(input.questions);
    const snapshotHash = createHash("sha256")
      .update(questionsString)
      .digest("hex");

    const examEntity = new ExamEntity({
      id: crypto.randomUUID(),
      moodleCbtId: input.moodleCbtId,
      title: input.title,
      courseName: input.courseName,
      durationSeconds: input.durationSeconds,
      maxStrikes: input.maxStrikes,
      sebRequired: input.sebRequired,
      sebConfigKey: input.sebConfigKey,
      activeToken: input.activeToken,
      tokenExpiresAt: input.tokenExpiresAt,
      snapshotHash,
      questions: questionEntities,
      timeOpen: input.timeOpen,
      timeClose: input.timeClose,
    });

    const saved = await this.examRepository.save(examEntity, input.answerKeys);
    return Result.ok(saved.toClientSnapshotDTO());
  }
}
