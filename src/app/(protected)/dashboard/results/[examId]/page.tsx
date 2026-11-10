import {
  ArrowLeft,
  Award,
  BarChart,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, use } from "react";
import Button from "@/shared-ui/component/Button";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Rekapitulasi Nilai & Hasil Ujian - Aksaventra CBT",
  description: "Hasil rekapitulasi nilai peserta ujian dan analisis butir soal",
};

interface StudentResultItem {
  userId: string;
  fullName: string;
  nisn: string;
  className: string;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalScore: number;
  status: "PASSED" | "FAILED";
}

const mockStudentResults: StudentResultItem[] = [
  {
    userId: "stu-1",
    fullName: "Ahmad Rizky Pratama",
    nisn: "0054321001",
    className: "XII MIPA 1",
    correctAnswers: 36,
    wrongAnswers: 4,
    unanswered: 0,
    totalScore: 90.0,
    status: "PASSED",
  },
  {
    userId: "stu-2",
    fullName: "Budi Santoso",
    nisn: "0054321002",
    className: "XII MIPA 1",
    correctAnswers: 34,
    wrongAnswers: 5,
    unanswered: 1,
    totalScore: 85.0,
    status: "PASSED",
  },
  {
    userId: "stu-3",
    fullName: "Citra Dewi Lestari",
    nisn: "0054321003",
    className: "XII MIPA 1",
    correctAnswers: 30,
    wrongAnswers: 8,
    unanswered: 2,
    totalScore: 75.0,
    status: "PASSED",
  },
  {
    userId: "stu-4",
    fullName: "Dimas Aditya Pratama",
    nisn: "0054321004",
    className: "XII MIPA 2",
    correctAnswers: 26,
    wrongAnswers: 12,
    unanswered: 2,
    totalScore: 65.0,
    status: "FAILED",
  },
  {
    userId: "stu-5",
    fullName: "Eka Putri Handayani",
    nisn: "0054321005",
    className: "XII MIPA 2",
    correctAnswers: 38,
    wrongAnswers: 2,
    unanswered: 0,
    totalScore: 95.0,
    status: "PASSED",
  },
];

interface ResultsPageProps {
  params: Promise<{ examId: string }>;
}

function ResultsContent({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="TEACHER"
      user={{
        id: "teacher-1",
        name: "Guru Mata Pelajaran",
        email: "guru@aksaventra.sch.id",
        role: "TEACHER",
      }}
      title="Rekapitulasi Nilai Ujian Siswa"
      subtitle={`Detail distribusi skor dan capaian KKM naskah asesmen ${examId}`}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Navigation & Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/exams">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={ArrowLeft}
            >
              Kembali ke Daftar Ujian
            </Button>
          </Link>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Download}
          >
            Ekspor Nilai (Excel / CSV)
          </Button>
        </div>

        {/* Overview Score Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                Total Peserta Ujian
              </span>
              <Users className="w-4 h-4 text-[#0d2b5c]" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0d2b5c]">
              5 Siswa
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              100% Lembar Terkoreksi
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                Rata-rata Nilai
              </span>
              <TrendingUp className="w-4 h-4 text-[#0097a7]" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0097a7]">
              82.0
            </span>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">
              Standar KKM: 75.0
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                Nilai Tertinggi
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              95.0
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Eka Putri Handayani
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                Ketuntasan Klasikal
              </span>
              <BarChart className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              80.0%
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              4 Tuntas / 1 Remedial
            </p>
          </div>
        </div>

        {/* Student Results Table */}
        <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rekap Skor Peserta
              </h2>
              <p className="text-xs text-slate-500">
                Nilai akhir berdasarkan kunci jawaban resmi
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Nama Siswa</th>
                  <th className="px-5 py-3.5">Kelas</th>
                  <th className="px-5 py-3.5 text-center">Benar</th>
                  <th className="px-5 py-3.5 text-center">Salah</th>
                  <th className="px-5 py-3.5 text-center">Kosong</th>
                  <th className="px-5 py-3.5 text-center">Nilai Akhir</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockStudentResults.map((res) => (
                  <tr
                    key={res.userId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {res.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        NISN: {res.nisn}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-600">
                      {res.className}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center font-bold text-emerald-600">
                      {res.correctAnswers}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center font-bold text-rose-500">
                      {res.wrongAnswers}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center font-bold text-slate-400">
                      {res.unanswered}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <span className="font-black text-sm text-[#0d2b5c]">
                        {res.totalScore}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {res.status === "PASSED" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Tuntas
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          Remedial
                        </span>
                      )}
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

export default function ExamResultsPage({ params }: ResultsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ResultsContent params={params} />
    </Suspense>
  );
}
