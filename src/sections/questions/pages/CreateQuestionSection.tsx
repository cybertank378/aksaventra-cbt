"use client";

import type { FC } from "react";
import CreateQuestionForm from "../organisms/CreateQuestionForm";

export const CreateQuestionSection: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <CreateQuestionForm />
    </div>
  );
};

export default CreateQuestionSection;
