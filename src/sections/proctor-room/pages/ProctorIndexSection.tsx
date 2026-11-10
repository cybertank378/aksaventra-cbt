"use client";

import type { FC } from "react";
import ActiveExamList from "../organisms/ActiveExamList";

export const ProctorIndexSection: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <ActiveExamList />
    </div>
  );
};

export default ProctorIndexSection;
