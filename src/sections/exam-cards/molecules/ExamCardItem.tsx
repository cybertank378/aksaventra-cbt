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
  // Use schedule from settings or default blank rows
  const schedule =
    settings.schedule && settings.schedule.length > 0
      ? settings.schedule
      : DEFAULT_EXAM_CARD_SETTINGS.schedule;

  // Participant number: seatNumber or NISN
  const participantNo = card.seatNumber || (card.nisn ? `P${card.nisn}` : "-");

  // Password / Token
  const password = card.password || card.verificationCode?.slice(0, 8) || "-";

  return (
    <div className="relative bg-white p-1 border-2 border-black shadow-md rounded-none select-none max-w-xl mx-auto w-full">
      {/* Inner Border to create authentic double border */}
      <div className="border border-black p-3.5 sm:p-5 font-serif text-black leading-snug">
        {/* 1. KOP SURAT (HEADER) */}
        <div className="flex items-center gap-3">
          {/* Logo on Left */}
          <div className="w-16 h-20 shrink-0 flex items-center justify-center">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt="Logo Instansi"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              /* Clean formal emblem placeholder when logo is not yet uploaded */
              <div className="w-14 h-16 border-2 border-black rounded-t-sm rounded-b-xl flex flex-col items-center justify-center p-1 text-[7px] text-center font-bold">
                <span className="text-[6px] tracking-wider uppercase">CBT</span>
                <div className="w-6 h-6 border border-black rounded-full my-0.5 flex items-center justify-center text-[8px]">
                  🎓
                </div>
                <span className="text-[5.5px] uppercase truncate max-w-full">
                  {settings.institutionName ? settings.institutionName.slice(0, 10) : "AKSA"}
                </span>
              </div>
            )}
          </div>

          {/* Centered Kop Details (strictly follows settings, Kode Pos centered) */}
          <div className="flex-1 text-center">
            {settings.governmentText && (
              <h5 className="text-[10px] sm:text-[11px] font-normal tracking-wide uppercase">
                {settings.governmentText}
              </h5>
            )}
            {settings.departmentText && (
              <h4 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider">
                {settings.departmentText}
              </h4>
            )}
            <h3 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-tight">
              {settings.institutionName}
            </h3>
            {settings.address && (
              <p className="text-[9px] sm:text-[9.5px]">
                {settings.address}
              </p>
            )}
            {settings.contactText && (
              <p className="text-[8.5px] sm:text-[9px]">
                {settings.contactText}
              </p>
            )}
            {/* Kode Pos Centered */}
            {settings.postalCode && (
              <p className="text-[8.5px] sm:text-[9px] font-normal">
                Kode Pos : {settings.postalCode}
              </p>
            )}
          </div>
        </div>

        {/* Divider: Thick top line + thin bottom line */}
        <div className="my-1.5">
          <div className="border-t-2 border-black" />
          <div className="border-t border-black mt-[1.5px]" />
        </div>

        {/* 2. JUDUL KARTU PESERTA */}
        <div className="text-center my-2 space-y-0.5">
          <h2 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wide">
            {settings.cardHeaderTitle || "KARTU PESERTA"}
          </h2>
          <h3 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wide">
            {settings.examTitle || card.examTitle}
          </h3>
          {settings.academicYear && (
            <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wide">
              TAHUN PELAJARAN {settings.academicYear}
            </p>
          )}
        </div>

        {/* 3. DATA SISWA */}
        <div className="my-3 text-[11px] sm:text-[11.5px] space-y-0.5 pl-1">
          <div className="grid grid-cols-[110px_12px_1fr] items-center">
            <span>Nomor Peserta</span>
            <span>:</span>
            <span className="font-semibold">{participantNo}</span>
          </div>
          <div className="grid grid-cols-[110px_12px_1fr] items-center">
            <span>Password</span>
            <span>:</span>
            <span>{password}</span>
          </div>
          <div className="grid grid-cols-[110px_12px_1fr] items-center">
            <span>Nama Siswa</span>
            <span>:</span>
            <span className="font-bold uppercase">{card.fullName}</span>
          </div>
          <div className="grid grid-cols-[110px_12px_1fr] items-center">
            <span>Kelas / Ruang</span>
            <span>:</span>
            <span>
              {card.className} / {card.roomCode}
            </span>
          </div>
        </div>

        {/* 4. TABEL JADWAL ASESMEN (Kosong jika belum diisi, tanpa hardcode) */}
        <div className="mt-2.5">
          <h4 className="text-center font-bold text-[11px] sm:text-[11.5px] mb-1 uppercase tracking-wide">
            JADWAL {settings.examTitle || card.examTitle}
          </h4>

          <div className="border-2 border-black overflow-hidden">
            <table className="w-full border-collapse text-[10px] sm:text-[10.5px]">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-black text-center font-bold">
                  <th className="border-r border-black py-1 px-1.5 w-[26%]">
                    Hari/Tanggal
                  </th>
                  <th className="border-r border-black py-1 px-1.5 w-[34%]">
                    Mata Pelajaran
                  </th>
                  <th className="border-r border-black py-1 px-1.5 w-[23%]">
                    Waktu
                  </th>
                  <th className="py-1 px-1.5 w-[17%]">
                    TTD Pengawas
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, idx) => {
                  const subject1 = item.subjects?.[0];
                  const subject2 = item.subjects?.[1];

                  return (
                    <tr
                      key={idx}
                      className={idx !== schedule.length - 1 ? "border-b border-black" : ""}
                    >
                      {/* Hari/Tanggal */}
                      <td className="border-r border-black p-1 text-center font-normal align-middle leading-tight whitespace-pre-line min-h-[38px]">
                        {item.dayDate || "\u00A0"}
                      </td>

                      {/* Mata Pelajaran (2 lines - kosong jika belum ada data) */}
                      <td className="border-r border-black p-0 align-top">
                        <div className="p-1 border-b border-black font-normal min-h-[22px]">
                          {subject1?.name || "\u00A0"}
                        </div>
                        <div className="p-1 font-normal min-h-[22px]">
                          {subject2?.name || "\u00A0"}
                        </div>
                      </td>

                      {/* Waktu (2 lines - kosong jika belum ada data) */}
                      <td className="border-r border-black p-0 text-center align-top">
                        <div className="p-1 border-b border-black font-normal min-h-[22px]">
                          {subject1?.time || "\u00A0"}
                        </div>
                        <div className="p-1 font-normal min-h-[22px]">
                          {subject2?.time || "\u00A0"}
                        </div>
                      </td>

                      {/* TTD Pengawas (2 blank cells untuk paraf pengawas ruang) */}
                      <td className="p-0 text-center align-top">
                        <div className="h-[22px] border-b border-black" />
                        <div className="h-[22px]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. TANDA TANGAN & PENGESAHAN (BOTTOM RIGHT) */}
        <div className="mt-3 flex justify-end">
          <div className="relative w-56 text-left pr-2 text-[10px] sm:text-[10.5px]">
            <p className="font-normal">{settings.signerTitle}</p>

            {/* Signature & Stamp Area */}
            <div className="relative h-14 my-1 flex items-center">
              {/* Render stempel jika pengguna mengunggah stempel resmi */}
              {settings.showStamp && settings.stampUrl && (
                <div className="absolute -left-5 top-0 w-20 h-20 pointer-events-none opacity-85 select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.stampUrl}
                    alt="Stempel Instansi"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Signer Name & NIP */}
            <div>
              <p className="font-bold underline tracking-wide">
                {settings.signerName}
              </p>
              {settings.signerNip && (
                <p className="text-[9px] sm:text-[9.5px]">
                  NIP. {settings.signerNip}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCardItem;
