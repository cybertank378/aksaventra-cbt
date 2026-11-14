import { prisma } from "@/libs/prisma";
import type {
  ExamParticipantDTO,
  UpdateSeatNumberInputDTO,
} from "../../domain/dto/ExamRosterDTO";

export class ManageRosterUseCase {
  async getExamParticipants(examId: string): Promise<ExamParticipantDTO[]> {
    const attempts = await prisma.attempt.findMany({
      where: { examId },
      include: {
        user: true,
      },
      orderBy: { user: { username: "asc" } },
    });

    return attempts.map((att, index) => {
      const padded = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
      const seatNumber = `M-${padded}`;

      return {
        attemptId: att.id,
        studentId: att.user.id,
        username: att.user.username,
        fullName: att.user.fullName,
        className: att.user.className,
        roomCode: att.user.roomCode || "LAB-01",
        seatNumber,
        status: att.status as ExamParticipantDTO["status"],
        score: att.finalScore,
        assignedAt: att.createdAt.toISOString(),
      };
    });
  }

  async updateSeatNumber(input: UpdateSeatNumberInputDTO): Promise<boolean> {
    const { studentId, roomCode } = input;
    try {
      await prisma.user.update({
        where: { id: studentId },
        data: { roomCode },
      });
      return true;
    } catch {
      return false;
    }
  }
}
