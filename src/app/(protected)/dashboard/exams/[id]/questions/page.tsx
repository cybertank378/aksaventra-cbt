import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ExamQuestionsSection from "@/sections/exams/pages/ExamQuestionsSection";

export const metadata: Metadata = {
  title: "Kelola Butir Soal Ujian - Aksaventra CBT",
  description:
    "Distribusi butir pertanyaan, pembobotan skor, dan impor soal multi-tipe",
};

interface ExamQuestionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamQuestionsPage({
  params,
}: ExamQuestionsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  return (
    <ExamQuestionsSection examId={id} userRole={user?.role ?? "TEACHER"} />
  );
}
