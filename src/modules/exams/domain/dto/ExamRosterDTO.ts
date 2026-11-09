export interface ExamParticipantDTO {
  attemptId?: string;
  studentId: string;
  username: string; // NIS
  fullName: string;
  className?: string | null;
  roomCode: string;
  seatNumber: string; // e.g. "M-01", "M-02"
  status: "NOT_STARTED" | "IN_PROGRESS" | "LOCKED" | "SUBMITTED" | "ABANDONED";
  score?: number | null;
  assignedAt: string;
}

export interface AssignGroupInputDTO {
  examId: string;
  classGroupIds: string[];
  roomCode?: string; // Default e.g. "LAB-01"
  seatPrefix?: string; // Default e.g. "M"
}

export interface UpdateSeatNumberInputDTO {
  examId: string;
  studentId: string;
  roomCode: string;
  seatNumber: string;
}

export interface ExamScheduleInputDTO {
  title: string;
  courseName: string;
  durationMinutes: number;
  maxStrikes: number;
  timeOpen: string; // ISO date string
  timeClose: string; // ISO date string
  activeToken: string;
  tokenExpiresMinutes?: number;
  sebRequired?: boolean;
}
