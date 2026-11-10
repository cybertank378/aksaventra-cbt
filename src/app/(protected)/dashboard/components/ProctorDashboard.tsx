"use client";

import { ArrowRight, KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";

interface AssignedRoomItem {
  examId: string;
  examTitle: string;
  roomCode: string;
  roomName: string;
  totalStudents: number;
  activeToken: string;
  startTime: string;
  durationMinutes: number;
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
}

const mockAssignedRooms: AssignedRoomItem[] = [
  {
    examId: "exam-1",
    examTitle: "Penilaian Akhir Semester - Matematika Terapan XII",
    roomCode: "LAB-KOMP-01",
    roomName: "Laboratorium Komputer 1 (Gedung B Lt. 2)",
    totalStudents: 36,
    activeToken: "AKSA88",
    startTime: "07:30 - 09:00 WIB",
    durationMinutes: 90,
    status: "ACTIVE",
  },
  {
    examId: "exam-2",
    examTitle: "Ujian CBT Fisika Kuantum & Termodinamika",
    roomCode: "LAB-KOMP-01",
    roomName: "Laboratorium Komputer 1 (Gedung B Lt. 2)",
    totalStudents: 34,
    activeToken: "FSK109",
    startTime: "09:30 - 11:00 WIB",
    durationMinutes: 90,
    status: "UPCOMING",
  },
];

export const ProctorDashboard: FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Proctor Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d2b5c] via-[#0097a7] to-[#0d2b5c] p-6 text-white shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
            Ruang Kendali Pengawas (Proctor Workspace)
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Selamat Bertugas, Pengawas CBT
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 mt-1 max-w-xl">
            Awasi jalannya ujian secara langsung, lakukan intervensi peserta
            yang terkunci, dan tampilkan token pada proyektor LCD ruang ujian.
          </p>
        </div>
      </div>

      {/* Assigned Exam Rooms */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-900">
          Ruangan Ujian yang Ditugaskan Hari Ini
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockAssignedRooms.map((room) => {
            const isActive = room.status === "ACTIVE";

            return (
              <div
                key={room.examId}
                className={`flex flex-col justify-between rounded-3xl bg-white border p-5 sm:p-6 shadow-xs transition-all ${
                  isActive
                    ? "border-[#0097a7] ring-1 ring-[#0097a7]/20"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-[#0d2b5c]">
                      {room.roomCode}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0097a7]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0097a7] animate-pulse" />
                        Ujian Aktif
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Akan Datang
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {room.examTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{room.roomName}</p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400">
                        Waktu Ujian
                      </span>
                      <p className="text-xs font-bold text-slate-700">
                        {room.startTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">
                        Kapasitas Peserta
                      </span>
                      <p className="text-xs font-bold text-slate-700">
                        {room.totalStudents} Siswa
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#0097a7]" />
                    <span className="text-xs text-slate-500">Token:</span>
                    <span className="font-mono text-sm font-black text-[#0d2b5c] tracking-widest">
                      {room.activeToken}
                    </span>
                  </div>

                  <Link href={`/dashboard/proctor/${room.examId}`}>
                    <Button
                      type="button"
                      variant="filled"
                      color="primary"
                      size="sm"
                      rightIcon={ArrowRight}
                    >
                      Buka Ruang Pengawas
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proctor SOP & Guidelines Card */}
      <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-5 sm:p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#0097a7]" />
          Panduan Standar Operasional Pengawas (SOP)
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
          <li>
            Buka tampilan proyektor pada proyektor LCD di depan ruang kelas agar
            seluruh siswa dapat melihat Token 6-digit.
          </li>
          <li>
            Jika siswa berpindah aplikasi atau keluar layar penuh lebih dari 10
            detik, sistem otomatis memberikan{" "}
            <strong>Strike Pelanggaran</strong>.
          </li>
          <li>
            Setelah mencapai 3 Strike, ujian siswa akan{" "}
            <strong>Terkunci Otomatis</strong>. Gunakan tombol{" "}
            <strong>Intervensi &gt; Buka Kunci</strong> setelah memverifikasi
            alasan yang sah.
          </li>
          <li>
            Jika siswa mengalami kendala perangkat rusak/mati listrik, tekan
            tombol <strong>Reset Device</strong> agar siswa dapat melanjutkan di
            komputer lain tanpa kehilangan progres jawaban.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProctorDashboard;
