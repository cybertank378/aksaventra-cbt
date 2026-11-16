"use client";

import { BookOpen } from "lucide-react";
import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";

export interface SubjectCodeBadgeProps {
  name: string;
  shortName?: string | null;
  size?: "sm" | "md";
}

export const SubjectCodeBadge: FC<SubjectCodeBadgeProps> = ({
  name,
  shortName,
  size = "md",
}) => {
  return (
    <Badge
      color="primary"
      variant="soft"
      size={size}
      className="font-bold tracking-wide"
    >
      <BookOpen className="w-3.5 h-3.5 mr-1 inline text-[#0097a7]" />
      {shortName ? `${name} (${shortName})` : name}
    </Badge>
  );
};

export default SubjectCodeBadge;
