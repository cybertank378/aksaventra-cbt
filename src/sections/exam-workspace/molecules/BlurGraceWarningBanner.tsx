"use client";

import { AlertTriangle, Maximize2 } from "lucide-react";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";

export interface BlurGraceWarningBannerProps {
  active: boolean;
  secondsRemaining?: number;
  currentStrikes?: number;
  maxStrikes?: number;
  onReturnFullscreen?: () => void;
}

export const BlurGraceWarningBanner: FC<BlurGraceWarningBannerProps> = ({
  active,
  secondsRemaining = 10,
  currentStrikes = 0,
  maxStrikes = 3,
  onReturnFullscreen,
}) => {
  if (!active) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-rose-600 px-4 py-3 text-white shadow-2xl animate-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <AlertTriangle size={22} className="text-white animate-bounce" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold">
            Peringatan Integritas Ujian! Anda Berpindah Jendela / Keluar Layar
            Penuh
          </p>
          <p className="text-[11px] sm:text-xs text-rose-100">
            Segera kembali ke layar penuh dalam{" "}
            <span className="font-mono font-black underline text-yellow-300 text-sm">
              {secondsRemaining} detik
            </span>
            . Pelanggaran saat ini: {currentStrikes} / {maxStrikes} batas
            maksimal.
          </p>
        </div>
      </div>

      {onReturnFullscreen && (
        <Button
          type="button"
          variant="filled"
          color="gold"
          size="sm"
          onClick={onReturnFullscreen}
          leftIcon={Maximize2}
          className="shrink-0 shadow-md font-bold"
        >
          Masuk Layar Penuh
        </Button>
      )}
    </div>
  );
};

export default BlurGraceWarningBanner;
