"use client";

import type { AttemptStatus } from "@prisma/client";
import clsx from "clsx";
import type { FC } from "react";

export interface ParticipantStatusBadgeProps {
  status: AttemptStatus;
  isOnline?: boolean;
  strikeCount?: number;
  className?: string;
}

export const ParticipantStatusBadge: FC<ParticipantStatusBadgeProps> = ({
  status,
  isOnline = true,
  strikeCount = 0,
  className,
}) => {
  // If participant is locked due to cheating / strikes
  if (status === "LOCKED" || strikeCount >= 3) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-inset ring-rose-600/20",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
        Terkunci ({strikeCount} Pelanggaran)
      </span>
    );
  }

  // If student is currently taking exam but connection heartbeat is offline
  if (status === "IN_PROGRESS" && !isOnline) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        Offline (&gt; 60s)
      </span>
    );
  }

  switch (status) {
    case "IN_PROGRESS":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0097a7] ring-1 ring-inset ring-[#0097a7]/30",
            className,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0097a7] animate-pulse" />
          Mengerjakan
        </span>
      );

    case "SUBMITTED":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
            className,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Selesai
        </span>
      );

    case "ABANDONED":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-400/20",
            className,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          Dibatalkan
        </span>
      );

    default:
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300",
            className,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Belum Mulai
        </span>
      );
  }
};

export default ParticipantStatusBadge;
