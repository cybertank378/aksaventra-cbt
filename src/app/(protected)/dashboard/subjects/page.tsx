import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import SubjectsSection from "@/sections/subjects/pages/SubjectsSection";

export const metadata: Metadata = {
  title: "Mata Pelajaran - Aksaventra CBT",
  description:
    "Manajemen mata pelajaran (course), pengelompokan kelas, dan sinkronisasi Moodle",
};

export const instant = false;

export default async function DashboardSubjectsPage() {
  const user = await getCurrentUser();

  return <SubjectsSection userRole={user?.role ?? "ADMIN"} />;
}
