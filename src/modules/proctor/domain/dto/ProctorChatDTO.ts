import type { UserRole } from "@/security/rbacConfig";

export type ProctorChatCategory = "INFO" | "ISSUE" | "URGENT";

export interface ProctorChatMessageDTO {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  roomCode?: string | null;
  category: ProctorChatCategory;
  message: string;
  createdAt: string;
}

export interface SendProctorChatInputDTO {
  channelId?: string;
  roomCode?: string;
  category?: ProctorChatCategory;
  message: string;
}
