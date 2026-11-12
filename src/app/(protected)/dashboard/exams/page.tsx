import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ExamsManagementSection from "@/sections/exams/pages/ExamsManagementSection";

export const metadata: Metadata = {
  title: "Kelola Ujian CBT - Aksaventra CBT",
  description:
    "Daftar jadwal asesmen, distribusi naskah soal, dan pemantauan pengawas",
};

export const instant = false;

export default async function ExamsManagementPage() {
  const user = await getCurrentUser();
  return <ExamsManagementSection userRole={user?.role ?? "TEACHER"} />;
}
