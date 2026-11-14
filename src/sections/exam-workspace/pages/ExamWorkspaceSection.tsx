"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { QuestionItemDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import { useExamApi } from "@/modules/exams/presentation/useExamApi";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import ExamWorkspaceView from "../organisms/ExamWorkspaceView";

export interface ExamWorkspaceSectionProps {
  attemptId: string;
  examId?: string;
  examTitle?: string;
  studentName?: string;
  durationSeconds?: number;
  timeStartSec?: number;
  extraTimeSeconds?: number;
  serverTimestampSec?: number;
  questions?: QuestionItemDTO[];
  maxStrikes?: number;
}

export const ExamWorkspaceSection: FC<ExamWorkspaceSectionProps> = ({
  attemptId,
  examId,
  examTitle: initialExamTitle,
  studentName: initialStudentName,
  durationSeconds: initialDurationSeconds,
  timeStartSec: initialTimeStartSec,
  extraTimeSeconds = 0,
  serverTimestampSec: initialServerTimestampSec,
  questions: initialQuestions,
  maxStrikes = 3,
}) => {
  const router = useRouter();
  const { fetchExamSnapshot } = useExamApi();

  const [questions, setQuestions] = useState<QuestionItemDTO[] | null>(
    initialQuestions && initialQuestions.length > 0 ? initialQuestions : null,
  );
  const [examTitle, setExamTitle] = useState(initialExamTitle || "");
  const [durationSeconds, setDurationSeconds] = useState(
    initialDurationSeconds || 5400,
  );
  const [serverTimestampSec, setServerTimestampSec] = useState(
    initialServerTimestampSec || Math.floor(Date.now() / 1000),
  );
  const [timeStartSec, setTimeStartSec] = useState(
    initialTimeStartSec || Math.floor(Date.now() / 1000),
  );
  const [studentName] = useState(initialStudentName || "Peserta Ujian");
  const [isLoading, setIsLoading] = useState(!initialQuestions || initialQuestions.length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadSnapshot() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const targetExamId = examId || attemptId;
        const snapshot = await fetchExamSnapshot(targetExamId);
        if (!isMounted) return;

        if (snapshot && snapshot.questions && snapshot.questions.length > 0) {
          setQuestions(snapshot.questions);
          setExamTitle(snapshot.title || snapshot.courseName || `Ujian #${targetExamId}`);
          if (snapshot.durationSeconds) {
            setDurationSeconds(snapshot.durationSeconds);
          }
          if (snapshot.serverTimestamp) {
            setServerTimestampSec(snapshot.serverTimestamp);
          }
        } else {
          setQuestions([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Gagal memuat naskah soal dari server CBT.",
        );
        setQuestions([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [attemptId, examId, initialQuestions, fetchExamSnapshot]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100/90 p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#0097a7]" />
          <p className="text-xs font-semibold text-slate-600">
            Memuat naskah butir soal dari server CBT...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !questions || questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100/90 p-4">
        <Card variant="elevated" className="max-w-md p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-base font-bold text-slate-800">
            Naskah Soal Belum Tersedia
          </h2>
          <p className="mb-6 text-xs text-slate-600">
            {errorMessage ||
              "Tidak ada butir soal yang ditemukan untuk sesi ujian ini. Silakan hubungi proktor atau pengawas ruang ujian."}
          </p>
          <Button
            type="button"
            variant="filled"
            color="primary"
            fullWidth
            onClick={() => router.replace("/dashboard")}
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100/90 py-4 sm:py-6 px-4 md:px-6 select-none">
      <ExamWorkspaceView
        attemptId={attemptId}
        examId={examId || attemptId}
        examTitle={examTitle || "Asesmen CBT"}
        studentName={studentName}
        durationSeconds={durationSeconds}
        timeStartSec={timeStartSec}
        extraTimeSeconds={extraTimeSeconds}
        serverTimestampSec={serverTimestampSec}
        questions={questions}
        maxStrikes={maxStrikes}
      />
    </main>
  );
};

export default ExamWorkspaceSection;
