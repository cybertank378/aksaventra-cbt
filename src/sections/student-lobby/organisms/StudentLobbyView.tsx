"use client";

import {
  AlertTriangle,
  BookOpen,
  Clock,
  FileQuestion,
  GraduationCap,
  Info,
  ShieldAlert,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { useAttemptApi } from "@/modules/attempts/presentation/useAttemptApi";
import { useExamApi } from "@/modules/exams/presentation/useExamApi";
import { useUsersApi } from "@/modules/users/presentation/useUsersApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import DevicePreFlightCard from "../molecules/DevicePreFlightCard";
import TokenVerificationCard from "../molecules/TokenVerificationCard";

export interface StudentExamMeta {
  id: string;
  title: string;
  courseName?: string;
  durationMinutes: number;
  totalQuestions?: number;
  maxStrikes?: number;
}

export interface StudentProfileSummary {
  id?: string;
  name: string;
  username: string;
  nisn?: string;
  roomName?: string;
}

export interface StudentLobbyViewProps {
  examId: string;
  initialExam?: StudentExamMeta;
  initialStudent?: StudentProfileSummary;
  onAttemptStarted?: (attemptId: string) => void;
  className?: string;
}

export const StudentLobbyView: FC<StudentLobbyViewProps> = ({
  examId,
  initialExam,
  initialStudent,
  onAttemptStarted,
  className,
}) => {
  const router = useRouter();

  // Organism invokes feature API hooks
  const { fetchExamDetail, isLoading: isExamLoading } = useExamApi();
  const { fetchCurrentUser, isLoading: isUserLoading } = useUsersApi();
  const {
    startAttempt,
    isLoading: isStartingAttempt,
    error: attemptError,
  } = useAttemptApi();

  const [exam, setExam] = useState<StudentExamMeta | null>(initialExam || null);
  const [student, setStudent] = useState<StudentProfileSummary | null>(
    initialStudent || null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeviceReady, setIsDeviceReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLobbyData() {
      try {
        const [examData, userData] = await Promise.all([
          fetchExamDetail(examId).catch(() => null),
          fetchCurrentUser().catch(() => null),
        ]);

        if (!isMounted) return;

        if (examData) {
          setExam({
            id: String(examData.examId || examId),
            title: examData.title || "Ujian CBT",
            courseName: examData.courseName || "-",
            durationMinutes: Math.round(
              (examData.durationSeconds || 5400) / 60,
            ),
            totalQuestions: examData.questions?.length ?? 0,
            maxStrikes: examData.maxStrikes ?? 3,
          });
        } else if (!initialExam) {
          setLoadError("Informasi ujian tidak ditemukan dari server atau telah ditutup.");
        }

        if (userData) {
          setStudent({
            id: String(userData.id),
            name: userData.fullName || userData.username,
            username: userData.username,
            nisn:
              (userData as unknown as { nisn?: string }).nisn ||
              userData.username,
            roomName:
              (userData as unknown as { roomName?: string }).roomName ||
              "-",
          });
        } else if (!initialStudent) {
          setLoadError("Sesi peserta tidak valid. Silakan login kembali.");
        }
      } catch (err) {
        if (!isMounted) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "Gagal memuat informasi lobi ujian",
        );
      }
    }

    if (!initialExam || !initialStudent) {
      loadLobbyData();
    }

    return () => {
      isMounted = false;
    };
  }, [examId, initialExam, initialStudent, fetchExamDetail, fetchCurrentUser]);

  const handleStartExamWithToken = async (roomToken: string) => {
    const result = await startAttempt({
      examId,
      roomToken,
    });

    const attemptId = String(result.attemptId);

    if (onAttemptStarted) {
      onAttemptStarted(attemptId);
    } else {
      router.replace(`/student/exam/${attemptId}`);
    }
  };

  const isInitialLoading =
    (!exam || !student) && (isExamLoading || isUserLoading);

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0097a7]" />
          <p className="text-sm font-semibold text-[#0d2b5c]">
            Menyiapkan Data Lobi Ujian...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !exam || !student) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md text-center p-6 sm:p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Gagal Membuka Lobi Ujian
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {loadError ||
              "Informasi ujian atau profil peserta tidak ditemukan dari server."}
          </p>
          <Button
            variant="filled"
            color="primary"
            fullWidth
            onClick={() => router.replace("/login")}
          >
            Kembali ke Halaman Masuk
          </Button>
        </Card>
      </div>
    );
  }

  const activeStudent = student;

  return (
    <div className={`flex flex-col gap-6 max-w-5xl mx-auto ${className || ""}`}>
      {/* 1. Header Banner & Exam Details */}
      <div className="flex flex-col gap-4 rounded-2xl bg-[#0d2b5c] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-[#0097a7]" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Lobi Persiapan Ujian Siswa
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="teal" variant="soft" size="sm">
              Sesi Ujian Resmi
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {exam.courseName || "-"}
            </p>
          </div>

          {/* Student Info Pill */}
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md sm:mt-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0097a7] text-white">
              <User size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">
                {activeStudent.name}
              </p>
              <p className="text-[11px] text-slate-300">
                NISN / ID: {activeStudent.nisn || activeStudent.username}
              </p>
            </div>
          </div>
        </div>

        {/* Exam Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3">
            <Clock size={18} className="text-[#eab308] shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">
                Durasi Pengerjaan
              </p>
              <p className="text-sm font-bold text-white">
                {exam.durationMinutes} Menit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3">
            <FileQuestion size={18} className="text-[#0097a7] shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">
                Jumlah Soal
              </p>
              <p className="text-sm font-bold text-white">
                {exam.totalQuestions} Butir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3">
            <ShieldAlert size={18} className="text-rose-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">
                Batas Pelanggaran
              </p>
              <p className="text-sm font-bold text-white">
                {exam.maxStrikes ?? 3} Kali Toleransi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3">
            <BookOpen size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">
                Ruangan / Sesi
              </p>
              <p className="text-sm font-bold text-white">
                {activeStudent.roomName || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tata Tertib & Aturan Integritas Ujian */}
      <Card
        variant="flat"
        className="border-l-4 border-l-[#0097a7] bg-slate-50"
      >
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <Info size={20} className="text-[#0097a7] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <p className="font-bold text-slate-900 mb-1">
              Tata Tertib & Ketentuan Integritas Peserta Ujian:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                Ujian berlangsung dalam{" "}
                <strong>mode layar penuh (fullscreen)</strong>. Keluar dari
                layar penuh akan dicatat sebagai pelanggaran.
              </li>
              <li>
                Dilarang membuka tab browser lain, berpindah jendela, atau
                mengaktifkan Developer Tools (F12).
              </li>
              <li>
                Jawaban otomatis disimpan secara berkala ke database lokal
                perangkat (*offline-first*) dan disinkronkan ke server.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 3. Device Pre-Flight Check Card (Molecule) */}
      <DevicePreFlightCard onReadyChange={setIsDeviceReady} />

      {/* 4. Token Entry & Fullscreen Trigger Card (Molecule) */}
      <TokenVerificationCard
        isDeviceReady={isDeviceReady}
        onSubmitToken={handleStartExamWithToken}
        loading={isStartingAttempt}
        error={attemptError}
      />
    </div>
  );
};

export default StudentLobbyView;
