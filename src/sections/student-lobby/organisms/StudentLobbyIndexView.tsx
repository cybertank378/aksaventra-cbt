"use client";

import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileQuestion,
  GraduationCap,
  Lock,
  LogOut,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import type { AnnouncementItemDTO } from "@/modules/announcements/domain/dto/AnnouncementDTO";
import { useAnnouncementsApi } from "@/modules/announcements/presentation/useAnnouncementsApi";
import { useAuthApi } from "@/modules/auth/presentation/useAuthApi";
import type { StudentAvailableExamDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import { useExamApi } from "@/modules/exams/presentation/useExamApi";
import { useUsersApi } from "@/modules/users/presentation/useUsersApi";
import ViewAnnouncementModal from "@/sections/announcements/molecules/ViewAnnouncementModal";
import { enterExamFullscreenSafe } from "@/security/quizFocusGuard";
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
  const { announcements, fetchAnnouncements } = useAnnouncementsApi();

  const [student, setStudent] = useState<StudentProfileSummary | null>(
    initialStudent ?? null,
  );
  const [exams, setExams] = useState<StudentAvailableExamDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItemDTO | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [userData, examList] = await Promise.all([
        fetchCurrentUser().catch(() => null),
        fetchStudentExams(),
        fetchAnnouncements().catch(() => undefined),
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
  }, [fetchCurrentUser, fetchStudentExams, fetchAnnouncements]);

  const studentAnnouncements = useMemo(
    () =>
      announcements.filter(
        (a) =>
          a.isActive && (a.targetRole === "ALL" || a.targetRole === "STUDENTS"),
      ),
    [announcements],
  );

  const completedExamResults = useMemo(
    () =>
      exams.filter(
        (exam) => exam.attempt && exam.attempt.status === "SUBMITTED",
      ),
    [exams],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto w-full space-y-6 py-4">
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

      {/* Pengumuman & Hasil Ujian Siswa */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pengumuman Hasil Ujian */}
        <Card className="border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0d2b5c]">
              <Award className="h-4 w-4 text-[#0097a7]" />
              Pengumuman Hasil Ujian
            </h3>
            <Badge color="teal" variant="soft" size="sm">
              {completedExamResults.length} Selesai
            </Badge>
          </div>

          {isLoading ? (
            <p className="py-6 text-center text-xs text-slate-500">
              Memuat pengumuman hasil ujian...
            </p>
          ) : completedExamResults.length === 0 ? (
            <div className="py-5 text-xs leading-relaxed text-slate-600">
              Belum ada hasil ujian yang diumumkan untuk akun Anda. Nilai dan
              status kelulusan akan muncul otomatis di sini setelah Anda
              menyelesaikan dan mengumpulkan ujian.
            </div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {completedExamResults.map((exam) => {
                const attempt = exam.attempt;
                const hasScore =
                  attempt?.finalScore !== null &&
                  attempt?.finalScore !== undefined;
                return (
                  <div
                    key={`result-${exam.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-[#0097a7]">
                        {exam.courseName || "Ujian CBT"}
                      </p>
                      <p className="truncate text-xs font-bold text-slate-900">
                        {exam.title}
                      </p>
                      {attempt?.finishedAt && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Dikumpulkan: {formatDateTime(attempt.finishedAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {hasScore ? (
                        <div className="rounded-lg bg-[#0d2b5c] px-3 py-1 text-center text-white">
                          <span className="block text-[10px] uppercase tracking-wider text-slate-300">
                            Nilai
                          </span>
                          <span className="font-mono text-sm font-black">
                            {Number(attempt.finalScore).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <Badge color="warning" variant="soft" size="sm">
                          Menunggu Penilaian
                        </Badge>
                      )}

                      {attempt?.id && (
                        <Button
                          type="button"
                          variant="outline"
                          color="primary"
                          size="sm"
                          onClick={() =>
                            router.push(`/student/exam/${attempt.id}/result`)
                          }
                        >
                          Lihat Hasil
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pengumuman Resmi Panitia / Pengawas */}
        <Card className="border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0d2b5c]">
              <Megaphone className="h-4 w-4 text-[#0097a7]" />
              Pengumuman Panitia &amp; Pengawas
            </h3>
            <Badge color="primary" variant="soft" size="sm">
              {studentAnnouncements.length} Info
            </Badge>
          </div>

          {isLoading ? (
            <p className="py-6 text-center text-xs text-slate-500">
              Memuat pengumuman...
            </p>
          ) : studentAnnouncements.length === 0 ? (
            <div className="py-5 text-xs leading-relaxed text-slate-600">
              Belum ada pengumuman terbaru dari panitia atau pengawas ujian.
              Pastikan Anda membaca tata tertib sebelum memulai sesi ujian.
            </div>
          ) : (
            <div className="mt-3 max-h-56 space-y-2.5 overflow-y-auto pr-1">
              {studentAnnouncements.map((item) => {
                const priorityColor =
                  item.priority === "URGENT"
                    ? "error"
                    : item.priority === "HIGH"
                      ? "warning"
                      : "teal";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAnnouncement(item)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-left transition-colors hover:border-[#0097a7]/60 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">
                        {item.title}
                      </p>
                      <Badge color={priorityColor} variant="soft" size="sm">
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                      {item.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-400">
                        {item.authorName} · {formatDateTime(item.createdAt)}
                      </p>
                      <span className="text-[11px] font-semibold text-[#0097a7]">
                        Lihat Detail
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

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
                        onClick={() => {
                          // Trigger fullscreen synchronously inside the click gesture so Chrome keeps it across navigation
                          void enterExamFullscreenSafe();
                          router.push(
                            `/student/exam/${exam.attempt?.id}?examId=${exam.id}`,
                          );
                        }}
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

      <ViewAnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};

export default StudentLobbyIndexView;
