"use client";

import type { FC } from "react";
import ClassListGrid from "../organisms/ClassListGrid";

export const ClassesSection: FC = () => {
  return (
    <main className="w-full">
      <ClassListGrid />
    </main>
  );
};

export default ClassesSection;
