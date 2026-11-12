import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import AssignGroupsSection from "@/sections/exams/pages/AssignGroupsSection";

export const metadata: Metadata = {
  title: "Penugasan Kelas & Nomor Meja - Aksaventra CBT",
  description:
    "Tetapkan rombongan belajar peserta ujian dan generate alokasi meja secara berurutan",
};

interface AssignGroupsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignGroupsPage({
  params,
}: AssignGroupsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  return <AssignGroupsSection examId={id} userRole={user?.role ?? "TEACHER"} />;
}
