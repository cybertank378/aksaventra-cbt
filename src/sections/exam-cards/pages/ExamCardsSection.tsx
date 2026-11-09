"use client";

import type { FC } from "react";
import ExamCardsGrid from "../organisms/ExamCardsGrid";

export const ExamCardsSection: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <ExamCardsGrid />
    </div>
  );
};

export default ExamCardsSection;
