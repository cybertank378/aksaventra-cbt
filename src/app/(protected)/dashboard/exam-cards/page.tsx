import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ExamCardsSection from "@/sections/exam-cards/pages/ExamCardsSection";

export const metadata: Metadata = {
  title: "Cetak Kartu Ujian Siswa - Aksaventra CBT",
  description: "Cetak massal kartu tanda peserta ujian per rombel kelas",
};

export const instant = false;

export default async function ExamCardsPage() {
  const user = await getCurrentUser();
  return <ExamCardsSection userRole={user?.role ?? "TEACHER"} />;
}
