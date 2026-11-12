import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ClassesSection from "@/sections/classes/pages/ClassesSection";

export const metadata: Metadata = {
  title: "Manajemen Kelas & Rombel - Aksaventra CBT",
  description: "Kelola rombongan belajar siswa untuk penugasan ujian CBT",
};

export const instant = false;

export default async function ClassesPage() {
  const user = await getCurrentUser();
  return <ClassesSection userRole={user?.role ?? "ADMIN"} />;
}
