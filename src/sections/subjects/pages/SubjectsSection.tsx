"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import SubjectsGrid from "../organisms/SubjectsGrid";

export interface SubjectsSectionProps {
  userRole?: UserRole;
}

export const SubjectsSection: FC<SubjectsSectionProps> = ({
  userRole = "ADMIN",
}) => {
  return (
    <main className="w-full">
      <SubjectsGrid userRole={userRole} />
    </main>
  );
};

export default SubjectsSection;
