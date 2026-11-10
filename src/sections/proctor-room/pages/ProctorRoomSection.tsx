"use client";

import type { FC } from "react";
import ProctorRoomView from "../organisms/ProctorRoomView";

export interface ProctorRoomSectionProps {
  examId: string;
  examTitle?: string;
  roomCode?: string;
}

export const ProctorRoomSection: FC<ProctorRoomSectionProps> = ({
  examId,
  examTitle,
  roomCode,
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
