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
    <div className="relative bg-white p-5 border-2 border-black shadow-xs font-serif text-black leading-snug w-full transition hover:shadow-md">
      {/* Judul Kartu Peserta (Centered) */}
      <div className="text-center mb-4 space-y-0.5">
        <h2 className="text-sm font-bold uppercase tracking-wider">
          {settings.cardHeaderTitle || "KARTU PESERTA"}
        </h2>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
          {settings.examTitle || card.examTitle || "ASESMEN SUMATIF AKHIR TAHUN"}
        </h3>
        {settings.academicYear && (
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            TAHUN PELAJARAN {settings.academicYear}
          </p>
        )}
      </div>

      {/* Data Siswa (Left aligned with aligned colons) */}
      <div className="text-xs space-y-2">
        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Nomor Peserta</span>
          <span>:</span>
          <span className="font-bold">{participantNo}</span>
        </div>

        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Password</span>
          <span>:</span>
          <span className="font-medium font-mono">{password}</span>
        </div>

        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Nama Siswa</span>
          <span>:</span>
          <span className="font-bold uppercase truncate" title={card.fullName}>
            {card.fullName}
          </span>
        </div>

        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Kelas / Ruang</span>
          <span>:</span>
          <span className="font-medium truncate" title={`${card.className} / ${card.roomCode}`}>
            {card.className} / {card.roomCode}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExamCardItem;
