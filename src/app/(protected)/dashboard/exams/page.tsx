"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Button from "@/shared-ui/component/Button";
import AppLayout from "@/shared-ui/layout/AppLayout";

interface ExamListItem {
  id: string;
  title: string;
  course: string;
  durationMinutes: number;
  totalQuestions: number;
  startDate: string;
  status: "ACTIVE" | "SCHEDULED" | "COMPLETED";
}

const mockExams: ExamListItem[] = [
  {
    id: "exam-1",
    title: "Penilaian Akhir Semester - Matematika Terapan XII",
    course: "Matematika Peminatan",
    durationMinutes: 90,
    totalQuestions: 40,
    startDate: "08 Nov 2026, 07:30 WIB",
    status: "ACTIVE",
  },
  {
    id: "exam-2",
    title: "Ujian CBT Fisika Kuantum & Termodinamika",
    course: "Fisika Lanjutan",
    durationMinutes: 90,
    totalQuestions: 35,
    startDate: "08 Nov 2026, 09:30 WIB",
    status: "SCHEDULED",
  },
  {
    id: "exam-3",
    title: "Simulasi Ujian Bahasa Inggris CBT Modul A",
    course: "Bahasa Inggris",
    durationMinutes: 60,
    totalQuestions: 50,
    startDate: "07 Nov 2026, 13:00 WIB",
    status: "COMPLETED",
  },
  {
    id: "exam-4",
    title: "Asesmen Sumatif Biologi Sel & Genetika",
    course: "Biologi Lanjutan",
    durationMinutes: 75,
    totalQuestions: 40,
    startDate: "09 Nov 2026, 08:00 WIB",
    status: "SCHEDULED",
  },
];

export default function ExamsManagementPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const filteredExams = mockExams.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter !== "ALL" && e.status !== filter) {
      return false;
    }
    return true;
  });

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop, not an ARIA attribute
    <AppLayout
      role="TEACHER"
      user={{
        id: "teacher-1",
        name: "Guru Mata Pelajaran",
        email: "guru@aksaventra.sch.id",
        role: "TEACHER",
      }}
      title="Manajemen Naskah Ujian CBT"
      subtitle="Daftar jadwal asesmen, distribusi naskah soal, dan pemantauan pengawas"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari naskah ujian atau mata pelajaran..."
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "ACTIVE", "SCHEDULED", "COMPLETED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === s
                    ? "bg-[#0d2b5c] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {s === "ALL"
                  ? "Semua"
                  : s === "ACTIVE"
                    ? "Sedang Aktif"
                    : s === "SCHEDULED"
                      ? "Terjadwal"
                      : "Selesai"}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Table */}
        <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Nama Ujian</th>
                  <th className="px-5 py-3.5">Jadwal & Durasi</th>
                  <th className="px-5 py-3.5">Jumlah Soal</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {exam.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {exam.course}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{exam.durationMinutes} Menit</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-700">
                      {exam.totalQuestions} Butir Soal
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {exam.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0097a7] ring-1 ring-inset ring-[#0097a7]/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0097a7] animate-pulse" />
                          Aktif
                        </span>
                      )}
                      {exam.status === "SCHEDULED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          Terjadwal
                        </span>
                      )}
                      {exam.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          Selesai
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Link href={`/dashboard/exams/${exam.id}/questions`}>
                          <Button
                            type="button"
                            variant="ghost"
                            color="secondary"
                            size="sm"
                            leftIcon={BookOpen}
                            title="Bank Soal"
                          >
                            Soal
                          </Button>
                        </Link>
                        <Link href={`/dashboard/exams/${exam.id}/assign-groups`}>
                          <Button
                            type="button"
                            variant="ghost"
                            color="secondary"
                            size="sm"
                            leftIcon={Users}
                            title="Alokasi Rombel & Meja"
                          >
                            Meja
                          </Button>
                        </Link>
                        <Link href={`/dashboard/exams/${exam.id}/recapitulation`}>
                          <Button
                            type="button"
                            variant="outline"
                            color="secondary"
                            size="sm"
                            leftIcon={BarChart3}
                            title="Rekapitulasi Nilai & KKM"
                          >
                            Rekap
                          </Button>
                        </Link>
                        <Link href={`/dashboard/proctor/${exam.id}`}>
                          <Button
                            type="button"
                            variant="filled"
                            color="primary"
                            size="sm"
                            rightIcon={ArrowRight}
                          >
                            Proktor
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
