import { GraduationCap, QrCode, ShieldCheck } from "lucide-react";
import type { FC } from "react";
import type { ExamCardItemDTO } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import CardWatermark from "../atoms/CardWatermark";

interface Props {
  card: ExamCardItemDTO;
}

export const ExamCardItem: FC<Props> = ({ card }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-300 bg-white p-5 shadow-xs print:border-slate-400 print:shadow-none print:break-inside-avoid">
      <CardWatermark />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563eb] text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              KARTU PESERTA UJIAN
            </h4>
            <p className="text-[10px] font-semibold text-slate-500">
              Aksaventra Computer-Based Testing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0097a7]" />
          <span>{card.seatNumber}</span>
        </div>
      </div>

      {/* Body Details */}
      <div className="grid grid-cols-3 gap-3 py-3.5 text-xs">
        <div className="col-span-2 space-y-1.5">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Nama Peserta:
            </span>
            <p className="font-bold text-slate-900 truncate">{card.fullName}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                NISN / Username:
              </span>
              <p className="font-mono font-bold text-slate-800">{card.nisn}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Kelas:
              </span>
              <p className="font-bold text-[#0d2b5c]">{card.className}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Ruang Ujian:
              </span>
              <p className="font-bold text-slate-800">{card.roomCode}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                No. Meja:
              </span>
              <p className="font-mono font-black text-blue-700">
                {card.seatNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Box & QR Placeholder */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 p-2 text-center">
          <QrCode className="w-12 h-12 text-slate-600 mb-1" />
          <span className="text-[9px] font-mono text-slate-400">
            {card.verificationCode}
          </span>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate max-w-[200px]">{card.examTitle}</span>
        <span className="font-medium text-slate-500">
          Wajib Dibawa Saat Ujian
        </span>
      </div>
    </div>
  );
};

export default ExamCardItem;
