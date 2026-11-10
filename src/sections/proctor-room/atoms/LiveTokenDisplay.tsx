"use client";

import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import { type FC, useEffect, useState } from "react";

export interface LiveTokenDisplayProps {
  token: string;
  expiresAt?: string | null;
  className?: string;
  size?: "normal" | "large";
}

export const LiveTokenDisplay: FC<LiveTokenDisplayProps> = ({
  token,
  expiresAt,
  className,
  size = "normal",
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Countdown timer calculation for token validity
  useEffect(() => {
    if (!expiresAt) {
      setSecondsRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsRemaining(diff);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = async () => {
    if (!token || token === "------") return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard copy fallback
    }
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}m ${remainderSecs < 10 ? "0" : ""}${remainderSecs}s`;
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 p-4 shadow-xs",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Token Ujian Aktif
        </span>
        {expiresAt && secondsRemaining !== null && (
          <span
            className={clsx(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
              secondsRemaining < 120
                ? "bg-rose-100 text-rose-700 animate-pulse"
                : "bg-teal-50 text-[#0097a7]",
            )}
          >
            {secondsRemaining > 0
              ? `${formatCountdown(secondsRemaining)}`
              : "Kedaluwarsa"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 my-2">
        <span
          className={clsx(
            "font-mono font-black tracking-[0.25em] text-[#0d2b5c] select-all",
            size === "large"
              ? "text-4xl sm:text-6xl md:text-7xl"
              : "text-3xl sm:text-4xl",
          )}
        >
          {token || "------"}
        </span>

        {token && token !== "------" && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0097a7] hover:bg-teal-50 transition-colors"
            title="Salin Token"
            aria-label="Salin Token Ujian"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveTokenDisplay;
