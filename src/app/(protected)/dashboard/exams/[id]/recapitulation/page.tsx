import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import RecapitulationSection from "@/sections/recapitulation/pages/RecapitulationSection";

export const metadata: Metadata = {
  title: "Rekapitulasi Nilai & Hasil Ujian - Aksaventra CBT",
  description:
    "Hasil rekapitulasi nilai peserta ujian dan analisis ketuntasan KKM",
};

export const instant = false;

interface RecapitulationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamRecapitulationPage({
  params,
}: RecapitulationPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  return (
    <RecapitulationSection examId={id} userRole={user?.role ?? "TEACHER"} />
  );
}
