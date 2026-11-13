import type { FC } from "react";
import type {
  ExamCardItemDTO,
  ExamCardSettings,
} from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";

interface Props {
  card: ExamCardItemDTO;
  settings?: ExamCardSettings;
}

export const ExamCardItem: FC<Props> = ({
  card,
  settings = DEFAULT_EXAM_CARD_SETTINGS,
}) => {
  // Participant number: seatNumber or NISN
  const participantNo = card.seatNumber || (card.nisn ? `P${card.nisn}` : "-");

  // Password / Token: clean short verification code
  const password =
    card.password ||
    (card.verificationCode?.length > 10
      ? card.verificationCode.slice(0, 8)
      : card.verificationCode || "-");

  return (
    <div className="relative bg-white p-6 border-2 border-black shadow-sm font-serif text-black leading-snug w-full transition hover:shadow-md">
      {/* Judul Kartu Peserta (Centered) */}
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
          {settings.cardHeaderTitle || "KARTU PESERTA"}
        </h2>
        <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">
          {settings.examTitle || card.examTitle || "ASESMEN SUMATIF AKHIR TAHUN"}
        </h3>
        {settings.academicYear && (
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wide">
            TAHUN PELAJARAN {settings.academicYear}
          </p>
        )}
      </div>

      {/* Data Siswa (Left aligned with aligned colons) */}
      <div className="text-xs sm:text-sm space-y-2.5 max-w-md mx-auto">
        <div className="grid grid-cols-[130px_16px_1fr] items-baseline">
          <span className="font-normal">Nomor Peserta</span>
          <span>:</span>
          <span className="font-bold">{participantNo}</span>
        </div>

        <div className="grid grid-cols-[130px_16px_1fr] items-baseline">
          <span className="font-normal">Password</span>
          <span>:</span>
          <span className="font-medium font-mono">{password}</span>
        </div>

        <div className="grid grid-cols-[130px_16px_1fr] items-baseline">
          <span className="font-normal">Nama Siswa</span>
          <span>:</span>
          <span className="font-bold uppercase">{card.fullName}</span>
        </div>

        <div className="grid grid-cols-[130px_16px_1fr] items-baseline">
          <span className="font-normal">Kelas / Ruang</span>
          <span>:</span>
          <span className="font-medium">
            {card.className} / {card.roomCode}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExamCardItem;
