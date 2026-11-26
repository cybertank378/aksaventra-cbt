"use client";

import { AlertTriangle, ArrowLeft, Grid, Maximize2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useAttemptApi } from "@/modules/attempts/presentation/useAttemptApi";
import { useAttemptSyncHook } from "@/modules/attempts/presentation/useAttemptSyncHook";
import { useExamWorkspaceStore } from "@/modules/attempts/presentation/useExamWorkspaceStore";
import type { QuestionItemDTO } from "@/modules/exams/domain/dto/ExamSnapshotDTO";
import {
  attachExamFocusListeners,
  enterExamFullscreenSafe,
  exitExamFullscreenSafe,
} from "@/security/quizFocusGuard";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import { showWarningToast } from "@/shared-ui/component/Toast";
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
  const { recordViolation } = useAttemptApi();
  const lastViolationAtRef = useRef<Record<string, number>>({});
  const strikeCountRef = useRef(strikeCount);
  strikeCountRef.current = strikeCount;

  const reportViolationToServer = useCallback(
    async (
      eventType: "TAB_BLUR" | "FULLSCREEN_EXIT" | "DEVTOOLS_SHORTCUT",
      durationMs?: number,
    ) => {
      const nextLocalStrikes = strikeCountRef.current + 1;
      try {
        const res = await recordViolation({
          attemptId,
          eventType,
          durationMs,
        });
        setStrikeCount(res.strikeCount);
        if (res.isLocked || res.status === "LOCKED") {
          setLock(true);
        }
      } catch {
        // Fallback to local enforcement when offline so anti-cheat still locks
        setStrikeCount(nextLocalStrikes);
        if (nextLocalStrikes >= maxStrikes) {
          setLock(true);
        }
      }
    },
    [attemptId, maxStrikes, recordViolation, setLock, setStrikeCount],
  );

  // Local UI states
  const [showNavGridModal, setShowNavGridModal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showOfflineReceipt, setShowOfflineReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blurWarningActive, setBlurWarningActive] = useState(false);
  const [blurSecondsRemaining, setBlurSecondsRemaining] = useState(10);
  const [finalCountdownSec, setFinalCountdownSec] = useState<number | null>(
    null,
  );
  const hasShown15sToastRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === "undefined") return true;
    return Boolean(document.fullscreenElement);
  });
  const warningTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearWarningTimer = useCallback(() => {
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const handleEnterFullscreen = useCallback(() => {
    void enterExamFullscreenSafe().then((entered) => {
      if (entered) {
        clearWarningTimer();
        setBlurWarningActive(false);
        setIsFullscreen(true);
      }
    });
  }, [clearWarningTimer]);

  // Attempt fullscreen on mount and sync state with browser fullscreenchange events
  useEffect(() => {
    const syncFullscreenState = () => {
      const active = Boolean(
        document.fullscreenElement ||
          (document as unknown as { webkitFullscreenElement?: Element })
            .webkitFullscreenElement,
      );
      setIsFullscreen(active);
      if (active) {
        clearWarningTimer();
        setBlurWarningActive(false);
      }
    };

    syncFullscreenState();
    if (!document.fullscreenElement) {
      void enterExamFullscreenSafe().then((entered) => {
        if (entered) {
          setIsFullscreen(true);
        }
      });
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener(
        "webkitfullscreenchange",
        syncFullscreenState,
      );
    };
  }, [clearWarningTimer]);

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

  // Attach exam browser guard focus, fullscreen, clipboard, and shortcut listeners
  useEffect(() => {
    const unbind = attachExamFocusListeners({
      enforceFullscreen: true,
      blockContextMenu: true,
      blockCopyPaste: true,
      onViolation: (type) => {
        const now = Date.now();
        const lastAt = lastViolationAtRef.current[type] ?? 0;

        if (type === "DEVTOOLS_SHORTCUT") {
          if (now - lastAt < 3000) return;
          lastViolationAtRef.current[type] = now;
          showWarningToast(
            "Pintasan DevTools, salin-tempel, atau tangkapan layar diblokir selama ujian.",
          );
          void reportViolationToServer("DEVTOOLS_SHORTCUT");
          return;
        }

        if (type === "TAB_BLUR" || type === "FULLSCREEN_EXIT") {
          // Deduplicate rapid blur + visibilitychange pairs
          if (now - lastAt < 800) return;
          lastViolationAtRef.current[type] = now;

          setBlurWarningActive(true);
          setBlurSecondsRemaining(10);

          clearWarningTimer();
          warningTimerRef.current = setInterval(() => {
            setBlurSecondsRemaining((prev) => {
              if (prev <= 1) {
                clearWarningTimer();
                setBlurWarningActive(false);
                void reportViolationToServer(type, 10_000);
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
      clearWarningTimer();
    };
  }, [clearWarningTimer, reportViolationToServer]);

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
        router.replace(`/student/exam/${attemptId}/result`);
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

  const handleRemainingTimeChange = useCallback((remaining: number) => {
    if (remaining > 0 && remaining <= 15) {
      setFinalCountdownSec(remaining);
      if (!hasShown15sToastRef.current) {
        hasShown15sToastRef.current = true;
        showWarningToast(
          `Waktu pengerjaan akan habis dalam ${remaining} detik lagi. Segera selesaikan ujian Anda.`,
        );
      }
    } else {
      setFinalCountdownSec(null);
    }
  }, []);

  const handleGoBack = useCallback(async () => {
    clearWarningTimer();
    setBlurWarningActive(false);
    await exitExamFullscreenSafe();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/student/lobby");
    }
  }, [clearWarningTimer, router]);

  // Time expired handler
  const handleTimeExpired = useCallback(async () => {
    try {
      const result = await submitWithFlush();
      if (result.success) {
        router.replace(`/student/exam/${attemptId}/result`);
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
    <div className={`flex flex-col gap-5 w-full ${className || ""}`}>
      {/* Violation Grace Warning Floating Banner */}
      <BlurGraceWarningBanner
        active={blurWarningActive}
        secondsRemaining={blurSecondsRemaining}
        currentStrikes={strikeCount}
        maxStrikes={maxStrikes}
        onReturnFullscreen={handleEnterFullscreen}
      />

      {/* Fullscreen Enforcement Gate when browser is not in fullscreen */}
      {!isFullscreen && !isLocked && !showOfflineReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-gate-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        >
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d2b5c]/10 text-[#0d2b5c]">
              <Maximize2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h2
                id="fullscreen-gate-title"
                className="text-lg font-bold text-[#0d2b5c]"
              >
                Mode Layar Penuh Diperlukan
              </h2>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                Pengerjaan ujian harus dilakukan dalam mode layar penuh. Tekan
                tombol di bawah untuk masuk layar penuh dan melanjutkan ujian.
              </p>
            </div>
            <Button
              type="button"
              variant="filled"
              color="teal"
              size="lg"
              fullWidth
              leftIcon={Maximize2}
              onClick={handleEnterFullscreen}
            >
              Masuk Layar Penuh &amp; Lanjutkan Ujian
            </Button>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="md"
              fullWidth
              leftIcon={ArrowLeft}
              onClick={() => void handleGoBack()}
            >
              Kembali ke Halaman Sebelumnya
            </Button>
          </div>
        </div>
      )}

      {/* Final 15-Second Countdown Warning Banner */}
      {finalCountdownSec !== null &&
        finalCountdownSec > 0 &&
        !isSubmitting &&
        !showOfflineReceipt && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-rose-600 px-4 py-3 text-white shadow-md"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Peringatan: Waktu pengerjaan akan habis dalam{" "}
                <span className="font-mono underline">
                  {finalCountdownSec} detik
                </span>{" "}
                lagi. Segera periksa dan kumpulkan jawaban Anda.
              </span>
            </div>
            <Button
              type="button"
              variant="filled"
              color="gold"
              size="sm"
              leftIcon={Send}
              onClick={() => setShowConfirmSubmit(true)}
            >
              Kumpulkan Sekarang
            </Button>
          </div>
        )}

      {/* Top Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 p-3.5 sm:px-5 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => void handleGoBack()}
          >
            Kembali
          </Button>
          <SyncStatusBadge status={syncStatus} />
          <span className="hidden sm:inline text-xs text-slate-400">|</span>
          <p className="text-xs font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
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
            onRemainingChange={handleRemainingTimeChange}
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
