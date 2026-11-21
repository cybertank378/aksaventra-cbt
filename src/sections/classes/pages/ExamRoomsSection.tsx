"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import ExamRoomSeatLayoutManager from "../organisms/ExamRoomSeatLayoutManager";

export interface ExamRoomsSectionProps {
  userRole?: UserRole;
}

export const ExamRoomsSection: FC<ExamRoomsSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <main className="w-full">
      <ExamRoomSeatLayoutManager />
    </main>
  );
};

export default ExamRoomsSection;
