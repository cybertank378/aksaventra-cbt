"use client";

import clsx from "clsx";
import {
  Activity,
  CheckCircle2,
  ShieldAlert,
  Users,
  WifiOff,
} from "lucide-react";
import type { FC } from "react";
import type { ParticipantMonitorDTO } from "@/modules/proctor/domain/dto/ProctorActionDTO";

export interface ProctorStatCardsProps {
  participants: ParticipantMonitorDTO[];
  className?: string;
  onFilterClick?: (statusKey: string) => void;
  activeFilter?: string;
}

export const ProctorStatCards: FC<ProctorStatCardsProps> = ({
  participants,
  className,
  onFilterClick,
  activeFilter = "ALL",
}) => {
  const total = participants.length;

  const inProgress = participants.filter(
    (p) => p.status === "IN_PROGRESS" && p.isOnline && p.strikeCount < 3,
  ).length;

  const locked = participants.filter(
    (p) => p.status === "LOCKED" || p.strikeCount >= 3,
  ).length;

  const offline = participants.filter(
    (p) => p.status === "IN_PROGRESS" && !p.isOnline,
  ).length;

  const submitted = participants.filter((p) => p.status === "SUBMITTED").length;

  const cards = [
    {
      key: "ALL",
      title: "Total Peserta",
      count: total,
      icon: Users,
      colorClass: "text-[#0d2b5c]",
      bgClass: "bg-blue-50/60 border-blue-100",
      iconClass: "text-[#0d2b5c] bg-white",
    },
    {
      key: "IN_PROGRESS",
      title: "Sedang Mengerjakan",
      count: inProgress,
      percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      icon: Activity,
      colorClass: "text-[#0097a7]",
      bgClass: "bg-teal-50/60 border-teal-100",
      iconClass: "text-[#0097a7] bg-white",
    },
    {
      key: "LOCKED",
      title: "Terkunci (Strike)",
      count: locked,
      percentage: total > 0 ? Math.round((locked / total) * 100) : 0,
      icon: ShieldAlert,
      colorClass: "text-rose-600",
      bgClass: "bg-rose-50/60 border-rose-100",
      iconClass: "text-rose-600 bg-white",
      highlight: locked > 0,
    },
    {
      key: "OFFLINE",
      title: "Offline (> 60s)",
      count: offline,
      percentage: total > 0 ? Math.round((offline / total) * 100) : 0,
      icon: WifiOff,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50/60 border-amber-100",
      iconClass: "text-amber-600 bg-white",
      highlight: offline > 0,
    },
    {
      key: "SUBMITTED",
      title: "Telah Selesai",
      count: submitted,
      percentage: total > 0 ? Math.round((submitted / total) * 100) : 0,
      icon: CheckCircle2,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50/60 border-emerald-100",
      iconClass: "text-emerald-600 bg-white",
    },
  ];

  return (
    <div
      className={clsx(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4",
        className,
      )}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterClick?.(card.key)}
            className={clsx(
              "flex flex-col text-left p-4 rounded-2xl border transition-all shadow-2xs hover:shadow-sm cursor-pointer",
              card.bgClass,
              isSelected
                ? "ring-2 ring-[#0097a7] ring-offset-1 border-transparent"
                : "border-slate-200/80 hover:border-slate-300",
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-semibold text-slate-600 truncate">
                {card.title}
              </span>
              <div
                className={clsx(
                  "p-1.5 rounded-lg border border-slate-100 shadow-2xs",
                  card.iconClass,
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-auto">
              <span
                className={clsx(
                  "text-2xl sm:text-3xl font-black",
                  card.colorClass,
                )}
              >
                {card.count}
              </span>
              {card.percentage !== undefined && (
                <span className="text-xs text-slate-500 font-medium">
                  ({card.percentage}%)
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProctorStatCards;
