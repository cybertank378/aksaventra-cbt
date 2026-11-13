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
  cardsPerPage: 1 | 2;
}

export const DEFAULT_EXAM_CARD_SETTINGS: ExamCardSettings = {
  governmentText: "PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA",
  departmentText: "DINAS PENDIDIKAN",
  institutionName: "SEKOLAH MENENGAH PERTAMA NEGERI 29",
  address: "Jl. Bumi Blok E Kebayoran Baru Jakarta Selatan",
  contactText: "Telepon (021) 7247493 Fax. (021) 7206336 E-mail : smpn29jkt@yahoo.com",
  postalCode: "12120",
  logoUrl: undefined,
  stampUrl: undefined,
  showStamp: true,

  cardHeaderTitle: "KARTU PESERTA",
  examTitle: "ASESMEN SUMATIF AKHIR TAHUN",
  academicYear: "2023/2024",

  signerTitle: "Kepala SMP Negeri 29 Jakarta,",
  signerName: "Abdul Malik, M.Si",
  signerNip: "196505141989032005",

  schedule: [
    {
      dayDate: "Senin,\n4 Maret 2024",
      subjects: [
        { name: "PEND. PANCASILA", time: "07.00 – 09.00" },
        { name: "INFORMATIKA", time: "09.30 – 11.30" },
      ],
    },
    {
      dayDate: "Selasa,\n5 Maret 2024",
      subjects: [
        { name: "PJOK", time: "07.00 – 09.00" },
        { name: "IPA", time: "09.30 – 11.30" },
      ],
    },
    {
      dayDate: "Rabu,\n6 Maret 2024",
      subjects: [
        { name: "PRAKARYA", time: "07.00 – 09.00" },
        { name: "MATEMATIKA", time: "09.30 – 11.30" },
      ],
    },
    {
      dayDate: "Kamis,\n7 Maret 2024",
      subjects: [
        { name: "B. INDONESIA", time: "07.00 – 09.00" },
        { name: "PEND. AGAMA", time: "09.30 – 11.30" },
      ],
    },
    {
      dayDate: "Jum'at,\n8 Maret 2024",
      subjects: [
        { name: "B. INGGRIS", time: "07.00 – 09.00" },
        { name: "IPS", time: "09.30 – 11.30" },
      ],
    },
  ],

  cardsPerPage: 2,
};
