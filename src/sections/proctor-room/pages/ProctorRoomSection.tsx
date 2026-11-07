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
    <main className="min-h-screen bg-slate-50/80 p-4 sm:p-6 lg:p-8">
      <ProctorRoomView
        examId={examId}
        examTitle={examTitle}
        roomCode={roomCode}
      />
    </main>
  );
};

export default ProctorRoomSection;

