"use client";

import {
  Activity,
  ArrowRight,
  Clock,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";

interface ActiveExamItem {
  id: string;
  title: string;
  courseName: string;
  activeParticipants: number;
  totalParticipants: number;
  startTime: string;
  status: "ACTIVE" | "SCHEDULED" | "ENDED";
}

const mockActiveExams: ActiveExamItem[] = [
  {
    id: "exam-1",
    title: "Penilaian Akhir Semester - Matematika Terapan XII",
    courseName: "Matematika Peminatan",
    activeParticipants: 78,
    totalParticipants: 80,
    startTime: "07:30 WIB",
    status: "ACTIVE",
  },
  {
    id: "exam-2",
    title: "Ujian CBT Fisika Kuantum & Termodinamika",
    courseName: "Fisika Lanjutan",
    activeParticipants: 42,
    totalParticipants: 45,
    startTime: "09:00 WIB",
    status: "ACTIVE",
  },
  {
    id: "exam-3",
    title: "Simulasi Ujian Bahasa Inggris CBT Modul A",
    courseName: "Bahasa Inggris",
    activeParticipants: 0,
    totalParticipants: 120,
    startTime: "13:00 WIB",
    status: "SCHEDULED",
  },
];

export const AdminDashboard: FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d2b5c] to-[#163b78] p-6 text-white shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#0097a7] uppercase">
            Aksaventra CBT Command Center
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Dashboard Administrator Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            Pantau seluruh sesi ujian aktif, integritas koneksi server Moodle,
            dan kendali ruang pengawas secara terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/exams">
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="md"
              leftIcon={Plus}
            >
              Kelola Ujian
            </Button>
          </Link>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Sesi Ujian Aktif
            </span>
            <Activity className="w-4 h-4 text-[#0097a7]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0d2b5c]">
            2 Sesi
          </span>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            120 Siswa Sedang Online
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Siswa Terdaftar
            </span>
            <Users className="w-4 h-4 text-[#0d2b5c]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            640
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Terbagi di 16 Ruang Ujian
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Pengawas Siaga
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            12 Guru
          </span>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Semua Ruang Terpantau
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Integritas Sinkronisasi
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-600">
            99.9%
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Delta Timer: 12ms (Aman)
          </p>
        </div>
      </div>

      {/* Real-time Active Exams Table */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ujian CBT Hari Ini
            </h2>
            <p className="text-xs text-slate-500">
              Monitoring langsung progres pengerjaan dan status pengawasan
            </p>
          </div>
          <Link
            href="/dashboard/exams"
            className="text-xs font-semibold text-[#0097a7] hover:underline flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Nama Ujian & Mata Pelajaran</th>
                <th className="px-4 py-3">Waktu Mulai</th>
                <th className="px-4 py-3">Partisipasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockActiveExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{exam.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {exam.courseName}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                    {exam.startTime}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-[#0d2b5c]">
                      {exam.activeParticipants}
                    </span>
                    <span className="text-slate-400">
                      {" "}
                      / {exam.totalParticipants} Peserta
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {exam.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0097a7] ring-1 ring-inset ring-[#0097a7]/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0097a7] animate-pulse" />
                        Sedang Berlangsung
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        Terjadwal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Link href={`/dashboard/proctor/${exam.id}`}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
