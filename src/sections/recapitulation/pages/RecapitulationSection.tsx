"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import RecapitulationTable from "../organisms/RecapitulationTable";

export interface RecapitulationSectionProps {
  examId: string;
  userRole?: UserRole;
}

export const RecapitulationSection: FC<RecapitulationSectionProps> = ({
  examId,
  userRole: _userRole,
}) => {
  return (
    <main className="w-full">
      <RecapitulationTable examId={examId} />
    </main>
  );
};

export default RecapitulationSection;
