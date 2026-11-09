export interface StudentScoreRecordDTO {
  attemptId: string;
  studentId: string;
  username: string; // NIS
  fullName: string;
  className: string;
  roomCode: string;
  seatNumber: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "LOCKED" | "ABANDONED";
  durationSpentMinutes: number;
  finalScore: number;
  isPassed: boolean;
  violationCount: number;
  submittedAt?: string | null;
}

export interface ExamRecapitulationDTO {
  examId: string;
  examTitle: string;
  courseName: string;
  passingGrade: number; // KKM default 75.0
  totalParticipants: number;
  submittedCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
  records: StudentScoreRecordDTO[];
}
