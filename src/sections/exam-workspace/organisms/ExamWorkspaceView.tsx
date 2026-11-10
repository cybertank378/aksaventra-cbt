"use client";

import { Grid, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useState } from "react";
import { useAttemptSyncHook } from "@/modules/attempts/presentation/useAttemptSyncHook";
import { useExamWorkspaceStore } from "@/modules/attempts/presentation/useExamWorkspaceStore";
import type { QuestionItemDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import {
  attachExamFocusListeners,
  enterExamFullscreenSafe,
} from "@/security/quizFocusGuard";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import ServerTimerBadge from "../atoms/ServerTimerBadge";
import SyncStatusBadge from "../atoms/SyncStatusBadge";
import BlurGraceWarningBanner from "../molecules/BlurGraceWarningBanner";
import QuestionNavGrid from "../molecules/QuestionNavGrid";
import LockdownShieldModal from "./LockdownShieldModal";
import OfflineReceiptModal from "./OfflineReceiptModal";
import QuestionCanvas from "./QuestionCanvas";

export interface ExamWorkspaceViewProps {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentName?: string;
  durationSeconds: number;
  timeStartSec: number;
  extraTimeSeconds?: number;
  serverTimestampSec?: number;
  questions: QuestionItemDTO[];
  maxStrikes?: number;
  className?: string;
}

export const ExamWorkspaceView: FC<ExamWorkspaceViewProps> = ({
  attemptId,
  examId,
  examTitle,
  studentName = "Siswa",
  durationSeconds,
  timeStartSec,
  extraTimeSeconds = 0,
  serverTimestampSec,
  questions,
  maxStrikes = 3,
  className,
}) => {
  const router = useRouter();

  // Zustand workspace store
  const {
    activeQuestionIndex,
    answers,
    syncStatus,
    isLocked,
    strikeCount,
    initializeWorkspace,
    setActiveIndex,
    setAnswer,
    toggleFlag,
    setLock,
    setStrikeCount,
  } = useExamWorkspaceStore();

  // Offline-first sync hook with periodic jittered flush
  const { recordAnswer, submitWithFlush } = useAttemptSyncHook(attemptId);

  // Local UI states
  const [showNavGridModal, setShowNavGridModal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showOfflineReceipt, setShowOfflineReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blurWarningActive, setBlurWarningActive] = useState(false);
  const [blurSecondsRemaining, setBlurSecondsRemaining] = useState(10);

  // Initialize workspace store once on mount
  useEffect(() => {
    const questionOrder = questions.map((q) => q.questionId);
    initializeWorkspace({
      attemptId,
      examId,
      questionOrder,
      maxStrikes,
      isLocked: false,
    });
  }, [attemptId, examId, questions, maxStrikes, initializeWorkspace]);

  // Attach exam browser guard focus & blur listeners
  useEffect(() => {
    let warningTimer: NodeJS.Timeout | null = null;

    const unbind = attachExamFocusListeners({
      enforceFullscreen: true,
      blockContextMenu: true,
      blockCopyPaste: true,
      onViolation: (type) => {
        if (type === "TAB_BLUR" || type === "FULLSCREEN_EXIT") {
          setBlurWarningActive(true);
          setBlurSecondsRemaining(10);

          if (warningTimer) clearInterval(warningTimer);
          warningTimer = setInterval(() => {
            setBlurSecondsRemaining((prev) => {
              if (prev <= 1) {
                if (warningTimer) clearInterval(warningTimer);
                setBlurWarningActive(false);
                // Trigger strike increment
                setStrikeCount(strikeCount + 1);
                if (strikeCount + 1 >= maxStrikes) {
                  setLock(true);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      },
    });

    return () => {
      unbind();
      if (warningTimer) clearInterval(warningTimer);
    };
  }, [strikeCount, maxStrikes, setStrikeCount, setLock]);

  // Answer selection handler
  const handleAnswerChange = useCallback(
    async (questionId: number, ans: unknown) => {
      setAnswer(
        questionId,
        ans as import("@/modules/attempts/domain/dto/SyncBatchDTO").AnswerValue,
      );
      const isFlagged = answers[questionId]?.flag || false;
      await recordAnswer(
        questionId,
        ans as import("@/modules/attempts/domain/dto/SyncBatchDTO").AnswerValue,
        isFlagged,
      );
    },
    [setAnswer, answers, recordAnswer],
  );

  // Flag toggle handler
  const handleToggleFlag = useCallback(
    async (questionId: number) => {
      toggleFlag(questionId);
      const current = answers[questionId];
      if (current) {
        await recordAnswer(questionId, current.ans, !current.flag);
      }
    },
    [toggleFlag, answers, recordAnswer],
  );

  // Submit attempt handler
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitWithFlush();
      if (result.success) {
        router.push(`/student/exam/${attemptId}/result`);
      } else {
        // Network failure / offline submit receipt fallback
        setShowOfflineReceipt(true);
      }
    } catch (_err) {
      setShowOfflineReceipt(true);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Time expired handler
  const handleTimeExpired = useCallback(async () => {
    try {
      const result = await submitWithFlush();
      if (result.success) {
        router.push(`/student/exam/${attemptId}/result`);
      } else {
        setShowOfflineReceipt(true);
      }
    } catch (_err) {
      setShowOfflineReceipt(true);
    }
  }, [submitWithFlush, attemptId, router]);

  const currentQuestion = questions[activeQuestionIndex] || questions[0];
  const questionIds = questions.map((q) => q.questionId);

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-bold">Memuat naskah soal...</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-5 w-full ${className || ""}`}
    >
      {/* Violation Grace Warning Floating Banner */}
      <BlurGraceWarningBanner
        active={blurWarningActive}
        secondsRemaining={blurSecondsRemaining}
        currentStrikes={strikeCount}
        maxStrikes={maxStrikes}
        onReturnFullscreen={() => {
          enterExamFullscreenSafe();
          setBlurWarningActive(false);
        }}
      />

      {/* Top Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 p-3.5 sm:px-5 shadow-xs">
        <div className="flex items-center gap-3">
          <SyncStatusBadge status={syncStatus} />
          <span className="hidden sm:inline text-xs text-slate-400">|</span>
          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
            {examTitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Isolated Countdown Timer Badge */}
          <ServerTimerBadge
            timeStartSec={timeStartSec}
            durationSeconds={durationSeconds}
            extraTimeSeconds={extraTimeSeconds}
            serverTimestampSec={serverTimestampSec}
            onTimeExpired={handleTimeExpired}
          />

          {/* Question Nav Palette Button (Mobile) */}
          <Button
            type="button"
            variant="outline"
            color="primary"
            size="sm"
            onClick={() => setShowNavGridModal(true)}
            leftIcon={Grid}
            className="lg:hidden"
          >
            Daftar Soal
          </Button>
        </div>
      </div>

      {/* Main Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (3 cols): Question Canvas */}
        <div className="lg:col-span-3">
          <QuestionCanvas
            question={currentQuestion}
            currentIndex={activeQuestionIndex}
            totalQuestions={questions.length}
            currentAnswer={answers[currentQuestion.questionId]?.ans}
            isFlagged={Boolean(answers[currentQuestion.questionId]?.flag)}
            onAnswerChange={handleAnswerChange}
            onToggleFlag={handleToggleFlag}
            onPrevQuestion={() => setActiveIndex(activeQuestionIndex - 1)}
            onNextQuestion={() => setActiveIndex(activeQuestionIndex + 1)}
            onSubmitExam={() => setShowConfirmSubmit(true)}
          />
        </div>

        {/* Right Column (1 col): Question Navigation Palette (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <QuestionNavGrid
            totalQuestions={questions.length}
            currentIndex={activeQuestionIndex}
            questionIds={questionIds}
            answers={answers}
            onSelectQuestion={(idx) => setActiveIndex(idx)}
            onSubmitExam={() => setShowConfirmSubmit(true)}
          />
        </div>
      </div>

      {/* Question Nav Palette Modal (Mobile / Tablet) */}
      <Modal
        open={showNavGridModal}
        onClose={() => setShowNavGridModal(false)}
        title="Daftar Nomor Soal"
        size="md"
      >
        <div className="pt-2">
          <QuestionNavGrid
            totalQuestions={questions.length}
            currentIndex={activeQuestionIndex}
            questionIds={questionIds}
            answers={answers}
            onSelectQuestion={(idx) => {
              setActiveIndex(idx);
              setShowNavGridModal(false);
            }}
            onSubmitExam={() => {
              setShowNavGridModal(false);
              setShowConfirmSubmit(true);
            }}
          />
        </div>
      </Modal>

      {/* Final Submit Confirmation Modal */}
      <Modal
        open={showConfirmSubmit}
        onClose={() => !isSubmitting && setShowConfirmSubmit(false)}
        title="Konfirmasi Pengumpulan Ujian"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-center p-2">
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin mengakhiri dan mengumpulkan jawaban ujian
            ini? Setelah dikumpulkan, jawaban tidak dapat diubah kembali.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              fullWidth
              disabled={isSubmitting}
              onClick={() => setShowConfirmSubmit(false)}
            >
              Kembali Mengerjakan
            </Button>
            <Button
              type="button"
              variant="filled"
              color="danger"
              fullWidth
              loading={isSubmitting}
              onClick={handleSubmitExam}
              leftIcon={Send}
            >
              Ya, Kumpulkan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lockdown Shield Overlay Modal */}
      <LockdownShieldModal
        isLocked={isLocked}
        attemptId={attemptId}
        strikeCount={strikeCount}
        maxStrikes={maxStrikes}
        onUnlocked={() => setLock(false)}
      />

      {/* Offline Submission Receipt Modal */}
      <OfflineReceiptModal
        isOpen={showOfflineReceipt}
        attemptId={attemptId}
        examTitle={examTitle}
        studentName={studentName}
        answersCount={Object.keys(answers).length}
        answersPayload={answers}
        onClose={() => router.push("/student/lobby")}
      />
    </div>
  );
};

export default ExamWorkspaceView;
