"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import ActiveExamList from "../organisms/ActiveExamList";

export interface ProctorIndexSectionProps {
  userRole?: UserRole;
}

export const ProctorIndexSection: FC<ProctorIndexSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <ActiveExamList />
    </div>
  );
};

export default ProctorIndexSection;
