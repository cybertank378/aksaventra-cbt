"use client";

import { KeyRound, Maximize2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { useAttemptApi } from "@/modules/attempts/presentation/useAttemptApi";
import TokenPinInput from "@/sections/auth/atoms/TokenPinInput";
import { enterExamFullscreenSafe } from "@/security/quizFocusGuard";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

export interface TokenVerificationCardProps {
  examId: string;
  isDeviceReady?: boolean;
  onSuccess?: (attemptId: string) => void;
  className?: string;
}

export const TokenVerificationCard: FC<TokenVerificationCardProps> = ({
  examId,
  isDeviceReady = true,
  onSuccess,
  className,
}) => {
  const router = useRouter();
  const { startAttempt, isLoading, error: apiError } = useAttemptApi();

  const [token, setToken] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStartExam = async () => {
    // ⚠️ CRITICAL: Must trigger fullscreen request synchronously on line 1 of user gesture handler
    const fullscreenPromise = enterExamFullscreenSafe();

    if (!token || token.length < 6) {
      setLocalError("Masukkan 6 digit token ruangan yang diberikan pengawas.");
      return;
    }

    if (!isDeviceReady) {
      setLocalError(
        "Pemeriksaan kesiapan perangkat belum terpenuhi. Pastikan seluruh uji sistem bertanda hijau.",
      );
      return;
    }

    setLocalError(null);

    try {
      // Await fullscreen request outcome without blocking verification flow
      await fullscreenPromise;

      // Call start attempt API via useAttemptApi
      const result = await startAttempt({
        examId,
        roomToken: token.trim().toUpperCase(),
      });

      const attemptId = result.attemptId;

      if (onSuccess && attemptId) {
        onSuccess(String(attemptId));
      } else if (attemptId) {
        router.push(`/student/exam/${attemptId}`);
      } else {
        router.push(`/student/exam/${examId}`);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memulai sesi ujian. Periksa token Anda.";
      setLocalError(message);
    }
  };

  const isButtonDisabled = isLoading || !isDeviceReady || token.length < 6;
  const displayedError = localError || apiError;

  return (
    <Card
      variant="elevated"
      title="Token Masuk Ruang Ujian"
      subtitle="Masukkan 6-karakter token yang ditampilkan di layar pengawas ujian"
      className={className}
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        {displayedError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 animate-in fade-in"
          >
            <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Memulai Ujian</p>
              <p className="mt-0.5">{displayedError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <KeyRound size={15} className="text-[#0097a7]" />
            <span>Ketik Token Ujian (6 Karakter)</span>
          </div>

          <TokenPinInput
            length={6}
            value={token}
            onChange={(val) => {
              setToken(val);
              if (localError) setLocalError(null);
            }}
            onComplete={(val) => {
              setToken(val);
            }}
            hasError={Boolean(displayedError)}
            disabled={isLoading || !isDeviceReady}
          />

          <p className="text-center text-[11px] text-slate-400">
            Karakter angka (0-9) dan huruf kapital (A-Z) otomatis disesuaikan.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="filled"
            color="teal"
            size="lg"
            fullWidth
            disabled={isButtonDisabled}
            loading={isLoading}
            onClick={handleStartExam}
            leftIcon={Maximize2}
            className="shadow-md text-base font-bold"
          >
            {isLoading
              ? "Memvalidasi Sesi & Masuk Layar Penuh..."
              : "Masuk Layar Penuh & Mulai Ujian"}
          </Button>

          {!isDeviceReady && (
            <p className="mt-2 text-center text-xs text-amber-600">
              ⚠️ Selesaikan uji kesiapan perangkat di atas sebelum memulai ujian.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TokenVerificationCard;
