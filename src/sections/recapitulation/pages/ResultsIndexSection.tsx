"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import CompletedExamsList from "../organisms/CompletedExamsList";

export interface ResultsIndexSectionProps {
  userRole?: UserRole;
}

export const ResultsIndexSection: FC<ResultsIndexSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <CompletedExamsList />
    </div>
  );
};

export default ResultsIndexSection;
