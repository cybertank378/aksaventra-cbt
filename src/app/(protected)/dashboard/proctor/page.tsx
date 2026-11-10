import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ProctorIndexSection from "@/sections/proctor-room/pages/ProctorIndexSection";

export const metadata: Metadata = {
  title: "Monitoring Ujian (Live Proctoring) - Aksaventra CBT",
  description:
    "Daftar sesi ujian aktif dan pemantauan intervensi live pengawas",
};

export default async function ProctorDashboardPage() {
  const user = await getCurrentUser();
  return <ProctorIndexSection userRole={user?.role ?? "PROCTOR"} />;
}
