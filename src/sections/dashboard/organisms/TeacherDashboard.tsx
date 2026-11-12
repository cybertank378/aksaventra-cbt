"use client";

import {
  BarChart3,
  BookOpen,
  Clock,
  FileQuestion,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";

export const TeacherDashboard: FC = () => {
  const router = useRouter();
  const { examsList, fetchExamsList, isLoading } = useExamManagementApi();

  useEffect(() => {
    fetchExamsList();
  }, [fetchExamsList]);

  const teacherExams = examsList.map((e) => ({
    id: String(e.examId || e.moodleCbtId),
    title: e.title || e.courseName || `Ujian #${e.examId}`,
    courseName: e.courseName || "Umum",
    questionCount: e.questions?.length || 0,
    durationMinutes: Math.round((e.durationSeconds || 5400) / 60),
  }));

  const handleCreateQuestion = () => {
    router.replace("/dashboard/questions/new");
  };

  const handleCreateExam = () => {
    router.replace("/dashboard/exams/new");
  };

  const handleManageAllExams = () => {
    router.replace("/dashboard/exams");
  };

  const handleManageQuestions = (examId: string) => {
    router.replace(`/dashboard/exams/${examId}/questions`);
  };

  const handleViewRecap = (examId: string) => {
    router.replace(`/dashboard/exams/${examId}/recapitulation`);
  };

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
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={Plus}
            onClick={handleCreateQuestion}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Buat Soal Baru
          </Button>
          <Button
            type="button"
            variant="filled"
            size="md"
            leftIcon={Plus}
            onClick={handleCreateExam}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold"
          >
            Jadwalkan Ujian
          </Button>
        </div>
      </div>

      {/* Teacher Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Ujian Saya
            </span>
            <FileQuestion className="w-4 h-4 text-[#0097a7]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0d2b5c]">
            {examsList.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Naskah Asesmen</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Bank Butir Soal
            </span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            {teacherExams.reduce((sum, e) => sum + e.questionCount, 0)} Butir
          </span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Siap Diujikan
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Rekapitulasi Nilai
            </span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-800">
            Otomatis
          </span>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            Moodle Gradebook Sync
          </p>
        </div>
      </div>

      {/* Teacher Exams List */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Naskah Ujian &amp; Status Soal
            </h2>
            <p className="text-xs text-slate-500">
              Pantau kelengkapan soal dan rekapitulasi nilai untuk mata
              pelajaran Anda
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            onClick={handleManageAllExams}
          >
            Kelola Semua Ujian
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading && teacherExams.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
              Memuat data naskah ujian...
            </div>
          ) : teacherExams.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Belum ada naskah ujian yang dibuat. Klik{" "}
              <strong>Jadwalkan Ujian</strong> untuk memulai.
            </div>
          ) : (
            teacherExams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-900">
                    {exam.title}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exam.courseName}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-[#0d2b5c]">
                      <FileQuestion className="w-3.5 h-3.5" />
                      {exam.questionCount} Butir Soal
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.durationMinutes} Menit
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    size="sm"
                    leftIcon={FileQuestion}
                    onClick={() => handleManageQuestions(exam.id)}
                  >
                    Kelola Soal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    color="primary"
                    size="sm"
                    leftIcon={BarChart3}
                    onClick={() => handleViewRecap(exam.id)}
                  >
                    Rekap Nilai
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
