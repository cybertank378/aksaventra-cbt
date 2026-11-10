import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import RecapitulationSection from "@/sections/recapitulation/pages/RecapitulationSection";

export const metadata: Metadata = {
  title: "Rekapitulasi Nilai & Hasil Ujian - Aksaventra CBT",
  description:
    "Hasil rekapitulasi nilai peserta ujian dan analisis ketuntasan KKM",
};

interface ExamResultPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ExamResultDetailPage({
  params,
}: ExamResultPageProps) {
  const { examId } = await params;
  const user = await getCurrentUser();
  return (
    <RecapitulationSection examId={examId} userRole={user?.role ?? "TEACHER"} />
  );
}
