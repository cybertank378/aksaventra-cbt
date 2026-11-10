"use client";

import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import AnnouncementList from "../organisms/AnnouncementList";

export interface AnnouncementsSectionProps {
  userRole?: UserRole;
}

export const AnnouncementsSection: FC<AnnouncementsSectionProps> = ({
  userRole: _userRole,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <AnnouncementList />
    </div>
  );
};

export default AnnouncementsSection;
