"use client";

import type { FC } from "react";
import AnnouncementList from "../organisms/AnnouncementList";

export const AnnouncementsSection: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <AnnouncementList />
    </div>
  );
};

export default AnnouncementsSection;
