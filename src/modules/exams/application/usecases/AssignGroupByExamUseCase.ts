import { prisma } from "@/libs/prisma";
import { formatStoredRoomAndSeat } from "@/libs/roomSeatUtils";
import { moodleSyncService } from "@/modules/sync/application/MoodleSyncService";
import type {
  AssignGroupInputDTO,
  ExamParticipantDTO,
} from "../../domain/dto/ExamRosterDTO";

export class AssignGroupByExamUseCase {
  async execute(input: AssignGroupInputDTO): Promise<ExamParticipantDTO[]> {
    const {
      examId,
      classGroupIds,
      roomCode = "LAB-01",
      seatPrefix = "M",
    } = input;

    // 1. Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!exam) {
      throw new Error(`Ujian dengan ID ${examId} tidak ditemukan.`);
    }

    // 2. Fetch all students belonging to the target class groups
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        classGroupId: { in: classGroupIds },
      },
      orderBy: [{ className: "asc" }, { username: "asc" }],
    });

    if (students.length === 0) {
      return [];
    }

    const assignedParticipants: ExamParticipantDTO[] = [];

    // 3. Sequential seat assignment and roster generation
    let seatIndex = 1;
    for (const student of students) {
      const paddedIndex = seatIndex < 10 ? `0${seatIndex}` : `${seatIndex}`;
      const seatNumber = `${seatPrefix}-${paddedIndex}`;

      // Update student's current room and seat assignment
      await prisma.user.update({
        where: { id: student.id },
        data: { roomCode: formatStoredRoomAndSeat(roomCode, seatNumber) },
      });

      // Upsert attempt / roster entry
      const existingAttempt = await prisma.attempt.findUnique({
        where: {
          examId_userId: {
            examId,
            userId: student.id,
          },
        },
      });

      let attemptId = existingAttempt?.id;
      let status = existingAttempt?.status || "IN_PROGRESS";

      if (!existingAttempt) {
        const createdAttempt = await prisma.attempt.create({
          data: {
            examId,
            userId: student.id,
            status: "IN_PROGRESS",
            deviceHash: "unbound",
            ipAddress: "0.0.0.0",
            questionOrder: [],
            answersJson: {},
          },
        });
        attemptId = createdAttempt.id;
        status = createdAttempt.status;
      }

      assignedParticipants.push({
        attemptId,
        studentId: student.id,
        username: student.username,
        fullName: student.fullName,
        className: student.className,
        roomCode,
        seatNumber,
        status: status as ExamParticipantDTO["status"],
        assignedAt: new Date().toISOString(),
      });

      seatIndex++;
    }

    if (process.env.NODE_ENV !== "test") {
      const targetClasses = await prisma.classGroup
        .findMany({
          where: { id: { in: classGroupIds } },
          select: { moodleId: true },
        })
        .catch(() => []);
      const cohortMoodleIds = targetClasses
        .map((c) => c.moodleId)
        .filter((id): id is number => typeof id === "number" && id > 0);
      const userMoodleIds = students
        .map((s) => s.moodleUserId)
        .filter((id): id is number => typeof id === "number" && id > 0);

      void moodleSyncService.enrollStudentsInMoodle({
        courseName: exam.courseName,
        moodleCbtId: exam.moodleCbtId,
        cohortMoodleIds,
        userMoodleIds,
        roomCode,
        seatPrefix,
      });
    }

    return assignedParticipants;
  }
}
