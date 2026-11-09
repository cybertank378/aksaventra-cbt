import type { FC } from "react";
import type { AnnouncementPriority } from "@/modules/announcements/domain/dto/AnnouncementDTO";

interface Props {
  priority: AnnouncementPriority;
}

const CONFIG: Record<
  AnnouncementPriority,
  { label: string; bg: string; text: string }
> = {
  LOW: { label: "Info", bg: "bg-slate-100", text: "text-slate-700" },
  NORMAL: { label: "Normal", bg: "bg-blue-50", text: "text-blue-700" },
  HIGH: { label: "Penting", bg: "bg-amber-50", text: "text-amber-700" },
  URGENT: { label: "Mendesak", bg: "bg-rose-50", text: "text-rose-700" },
};

export const PriorityBadge: FC<Props> = ({ priority }) => {
  const c = CONFIG[priority] || CONFIG.NORMAL;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
};

export default PriorityBadge;
