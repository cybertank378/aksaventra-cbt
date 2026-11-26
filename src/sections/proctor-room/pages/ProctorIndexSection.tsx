"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import ActiveExamList from "../organisms/ActiveExamList";
import ProctorChatBox from "../organisms/ProctorChatBox";

export interface ProctorIndexSectionProps {
  userRole?: UserRole;
}

export const ProctorIndexSection: FC<ProctorIndexSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <ActiveExamList />
      <ProctorChatBox channelId="GLOBAL" />
    </div>
  );
};

export default ProctorIndexSection;
