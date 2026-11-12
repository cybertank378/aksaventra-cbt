import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import AnnouncementsSection from "@/sections/announcements/pages/AnnouncementsSection";

export const metadata: Metadata = {
  title: "Pengumuman & Arahan CBT - Aksaventra CBT",
  description: "Pusat informasi dan tata tertib pelaksanaan ujian CBT",
};

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  return <AnnouncementsSection userRole={user?.role ?? "ADMIN"} />;
}
