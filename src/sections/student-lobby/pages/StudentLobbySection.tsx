"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { useExamApi } from "@/modules/exams/presentation/useExamApi";
import { useUsersApi } from "@/modules/users/presentation/useUsersApi";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import ExamFocusLayout from "@/shared-ui/layout/ExamFocusLayout";
import StudentLobbyView, {
  type StudentExamMeta,
  type StudentProfileSummary,
} from "../organisms/StudentLobbyView";

export interface StudentLobbySectionProps {
  examId: string;
  initialExam?: StudentExamMeta;
  initialStudent?: StudentProfileSummary;
}

export const StudentLobbySection: FC<StudentLobbySectionProps> = ({
  examId,
  initialExam,
  initialStudent,
}) => {
  const router = useRouter();
  const { fetchExamDetail, isLoading: isExamLoading } = useExamApi();
  const { fetchCurrentUser, isLoading: isUserLoading } = useUsersApi();

  const [exam, setExam] = useState<StudentExamMeta | null>(initialExam || null);
  const [student, setStudent] = useState<StudentProfileSummary | null>(
    initialStudent || null,
  );
  const [error, setError] = useState<string | null>(null);

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
            title: examData.title || "Ujian Penilaian Akhir Semester",
            courseName: examData.courseName || "CBT Aksaventra",
            durationMinutes: Math.round((examData.durationSeconds || 5400) / 60),
            totalQuestions: examData.questions?.length ?? 40,
            maxStrikes: examData.maxStrikes ?? 3,
            requireSeb: Boolean(examData.sebRequired),
          });
        } else if (!initialExam) {
          setExam({
            id: examId,
            title: "Ujian Penilaian Akhir Semester",
            courseName: "Mata Pelajaran Ujian Sekolah",
            durationMinutes: 90,
            totalQuestions: 40,
            maxStrikes: 3,
            requireSeb: false,
          });
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
              "Ruang Lab CBT 1",
          });
        } else if (!initialStudent) {
          setStudent({
            name: "Siswa Peserta Ujian",
            username: "peserta",
            nisn: "NISN-2026",
            roomName: "Ruang Lab CBT 1",
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
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

  const loading = (!exam || !student) && (isExamLoading || isUserLoading);

  if (loading) {
    return (
      <ExamFocusLayout
        examTitle="Lobi Ujian Siswa"
        courseName="Menyiapkan Sesi..."
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0097a7]" />
            <p className="text-sm font-semibold text-[#0d2b5c]">
              Menyiapkan Ruang Lobi Ujian...
            </p>
          </div>
        </div>
      </ExamFocusLayout>
    );
  }

  if (error || !exam) {
    return (
      <ExamFocusLayout examTitle="Terjadi Kesalahan">
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md text-center p-6 sm:p-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Gagal Membuka Lobi Ujian
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {error || "Informasi ujian tidak ditemukan atau telah berakhir."}
            </p>
            <Button
              variant="filled"
              color="primary"
              fullWidth
              onClick={() => router.push("/login")}
            >
              Kembali ke Halaman Masuk
            </Button>
          </Card>
        </div>
      </ExamFocusLayout>
    );
  }

  const activeStudent = student || {
    name: "Siswa Peserta",
    username: "peserta",
    nisn: "NISN-2026",
    roomName: "Lab CBT",
  };

  return (
    <ExamFocusLayout
      examTitle={exam.title}
      courseName={exam.courseName}
      studentName={activeStudent.name}
      studentId={activeStudent.nisn || activeStudent.username}
      roomCode={activeStudent.roomName}
    >
      <div className="py-6 sm:py-8 px-4 sm:px-6">
        <StudentLobbyView
          exam={exam}
          student={activeStudent}
          onAttemptStarted={(attemptId) => {
            router.push(`/student/exam/${attemptId}`);
          }}
        />
      </div>
    </ExamFocusLayout>
  );
};

export default StudentLobbySection;
