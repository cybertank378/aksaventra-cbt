import { prisma } from "@/libs/prisma";
import { parseStoredRoomAndSeat } from "@/libs/roomSeatUtils";
import type {
  ExamCardItemDTO,
  ExamCardsQueryDTO,
} from "../../domain/dto/ExamCardDTO";

export class GenerateExamCardsUseCase {
  async execute(query?: ExamCardsQueryDTO): Promise<ExamCardItemDTO[]> {
    const whereClause: {
      role: "STUDENT";
      classGroupId?: string;
    } = {
      role: "STUDENT",
    };

    if (query?.classGroupId && query.classGroupId !== "ALL") {
      whereClause.classGroupId = query.classGroupId;
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        classGroup: true,
      },
      orderBy: [{ className: "asc" }, { fullName: "asc" }],
    });

    let examTitle = "Penilaian Akhir Semester (PAS) CBT";
    if (query?.examId && query.examId !== "ALL") {
      const exam = await prisma.exam.findUnique({
        where: { id: query.examId },
      });
      if (exam) {
        examTitle = exam.title;
      }
    }

    return students.map((s, idx) => {
      const fallbackSeat = idx + 1 < 10 ? `M-0${idx + 1}` : `M-${idx + 1}`;
      const { roomCode, seatNumber } = parseStoredRoomAndSeat(
        s.roomCode,
        fallbackSeat,
      );
      const hash = `${s.username}-${s.id.slice(0, 4)}`.toUpperCase();

      const resolvedClassName =
        s.classGroup?.name || s.className || "Kelas Reguler";

      return {
        studentId: s.id,
        username: s.username,
        nisn: s.username,
        fullName: s.fullName,
        className: resolvedClassName,
        roomCode,
        seatNumber: seatNumber || fallbackSeat,
        examTitle,
        sessionTime: "07:30 - 09:30 WIB",
        verificationCode: `AKSA-${hash}`,
      };
    });
  }
}
