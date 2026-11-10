"use client";

import type { FC } from "react";
import CompletedExamsList from "../organisms/CompletedExamsList";

export const ResultsIndexSection: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <CompletedExamsList />
    </div>
  );
};

export default ResultsIndexSection;
