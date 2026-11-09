export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type AnnouncementTarget = "ALL" | "STUDENTS" | "PROCTORS" | "TEACHERS";

export interface AnnouncementItemDTO {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetRole: AnnouncementTarget;
  authorName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInputDTO {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetRole: AnnouncementTarget;
}
