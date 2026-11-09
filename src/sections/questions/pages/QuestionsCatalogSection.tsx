"use client";

import type { FC } from "react";
import QuestionsListGrid from "../organisms/QuestionsListGrid";

export const QuestionsCatalogSection: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <QuestionsListGrid />
    </div>
  );
};

export default QuestionsCatalogSection;
