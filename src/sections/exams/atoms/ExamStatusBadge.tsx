"use client";

import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";

export type ExamStatusType = "ACTIVE" | "SCHEDULED" | "COMPLETED";

interface ExamStatusBadgeProps {
  status: ExamStatusType;
  size?: "sm" | "md";
}

const STATUS_MAP: Record<
  ExamStatusType,
  { label: string; color: "teal" | "neutral" | "success" }
> = {
  ACTIVE: { label: "Aktif", color: "teal" },
  SCHEDULED: { label: "Terjadwal", color: "neutral" },
  COMPLETED: { label: "Selesai", color: "success" },
};

export const ExamStatusBadge: FC<ExamStatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const meta = STATUS_MAP[status];
  return (
    <Badge color={meta.color} size={size}>
      {meta.label}
    </Badge>
  );
};

export default ExamStatusBadge;
