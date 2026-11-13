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

export interface ExamCardSettings {
  institutionName: string;
  subHeader: string;
  address: string;
  logoUrl?: string;
  examTitle: string;
  academicYear: string;
  city: string;
  dateStr: string;
  signerTitle: string;
  signerName: string;
  signerNip: string;
  cardsPerPage: 2 | 4;
}

export const DEFAULT_EXAM_CARD_SETTINGS: ExamCardSettings = {
  institutionName: "SMA NEGERI 1 AKSAVENTRA",
  subHeader: "ASESMEN SUMATIF AKHIR SEMESTER (ASAS)",
  address: "Jl. Pendidikan Nasional No. 45, Telp: (021) 7890123",
  examTitle: "Ujian CBT Berbasis Komputer",
  academicYear: "2026/2027",
  city: "Jakarta",
  dateStr: "13 November 2026",
  signerTitle: "Kepala Sekolah",
  signerName: "Drs. H. Mulyadi, M.Pd",
  signerNip: "19750812 200003 1 002",
  cardsPerPage: 4,
};
