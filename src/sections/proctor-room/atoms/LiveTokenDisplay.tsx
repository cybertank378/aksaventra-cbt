"use client";

import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

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
    <Card
      className={clsx(
        "flex flex-col items-center justify-center p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Token Ujian Aktif
        </span>
        {expiresAt && secondsRemaining !== null && (
          <Badge
            color={secondsRemaining < 120 ? "error" : "teal"}
            size="sm"
            className={secondsRemaining < 120 ? "animate-pulse" : undefined}
          >
            {secondsRemaining > 0
              ? `${formatCountdown(secondsRemaining)}`
              : "Kedaluwarsa"}
          </Badge>
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
          <Button
            type="button"
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={handleCopy}
            title="Salin Token"
            aria-label="Salin Token Ujian"
            leftIcon={copied ? Check : Copy}
            className={copied ? "text-emerald-600" : "text-slate-400 hover:text-[#0097a7]"}
          />
        )}
      </div>
    </Card>
  );
};

export default LiveTokenDisplay;
