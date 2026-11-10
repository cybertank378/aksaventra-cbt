import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import DashboardSection from "@/sections/dashboard/pages/DashboardSection";

export const metadata: Metadata = {
  title: "Dashboard CBT - Aksaventra CBT",
  description:
    "Pusat Komando & Pemantauan Sistem Ujian Berbasis Komputer Aksaventra",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <DashboardSection
      initialRole={user?.role ?? "ADMIN"}
      userRole={user?.role ?? "ADMIN"}
    />
  );
}
