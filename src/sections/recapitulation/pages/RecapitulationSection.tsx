"use client";

import type { FC } from "react";
import RecapitulationTable from "../organisms/RecapitulationTable";

export interface RecapitulationSectionProps {
  examId: string;
}

export const RecapitulationSection: FC<RecapitulationSectionProps> = ({
  examId,
}) => {
  return (
    <main className="w-full">
      <RecapitulationTable examId={examId} />
    </main>
  );
};

export default RecapitulationSection;
