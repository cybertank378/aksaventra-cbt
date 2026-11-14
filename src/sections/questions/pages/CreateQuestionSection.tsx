"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import CreateQuestionForm from "../organisms/CreateQuestionForm";

export interface CreateQuestionSectionProps {
  userRole?: UserRole;
}

export const CreateQuestionSection: FC<CreateQuestionSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <CreateQuestionForm />
    </div>
  );
};

export default CreateQuestionSection;
