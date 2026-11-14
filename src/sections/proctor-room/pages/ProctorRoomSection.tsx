"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import ProctorRoomView from "../organisms/ProctorRoomView";

export interface ProctorRoomSectionProps {
  examId: string;
  examTitle?: string;
  roomCode?: string;
  userRole?: UserRole;
}

export const ProctorRoomSection: FC<ProctorRoomSectionProps> = ({
  examId,
  examTitle,
  roomCode,
  userRole: _userRole,
}) => {
  return (
    <div className="w-full">
      <ProctorRoomView
        examId={examId}
        examTitle={examTitle}
        roomCode={roomCode}
      />
    </div>
  );
};

export default ProctorRoomSection;
