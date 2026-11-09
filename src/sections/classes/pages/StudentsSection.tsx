"use client";

import type { FC } from "react";
import StudentListTable from "../organisms/StudentListTable";

export const StudentsSection: FC = () => {
  return (
    <main className="w-full">
      <StudentListTable />
    </main>
  );
};

export default StudentsSection;
