"use client";

import clsx from "clsx";
import { type FC, useEffect, useState } from "react";
import { useProctorApi } from "@/modules/proctor/presentation/useProctorApi";
import { useProctorStore } from "@/modules/proctor/presentation/useProctorStore";
import ProctorStatCards from "../molecules/ProctorStatCards";
import TokenProjectorCard from "../molecules/TokenProjectorCard";
import LiveParticipantGrid from "./LiveParticipantGrid";
import ProctorChatBox from "./ProctorChatBox";
import ViolationMonitorList from "./ViolationMonitorList";

export interface ProctorRoomViewProps {
  examId: string;
  examTitle?: string;
  roomCode?: string;
  className?: string;
}

export const ProctorRoomView: FC<ProctorRoomViewProps> = ({
  examId,
  examTitle = "Ujian Penilaian Tengah Semester CBT",
  roomCode,
  className,
}) => {
  const { setExamContext } = useProctorStore();
  const { activeToken, tokenExpiresAt, participants, rotateToken } =
    useProctorApi(examId);

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isRotating, setIsRotating] = useState(false);

  // Set initial exam context into store on mount
  useEffect(() => {
    setExamContext(examId, roomCode);
  }, [examId, roomCode, setExamContext]);

  const handleRotateToken = async (): Promise<boolean> => {
    setIsRotating(true);
    const success = await rotateToken();
    setIsRotating(false);
    return success;
  };

  return (
    <div className={clsx("flex flex-col gap-6 w-full", className)}>
      {/* Top Section: Token Projector Card */}
      <TokenProjectorCard
        examTitle={examTitle}
        roomCode={roomCode}
        token={activeToken}
        expiresAt={tokenExpiresAt}
        onRotateToken={handleRotateToken}
        isRotating={isRotating}
      />

      {/* Real-time Status Metric Cards */}
      <ProctorStatCards
        participants={participants}
        activeFilter={activeFilter}
        onFilterClick={(filterKey) => setActiveFilter(filterKey)}
      />

      {/* Cheating & Violation Monitoring List (3-Strike Tolerance & False Alarm Unlock) */}
      <ViolationMonitorList examId={examId} roomCode={roomCode} />

      {/* Interactive Live Participants Matrix Grid */}
      <LiveParticipantGrid
        examId={examId}
        activeFilter={activeFilter}
        onFilterChange={(filterKey) => setActiveFilter(filterKey)}
      />

      {/* Real-time Coordination Chat Box for Proctor, Teacher, and Admin */}
      <ProctorChatBox
        channelId={examId}
        channelLabel={examTitle}
        roomCode={roomCode}
      />
    </div>
  );
};

export default ProctorRoomView;
