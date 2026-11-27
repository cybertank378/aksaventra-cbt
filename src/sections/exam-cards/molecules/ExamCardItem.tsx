import type { FC } from "react";
import type {
  ExamCardItemDTO,
  ExamCardSettings,
} from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";

interface Props {
  card: ExamCardItemDTO;
  settings?: ExamCardSettings;
  viewMode?: "grid" | "list";
}

export const ExamCardItem: FC<Props> = ({
  card,
  settings = DEFAULT_EXAM_CARD_SETTINGS,
  viewMode = "grid",
}) => {
  // Participant number: seatNumber or NISN
  const participantNo = card.seatNumber || (card.nisn ? `P${card.nisn}` : "-");
  const username = card.username || card.nisn || "-";
  const displayName = card.fullName;

  // Password / Token: clean short verification code
  const password =
    card.password ||
    (card.verificationCode?.length > 10
      ? card.verificationCode.slice(0, 8)
      : card.verificationCode || "-");

  // List View Style (Horizontal Card with Rounded Corners)
  if (viewMode === "list") {
    return (
      <div className="relative bg-white p-4 sm:p-5 rounded-2xl border-2 border-black shadow-xs font-serif text-black leading-snug w-full transition hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {settings.cardHeaderTitle || "KARTU PESERTA"}
              {settings.academicYear
                ? ` • TAHUN PELAJARAN ${settings.academicYear}`
                : ""}
            </span>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">
              {settings.examTitle ||
                card.examTitle ||
                "ASESMEN SUMATIF AKHIR TAHUN"}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">
                No. Peserta
              </span>
              <span className="font-bold font-serif text-sm text-slate-900">
                {participantNo}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">
                Username
              </span>
              <span className="font-semibold font-mono text-sm text-slate-800 truncate block max-w-[140px]">
                {username}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">
                Password
              </span>
              <span className="font-medium font-mono text-sm text-slate-800">
                {password}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">
                Nama Siswa
              </span>
              <span
                className="font-bold uppercase font-serif text-slate-900 truncate block max-w-[160px]"
                title={displayName}
              >
                {displayName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">
                Kelas / Ruang
              </span>
              <span
                className="font-medium font-serif text-slate-800 truncate block max-w-[140px]"
                title={`${card.className} / ${card.roomCode}`}
              >
                {card.className} / {card.roomCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Style (Vertical Card with Rounded Corners)
  return (
    <div className="relative bg-white p-5 rounded-2xl border-2 border-black shadow-xs font-serif text-black leading-snug w-full transition hover:shadow-md">
      {/* Judul Kartu Peserta (Centered) */}
      <div className="text-center mb-4 space-y-0.5">
        <h2 className="text-sm font-bold uppercase tracking-wider">
          {settings.cardHeaderTitle || "KARTU PESERTA"}
        </h2>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
          {settings.examTitle ||
            card.examTitle ||
            "ASESMEN SUMATIF AKHIR TAHUN"}
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
          <span className="font-normal text-slate-800">Username</span>
          <span>:</span>
          <span className="font-semibold font-mono truncate">{username}</span>
        </div>

        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Password</span>
          <span>:</span>
          <span className="font-medium font-mono">{password}</span>
        </div>

        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Nama Siswa</span>
          <span>:</span>
          <span className="font-bold uppercase truncate" title={displayName}>
            {displayName}
          </span>
        </div>

        <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
          <span className="font-normal text-slate-800">Kelas / Ruang</span>
          <span>:</span>
          <span
            className="font-medium truncate"
            title={`${card.className} / ${card.roomCode}`}
          >
            {card.className} / {card.roomCode}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExamCardItem;
