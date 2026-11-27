export interface ExamCardItemDTO {
  studentId: string;
  username?: string;
  nisn: string;
  fullName: string;
  className: string;
  roomCode: string;
  seatNumber: string;
  examTitle: string;
  sessionTime: string;
  verificationCode: string;
  password?: string;
}

export interface ExamCardsQueryDTO {
  classGroupId?: string;
  examId?: string;
}

export interface ExamCardsResponseDTO {
  cards: ExamCardItemDTO[];
  total: number;
}

export interface ExamScheduleItem {
  dayDate: string;
  subjects: Array<{
    name: string;
    time: string;
  }>;
}

export interface ExamCardSettings {
  governmentText: string;
  departmentText: string;
  institutionName: string;
  address: string;
  contactText: string;
  postalCode: string;
  logoUrl?: string;
  stampUrl?: string;
  showStamp: boolean;

  cardHeaderTitle: string;
  examTitle: string;
  academicYear: string;

  signerTitle: string;
  signerName: string;
  signerNip: string;

  schedule: ExamScheduleItem[];
  cardsPerPage: 2 | 4 | 6;
}

export const DEFAULT_EXAM_CARD_SETTINGS: ExamCardSettings = {
  governmentText: "PEMERINTAH DAERAH PROVINSI",
  departmentText: "DINAS PENDIDIKAN",
  institutionName: "SMA NEGERI 1 AKSAVENTRA",
  address: "Jl. Pendidikan Nasional No. 45",
  contactText: "Telepon (021) 7890123 • E-mail : info@aksaventra.sch.id",
  postalCode: "12345",
  logoUrl: "/assets/images/logo/web-app-manifest-192x192.png",
  stampUrl: undefined,
  showStamp: false,

  cardHeaderTitle: "KARTU PESERTA",
  examTitle: "ASESMEN SUMATIF AKHIR SEMESTER (ASAS)",
  academicYear: "2026/2027",

  signerTitle: "Kepala Sekolah,",
  signerName: "Drs. H. Mulyadi, M.Pd",
  signerNip: "19750812 200003 1 002",

  // Blank schedule rows: without hardcoded subjects and times
  schedule: [
    {
      dayDate: "",
      subjects: [
        { name: "", time: "" },
        { name: "", time: "" },
      ],
    },
    {
      dayDate: "",
      subjects: [
        { name: "", time: "" },
        { name: "", time: "" },
      ],
    },
    {
      dayDate: "",
      subjects: [
        { name: "", time: "" },
        { name: "", time: "" },
      ],
    },
    {
      dayDate: "",
      subjects: [
        { name: "", time: "" },
        { name: "", time: "" },
      ],
    },
    {
      dayDate: "",
      subjects: [
        { name: "", time: "" },
        { name: "", time: "" },
      ],
    },
  ],

  cardsPerPage: 6, // 2 columns x 3 rows (6 kartu per lembar A4)
};
