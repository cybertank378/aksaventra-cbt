import { prisma } from "@/libs/prisma";
import type { ExamScheduleInputDTO } from "../../domain/dto/ExamRosterDTO";
import type { ExamSnapshotDTO } from "../../domain/dto/ExamSnapshotDTO";

export class ManageScheduleUseCase {
  async createSchedule(input: ExamScheduleInputDTO): Promise<ExamSnapshotDTO> {
    const durationSeconds = input.durationMinutes * 60;
    const tokenExpiresAt = new Date(
      Date.now() + (input.tokenExpiresMinutes || 120) * 60 * 1000,
    );
    const moodleCbtId = Math.floor(1000 + Math.random() * 9000);

    const created = await prisma.exam.create({
      data: {
        moodleCbtId,
        title: input.title,
        courseName: input.courseName,
        durationSeconds,
        maxStrikes: input.maxStrikes || 3,
        sebRequired: input.sebRequired || false,
        activeToken: input.activeToken.toUpperCase(),
        tokenExpiresAt,
        timeOpen: new Date(input.timeOpen),
        timeClose: new Date(input.timeClose),
        questionsJson: [],
        answerKeysJson: {},
      },
    });

    return {
      examId: created.id,
      moodleCbtId: created.moodleCbtId,
      title: created.title,
      courseName: created.courseName,
      durationSeconds: created.durationSeconds,
      maxStrikes: created.maxStrikes,
      sebRequired: created.sebRequired,
      sebConfigKey: created.sebConfigKey,
      serverTimestamp: Math.floor(Date.now() / 1000),
      questions: [],
    };
  }

  async updateSchedule(
    id: string,
    input: Partial<ExamScheduleInputDTO>,
  ): Promise<boolean> {
    try {
      const dataToUpdate: Record<string, unknown> = {};
      if (input.title) dataToUpdate.title = input.title;
      if (input.courseName) dataToUpdate.courseName = input.courseName;
      if (input.durationMinutes) {
        dataToUpdate.durationSeconds = input.durationMinutes * 60;
      }
      if (input.maxStrikes !== undefined) {
        dataToUpdate.maxStrikes = input.maxStrikes;
      }
      if (input.activeToken) {
        dataToUpdate.activeToken = input.activeToken.toUpperCase();
      }
      if (input.timeOpen) dataToUpdate.timeOpen = new Date(input.timeOpen);
      if (input.timeClose) dataToUpdate.timeClose = new Date(input.timeClose);

      await prisma.exam.update({
        where: { id },
        data: dataToUpdate,
      });

      return true;
    } catch {
      return false;
    }
  }
}
