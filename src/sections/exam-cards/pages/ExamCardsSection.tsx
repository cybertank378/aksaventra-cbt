"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import ExamCardsGrid from "../organisms/ExamCardsGrid";

export interface ExamCardsSectionProps {
  userRole?: UserRole;
}

export const ExamCardsSection: FC<ExamCardsSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <ExamCardsGrid />
    </div>
  );
};

export default ExamCardsSection;
