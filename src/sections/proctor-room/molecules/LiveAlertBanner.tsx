"use client";

import { ShieldAlert, Unlock, X } from "lucide-react";
import { type FC, useState } from "react";
import type { ParticipantMonitorDTO } from "@/modules/proctor/domain/dto/ProctorActionDTO";
import Button from "@/shared-ui/component/Button";

export interface LiveAlertBannerProps {
  lockedParticipants: ParticipantMonitorDTO[];
  onUnlockQuickly?: (attemptId: string) => void;
  className?: string;
}

export const LiveAlertBanner: FC<LiveAlertBannerProps> = ({
  lockedParticipants,
  onUnlockQuickly,
  className,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || lockedParticipants.length === 0) return null;

  const latest = lockedParticipants[0];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-rose-600 text-white shadow-lg animate-pulse ${
        className || ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-rose-200">
            Peringatan Kecurangan Terdeteksi (Auto-Locked)
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
            Siswa: <strong>{latest.fullName}</strong> (Meja:{" "}
            <span className="font-mono bg-white/20 px-1 rounded">
              {latest.seatNumber || "M-01"}
            </span>
            ) terkunci karena akumulasi {latest.strikeCount} pelanggaran.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onUnlockQuickly && (
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            onClick={() => onUnlockQuickly(latest.attemptId)}
            leftIcon={Unlock}
            className="bg-white text-rose-700 hover:bg-slate-100 border-none font-bold"
          >
            Buka Kunci Cepat
          </Button>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LiveAlertBanner;
