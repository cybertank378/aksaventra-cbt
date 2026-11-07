"use client";

import clsx from "clsx";
import { AlertCircle, Clock } from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import {
  calculateTrueRemainingSeconds,
  type ServerDeltaTimer,
} from "@/libs/serverDeltaTimer";

export interface ServerTimerBadgeProps {
  timer?: ServerDeltaTimer;
  timeStartSec?: number;
  durationSeconds?: number;
  extraTimeSeconds?: number;
  serverTimestampSec?: number;
  onTimeExpired?: () => void;
  className?: string;
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export const ServerTimerBadge: FC<ServerTimerBadgeProps> = ({
  timer,
  timeStartSec = Math.floor(Date.now() / 1000),
  durationSeconds = 5400,
  extraTimeSeconds = 0,
  serverTimestampSec = Math.floor(Date.now() / 1000),
  onTimeExpired,
  className,
}) => {
  // Self-contained ticking state: prevents parent canvas and nav grid from re-rendering every second
  const [remainingSec, setRemainingSec] = useState<number>(() => {
    if (timer) {
      return timer.getRemainingSeconds();
    }
    return calculateTrueRemainingSeconds(
      timeStartSec,
      durationSeconds,
      extraTimeSeconds,
      serverTimestampSec,
    );
  });

  const hasExpiredRef = useRef(false);

  useEffect(() => {
    const updateCountdown = () => {
      const current = timer
        ? timer.getRemainingSeconds()
        : calculateTrueRemainingSeconds(
            timeStartSec,
            durationSeconds,
            extraTimeSeconds,
            serverTimestampSec,
          );

      setRemainingSec(current);

      if (current <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onTimeExpired?.();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [
    timer,
    timeStartSec,
    durationSeconds,
    extraTimeSeconds,
    serverTimestampSec,
    onTimeExpired,
  ]);

  const isUrgent = remainingSec <= 60;
  const isWarning = remainingSec <= 300 && remainingSec > 60;

  return (
    <div
      role="timer"
      aria-label={`Sisa waktu pengerjaan: ${formatDuration(remainingSec)}`}
      className={clsx(
        "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-sm sm:text-base font-bold shadow-xs select-none transition-colors duration-300",
        isUrgent
          ? "bg-rose-600 text-white animate-pulse"
          : isWarning
            ? "bg-[#eab308] text-slate-950 font-black animate-in fade-in"
            : "bg-[#0d2b5c] text-white border border-[#163b78]",
        className,
      )}
    >
      {isUrgent ? (
        <AlertCircle size={16} className="text-white shrink-0 animate-bounce" />
      ) : (
        <Clock
          size={16}
          className={clsx(
            "shrink-0",
            isWarning ? "text-slate-900" : "text-[#0097a7]",
          )}
        />
      )}
      <span className="tracking-wider">{formatDuration(remainingSec)}</span>
    </div>
  );
};

export default ServerTimerBadge;
