"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import ClassListGrid from "../organisms/ClassListGrid";

export interface ClassesSectionProps {
  userRole?: UserRole;
}

export const ClassesSection: FC<ClassesSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <main className="w-full">
      <ClassListGrid />
    </main>
  );
};

export default ClassesSection;
