export interface ExamCardItemDTO {
  studentId: string;
  nisn: string;
  fullName: string;
  className: string;
  roomCode: string;
  seatNumber: string;
  examTitle: string;
  sessionTime: string;
  verificationCode: string;
}

export interface ExamCardsQueryDTO {
  classGroupId?: string;
  examId?: string;
}

export interface ExamCardsResponseDTO {
  cards: ExamCardItemDTO[];
  total: number;
}
