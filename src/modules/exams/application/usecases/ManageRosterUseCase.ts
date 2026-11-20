import { prisma } from "@/libs/prisma";
import {
  formatStoredRoomAndSeat,
  parseStoredRoomAndSeat,
} from "@/libs/roomSeatUtils";
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
      const fallbackSeat = `M-${padded}`;
      const { roomCode, seatNumber } = parseStoredRoomAndSeat(
        att.user.roomCode,
        fallbackSeat,
      );

      return {
        attemptId: att.id,
        studentId: att.user.id,
        username: att.user.username,
        fullName: att.user.fullName,
        className: att.user.className,
        roomCode,
        seatNumber: seatNumber || fallbackSeat,
        status: att.status as ExamParticipantDTO["status"],
        score: att.finalScore,
        assignedAt: att.createdAt.toISOString(),
      };
    });
  }

  async updateSeatNumber(input: UpdateSeatNumberInputDTO): Promise<boolean> {
    const { studentId, roomCode, seatNumber } = input;
    try {
      await prisma.user.update({
        where: { id: studentId },
        data: { roomCode: formatStoredRoomAndSeat(roomCode, seatNumber) },
      });
      return true;
    } catch {
      return false;
    }
  }
}
