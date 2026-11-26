"use client";

import clsx from "clsx";
import { AlertCircle, Clock } from "lucide-react";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { ServerDeltaTimer } from "@/libs/serverDeltaTimer";

export interface ServerTimerBadgeProps {
  timer?: ServerDeltaTimer;
  timeStartSec?: number;
  durationSeconds?: number;
  extraTimeSeconds?: number;
  serverTimestampSec?: number;
  onRemainingChange?: (remainingSeconds: number) => void;
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
  onRemainingChange,
  onTimeExpired,
  className,
}) => {
  // Build an internal monotonic ServerDeltaTimer when no external timer instance is passed
  const activeTimer = useMemo(() => {
    if (timer) return timer;
    return new ServerDeltaTimer({
      serverTimestamp: serverTimestampSec,
      timeStart: timeStartSec,
      durationSeconds,
      extraTimeSeconds,
    });
  }, [
    timer,
    serverTimestampSec,
    timeStartSec,
    durationSeconds,
    extraTimeSeconds,
  ]);

  // Self-contained ticking state: prevents parent canvas and nav grid from re-rendering every second
  const [remainingSec, setRemainingSec] = useState<number>(() =>
    activeTimer.getRemainingSeconds(),
  );

  const hasExpiredRef = useRef(false);
  const onRemainingChangeRef = useRef(onRemainingChange);
  onRemainingChangeRef.current = onRemainingChange;
  const onTimeExpiredRef = useRef(onTimeExpired);
  onTimeExpiredRef.current = onTimeExpired;

  useEffect(() => {
    hasExpiredRef.current = false;

    const updateCountdown = () => {
      const current = activeTimer.getRemainingSeconds();
      setRemainingSec(current);
      onRemainingChangeRef.current?.(current);

      if (current <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onTimeExpiredRef.current?.();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const isFinalCountdown = remainingSec > 0 && remainingSec <= 15;
  const isUrgent = remainingSec <= 60;
  const isWarning = remainingSec <= 300 && remainingSec > 60;

  return (
    <div
      role="timer"
      aria-live={isFinalCountdown ? "assertive" : "off"}
      aria-label={`Sisa waktu pengerjaan: ${formatDuration(remainingSec)} dari ${totalMinutes} menit`}
      title={`Durasi ujian: ${totalMinutes} menit`}
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
      <span className="hidden text-[11px] font-sans font-semibold opacity-80 sm:inline">
        / {totalMinutes} mnt
      </span>
    </div>
  );
};

export default ServerTimerBadge;
