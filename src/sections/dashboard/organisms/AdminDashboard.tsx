"use client";

import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  Clock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
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

export const AdminDashboard: FC = () => {
  const { examsList, fetchExamsList, isLoading } = useExamManagementApi();
  const [studentCount, setStudentCount] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);

  useEffect(() => {
    fetchExamsList();

    fetch("/api/students")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setStudentCount(res.data.length);
        }
      })
      .catch(() => {});

    fetch("/api/classes")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setClassCount(res.data.length);
        }
      })
      .catch(() => {});
  }, [fetchExamsList]);

  const activeExams: ActiveExamItem[] = examsList.map((e) => {
    return {
      id: String(e.examId || e.moodleCbtId),
      title: e.title || e.courseName || `Ujian #${e.examId}`,
      courseName: e.courseName || "Umum",
      activeParticipants: e.questions?.length || 0,
      totalParticipants: e.questions?.length || 0,
      startTime: "Hari ini",
      status: "ACTIVE",
    };
  });

  const activeSessionsCount = activeExams.filter(
    (e) => e.status === "ACTIVE",
  ).length;

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
            {activeSessionsCount} Sesi
          </span>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            Live di Laboratorium
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Siswa Terdaftar
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {studentCount > 0 ? studentCount : "—"}
          </span>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Peserta Ujian CBT
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Rombel / Kelas
            </span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {classCount > 0 ? classCount : "—"}
          </span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Kelas Tersinkron
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Naskah Ujian
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {examsList.length}
          </span>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            Tersedia di Sistem
          </p>
        </div>
      </div>

      {/* Active Exam Rooms Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sesi Ujian Berlangsung &amp; Terjadwal
            </h2>
            <p className="text-xs text-slate-500">
              Daftar sesi asesmen yang sedang diawasi di ruang ujian
            </p>
          </div>

          <Link href="/dashboard/exams">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              rightIcon={ArrowRight}
            >
              Lihat Seluruh Ujian
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Nama Ujian &amp; Mata Pelajaran</th>
                <th className="px-6 py-3.5">Mulai</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && activeExams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                    Memuat data asesmen langsung...
                  </td>
                </tr>
              ) : activeExams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Belum ada jadwal asesmen aktif saat ini.
                  </td>
                </tr>
              ) : (
                activeExams.slice(0, 5).map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-xs">
                        {exam.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {exam.courseName}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-mono font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.startTime}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          exam.status === "ACTIVE"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {exam.status === "ACTIVE" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        )}
                        {exam.status === "ACTIVE" ? "Live" : "Terjadwal"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/proctor/${exam.id}`}>
                        <Button
                          type="button"
                          variant="outline"
                          color="primary"
                          size="sm"
                          rightIcon={ArrowRight}
                        >
                          Monitoring
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
