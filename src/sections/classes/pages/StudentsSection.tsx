"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import StudentListTable from "../organisms/StudentListTable";

export interface StudentsSectionProps {
  userRole?: UserRole;
}

export const StudentsSection: FC<StudentsSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <main className="w-full">
      <StudentListTable />
    </main>
  );
};

export default StudentsSection;
