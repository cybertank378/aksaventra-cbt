"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";

interface ExamItemView {
  id: string;
  title: string;
  course: string;
  durationMinutes: number;
  totalQuestions: number;
  startDate: string;
  status: "ACTIVE" | "SCHEDULED" | "COMPLETED";
}

export interface ExamsManagementSectionProps {
  userRole?: UserRole;
}

export const ExamsManagementSection: FC<ExamsManagementSectionProps> = ({
  userRole: _userRole,
}) => {
  const { examsList, fetchExamsList, isLoading, error } =
    useExamManagementApi();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchExamsList();
  }, [fetchExamsList]);

  // Map API ExamSnapshotDTO to UI ExamItemView
  const mappedExams: ExamItemView[] =
    examsList && examsList.length > 0
      ? examsList.map((e) => {
          const durationMins = Math.round((e.durationSeconds || 5400) / 60);

          return {
            id: String(e.examId || e.moodleCbtId),
            title: e.title || e.courseName || `Ujian CBT #${e.examId}`,
            course: e.courseName || "Mata Pelajaran Umum",
            durationMinutes: durationMins,
            totalQuestions: e.questions?.length || 0,
            startDate: "Tersedia",
            status: "ACTIVE",
          };
        })
      : [];

  const filteredExams = mappedExams.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter !== "ALL" && e.status !== filter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari naskah ujian atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0d2b5c]/20 focus:border-[#0d2b5c] transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => fetchExamsList()}
            disabled={isLoading}
          >
            {isLoading ? "Memuat..." : "Refresh"}
          </Button>

          <Link href="/dashboard/exams/new">
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={Plus}
            >
              Buat Ujian Baru
            </Button>
          </Link>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {["ALL", "ACTIVE", "SCHEDULED", "COMPLETED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === tab
                    ? "bg-[#0d2b5c] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "ALL"
                  ? "Semua"
                  : tab === "ACTIVE"
                    ? "Sedang Aktif"
                    : tab === "SCHEDULED"
                      ? "Terjadwal"
                      : "Selesai"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Exams Table Container */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Nama Ujian</th>
                <th className="px-6 py-4">Jadwal & Durasi</th>
                <th className="px-6 py-4">Jumlah Soal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading && mappedExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                      <p className="font-semibold text-xs">
                        Memuat data ujian dari Moodle CBT...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <p className="font-bold text-sm text-slate-700">
                      Tidak ada naskah ujian ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Silakan buat jadwal naskah ujian baru atau ubah kata kunci
                      pencarian.
                    </p>
                    <Link
                      href="/dashboard/exams/new"
                      className="inline-block mt-4"
                    >
                      <Button
                        type="button"
                        variant="filled"
                        color="primary"
                        size="sm"
                        leftIcon={Plus}
                      >
                        Buat Ujian Baru
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredExams.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-xs">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {e.course}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{e.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{e.durationMinutes} Menit</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {e.totalQuestions} Butir Soal
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          e.status === "ACTIVE"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : e.status === "SCHEDULED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {e.status === "ACTIVE" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        )}
                        {e.status === "ACTIVE"
                          ? "Aktif"
                          : e.status === "SCHEDULED"
                            ? "Terjadwal"
                            : "Selesai"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/dashboard/exams/${e.id}/questions`}>
                          <Button
                            type="button"
                            variant="outline"
                            color="secondary"
                            size="sm"
                            leftIcon={BookOpen}
                            title="Kelola Butir Soal"
                          >
                            Soal
                          </Button>
                        </Link>

                        <Link href={`/dashboard/exams/${e.id}/participants`}>
                          <Button
                            type="button"
                            variant="outline"
                            color="secondary"
                            size="sm"
                            leftIcon={Users}
                            title="Distribusi Meja & Peserta"
                          >
                            Meja
                          </Button>
                        </Link>

                        <Link href={`/dashboard/exams/${e.id}/recapitulation`}>
                          <Button
                            type="button"
                            variant="outline"
                            color="secondary"
                            size="sm"
                            leftIcon={BarChart3}
                            title="Rekapitulasi Nilai"
                          >
                            Rekap
                          </Button>
                        </Link>

                        <Link href={`/dashboard/proctor/${e.id}`}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamsManagementSection;
