import { AnnouncementsService } from "@/modules/announcements/application/service/AnnouncementsService";
import { AnnouncementsController } from "@/modules/announcements/infrastructure/AnnouncementsController";

const announcementsService = new AnnouncementsService();
export const announcementsController = new AnnouncementsController(
  announcementsService,
);
