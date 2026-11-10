"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import QuestionsListGrid from "../organisms/QuestionsListGrid";

export interface QuestionsCatalogSectionProps {
  userRole?: UserRole;
}

export const QuestionsCatalogSection: FC<QuestionsCatalogSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <QuestionsListGrid />
    </div>
  );
};

export default QuestionsCatalogSection;
