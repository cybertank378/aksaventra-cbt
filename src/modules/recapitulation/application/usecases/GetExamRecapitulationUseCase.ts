import { prisma } from "@/libs/prisma";
import type {
  ExamRecapitulationDTO,
  StudentScoreRecordDTO,
} from "../../domain/dto/RecapitulationDTO";

export class GetExamRecapitulationUseCase {
  async execute(
    examId: string,
    passingGrade = 75.0,
  ): Promise<ExamRecapitulationDTO> {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        attempts: {
          include: {
            user: true,
            violationLogs: true,
          },
          orderBy: { finalScore: "desc" },
        },
      },
    });

    if (!exam) {
      throw new Error(`Ujian dengan ID ${examId} tidak ditemukan.`);
    }

    const records: StudentScoreRecordDTO[] = exam.attempts.map((att, idx) => {
      const paddedSeat = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
      const seatNumber = `M-${paddedSeat}`;

      const startedMs = new Date(att.startedAt).getTime();
      const finishedMs = att.finishedAt
        ? new Date(att.finishedAt).getTime()
        : Date.now();
      const durationSpentMinutes = Math.max(
        1,
        Math.round((finishedMs - startedMs) / 60000),
      );

      const score =
        att.finalScore !== null && att.finalScore !== undefined
          ? Number(att.finalScore.toFixed(2))
          : 0;

      return {
        attemptId: att.id,
        studentId: att.user.id,
        username: att.user.username,
        fullName: att.user.fullName,
        className: att.user.className || "Umum",
        roomCode: att.user.roomCode || "LAB-01",
        seatNumber,
        status: att.status as StudentScoreRecordDTO["status"],
        durationSpentMinutes,
        finalScore: score,
        isPassed: score >= passingGrade,
        violationCount: att.violationLogs.length,
        submittedAt: att.finishedAt ? att.finishedAt.toISOString() : null,
      };
    });

    const totalParticipants = records.length;
    const submittedCount = records.filter(
      (r) => r.status === "SUBMITTED",
    ).length;

    const scores = records.map((r) => r.finalScore);
    const averageScore =
      scores.length > 0
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
        : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const passedCount = records.filter((r) => r.isPassed).length;
    const failedCount = totalParticipants - passedCount;
    const passPercentage =
      totalParticipants > 0
        ? Number(((passedCount / totalParticipants) * 100).toFixed(1))
        : 0;

    return {
      examId: exam.id,
      examTitle: exam.title,
      courseName: exam.courseName,
      passingGrade,
      totalParticipants,
      submittedCount,
      averageScore,
      highestScore,
      lowestScore,
      passedCount,
      failedCount,
      passPercentage,
      records,
    };
  }
}
