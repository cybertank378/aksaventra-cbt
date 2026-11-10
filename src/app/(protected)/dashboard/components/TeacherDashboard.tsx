"use client";

import { BarChart3, FileQuestion, Plus, Users } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";

interface TeacherExamItem {
  id: string;
  title: string;
  courseName: string;
  questionCount: number;
  submittedCount: number;
  totalStudents: number;
  averageScore?: number;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
}

const mockTeacherExams: TeacherExamItem[] = [
  {
    id: "exam-1",
    title: "Penilaian Akhir Semester - Matematika Terapan XII",
    courseName: "Matematika Peminatan",
    questionCount: 40,
    submittedCount: 65,
    totalStudents: 80,
    averageScore: 82.5,
    status: "ACTIVE",
  },
  {
    id: "exam-2",
    title: "Ujian CBT Fisika Kuantum & Termodinamika",
    courseName: "Fisika Lanjutan",
    questionCount: 35,
    submittedCount: 45,
    totalStudents: 45,
    averageScore: 78.4,
    status: "COMPLETED",
  },
];

export const TeacherDashboard: FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Teacher Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0d2b5c] to-[#0097a7] p-6 text-white shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
            Portal Guru &amp; Analisis Nilai
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Dashboard Guru Mata Pelajaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 mt-1 max-w-xl">
            Kelola distribusi naskah soal CBT, pantau jalannya ujian di kelas,
            dan rekap hasil analisis nilai siswa secara instan.
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
              Ujian Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Naskah Ujian Terbit
            </span>
            <FileQuestion className="w-4 h-4 text-[#0097a7]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0d2b5c]">
            4 Ujian
          </span>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            Tersinkron Moodle mod_cbt
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Lembar Jawaban
            </span>
            <Users className="w-4 h-4 text-[#0d2b5c]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            125 Siswa
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Terkoreksi Otomatis</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Rata-rata Nilai
            </span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            80.45
          </span>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            KKM: 75.0 (Tuntas 88%)
          </p>
        </div>
      </div>

      {/* Teacher Exams List */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ujian Mata Pelajaran Anda
            </h2>
            <p className="text-xs text-slate-500">
              Rekapitulasi nilai, butir soal, dan pengawasan langsung
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Ujian &amp; Mata Pelajaran</th>
                <th className="px-4 py-3">Butir Soal</th>
                <th className="px-4 py-3">Peserta Mengumpulkan</th>
                <th className="px-4 py-3">Rata-rata Nilai</th>
                <th className="px-4 py-3 text-right">Menu Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTeacherExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{exam.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {exam.courseName}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-semibold">
                    {exam.questionCount} Soal Pilihan Ganda
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-[#0d2b5c]">
                      {exam.submittedCount}
                    </span>
                    <span className="text-slate-400">
                      {" "}
                      / {exam.totalStudents} Siswa
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {exam.averageScore ? (
                      <span className="font-black text-emerald-600 text-sm">
                        {exam.averageScore}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/results/${exam.id}`}>
                        <Button
                          type="button"
                          variant="outline"
                          color="secondary"
                          size="sm"
                          leftIcon={BarChart3}
                        >
                          Rekap Nilai
                        </Button>
                      </Link>

                      <Link href={`/dashboard/proctor/${exam.id}`}>
                        <Button
                          type="button"
                          variant="filled"
                          color="primary"
                          size="sm"
                        >
                          Pantau Ruang
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
  );
};

export default TeacherDashboard;
