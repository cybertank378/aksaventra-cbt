"use client";

import clsx from "clsx";
import { CheckCircle2, CloudOff, RefreshCw } from "lucide-react";
import type { FC } from "react";
import type { SyncStatus } from "@/modules/attempts/presentation/useExamWorkspaceStore";

export interface SyncStatusBadgeProps {
  status: SyncStatus;
  className?: string;
}

export const SyncStatusBadge: FC<SyncStatusBadgeProps> = ({
  status,
  className,
}) => {
  return (
    <output
      aria-label={`Status sinkronisasi jawaban: ${status}`}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold select-none transition-all duration-200 border",
        status === "synced" &&
          "bg-emerald-50 text-emerald-800 border-emerald-200",
        status === "syncing" &&
          "bg-amber-50 text-amber-800 border-amber-200 animate-pulse",
        (status === "error" || status === "idle") &&
          "bg-slate-100 text-slate-700 border-slate-300",
        className,
      )}
    >
      {status === "synced" && (
        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
      )}
      {status === "syncing" && (
        <RefreshCw size={13} className="text-amber-600 shrink-0 animate-spin" />
      )}
      {(status === "error" || status === "idle") && (
        <CloudOff size={13} className="text-slate-500 shrink-0" />
      )}

      <span>
        {status === "synced" && "Tersimpan"}
        {status === "syncing" && "Menyimpan..."}
        {status === "error" && "Offline (Tersimpan Lokal)"}
        {status === "idle" && "Tersimpan Lokal"}
      </span>
    </output>
  );
};

export default SyncStatusBadge;
