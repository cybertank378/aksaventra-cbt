"use client";

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileQuestion,
  GraduationCap,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/useAuthApi";
import type { StudentAvailableExamDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import { useExamApi } from "@/modules/exams/presentation/useExamApi";
import { useUsersApi } from "@/modules/users/presentation/useUsersApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import type { StudentProfileSummary } from "./StudentLobbyView";

export interface StudentLobbyIndexViewProps {
  initialStudent?: StudentProfileSummary;
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const StudentLobbyIndexView: FC<StudentLobbyIndexViewProps> = ({
  initialStudent,
}) => {
  const router = useRouter();
  const { fetchStudentExams } = useExamApi();
  const { fetchCurrentUser } = useUsersApi();
  const { logout } = useAuthApi();

  const [student, setStudent] = useState<StudentProfileSummary | null>(
    initialStudent ?? null,
  );
  const [exams, setExams] = useState<StudentAvailableExamDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [userData, examList] = await Promise.all([
        fetchCurrentUser().catch(() => null),
        fetchStudentExams(),
      ]);

      if (userData) {
        setStudent({
          id: String(userData.id),
          name: userData.fullName || userData.username,
          username: userData.username,
          nisn:
            (userData as unknown as { nisn?: string }).nisn ||
            userData.username,
          roomName:
            (userData as unknown as { roomCode?: string; roomName?: string })
              .roomCode ||
            (userData as unknown as { roomName?: string }).roomName ||
            "-",
        });
      }

      setExams(examList);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Gagal memuat daftar ujian. Silakan coba muat ulang.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, fetchStudentExams]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 py-4">
      {/* Student Identity Banner */}
      <Card className="border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d2b5c] text-white shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Peserta Ujian
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                {student?.name || "Memuat profil peserta..."}
              </h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                <span>Username / NISN: {student?.username || "-"}</span>
                {student?.roomName && student.roomName !== "-" && (
                  <span>• Ruang: {student.roomName}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadData()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Muat Ulang Jadwal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </Button>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Gagal Memuat Data Lobi</p>
              <p className="mt-0.5 text-red-600">{errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Exam List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
            <GraduationCap className="h-5 w-5 text-[#0097a7]" />
            Daftar Ujian CBT
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {exams.length} ujian terdaftar
          </span>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0097a7]" />
              <p className="text-sm font-medium">Memuat daftar ujian...</p>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 text-base font-semibold text-slate-800">
              Belum Ada Ujian yang Tersedia
            </h4>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Saat ini belum ada jadwal ujian aktif untuk akun Anda. Silakan
              tunggu instruksi dari pengawas ruangan lalu klik Muat Ulang
              Jadwal.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => {
              const durationMinutes = Math.round(
                (exam.durationSeconds || 5400) / 60,
              );
              const attemptStatus = exam.attempt?.status;

              let statusBadge = <Badge color="success">Tersedia</Badge>;
              if (attemptStatus === "IN_PROGRESS") {
                statusBadge = <Badge color="warning">Sedang Dikerjakan</Badge>;
              } else if (attemptStatus === "LOCKED") {
                statusBadge = <Badge color="error">Terkunci</Badge>;
              } else if (attemptStatus === "SUBMITTED") {
                statusBadge = <Badge color="primary">Selesai</Badge>;
              } else if (exam.availabilityStatus === "UPCOMING") {
                statusBadge = <Badge color="teal">Akan Datang</Badge>;
              } else if (exam.availabilityStatus === "CLOSED") {
                statusBadge = <Badge color="neutral">Ditutup</Badge>;
              }

              return (
                <Card
                  key={exam.id}
                  className="flex flex-col justify-between border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#0097a7]">
                          {exam.courseName || "Ujian CBT"}
                        </p>
                        <h4 className="mt-0.5 text-base font-bold text-slate-900">
                          {exam.title}
                        </h4>
                      </div>
                      <div className="shrink-0">{statusBadge}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Durasi: {durationMinutes} menit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileQuestion className="h-3.5 w-3.5 text-slate-400" />
                        <span>{exam.totalQuestions} soal</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {formatDateTime(exam.timeOpen)} -{" "}
                          {formatDateTime(exam.timeClose)}
                        </span>
                      </div>
                      {exam.sebRequired && (
                        <div className="col-span-2 flex items-center gap-1.5 font-medium text-amber-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Wajib Safe Exam Browser (SEB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    {attemptStatus === "IN_PROGRESS" && exam.attempt ? (
                      <Button
                        className="w-full"
                        onClick={() =>
                          router.push(`/student/exam/${exam.attempt?.id}`)
                        }
                      >
                        Lanjutkan Ujian
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    ) : attemptStatus === "LOCKED" ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="mr-1.5 h-4 w-4" />
                        Terkunci: Hubungi Pengawas
                      </Button>
                    ) : attemptStatus === "SUBMITTED" ? (
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Ujian Telah Dikumpulkan
                        </span>
                        {exam.attempt?.finalScore !== null &&
                          exam.attempt?.finalScore !== undefined && (
                            <span>Nilai: {exam.attempt.finalScore}</span>
                          )}
                      </div>
                    ) : exam.availabilityStatus === "OPEN" ? (
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/student/lobby/${exam.id}`)}
                      >
                        Masuk Lobi Ujian
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    ) : exam.availabilityStatus === "UPCOMING" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Ujian Belum Dibuka
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Waktu Ujian Berakhir
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLobbyIndexView;
