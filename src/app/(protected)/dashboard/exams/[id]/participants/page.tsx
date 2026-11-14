import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ExamParticipantsSection from "@/sections/exams/pages/ExamParticipantsSection";

export const metadata: Metadata = {
  title: "Daftar Peserta & Penempatan Meja - Aksaventra CBT",
  description:
    "Pengaturan nomor meja dan penempatan ruang ujian siswa secara manual",
};

export const instant = false;

interface ExamParticipantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamParticipantsPage({
  params,
}: ExamParticipantsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  return (
    <ExamParticipantsSection examId={id} userRole={user?.role ?? "TEACHER"} />
  );
}
