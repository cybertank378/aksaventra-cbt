import type { Metadata } from "next";
import { Suspense, use } from "react";
import ExamQuestionsSection from "@/sections/exams/pages/ExamQuestionsSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Kelola Butir Soal Ujian - Aksaventra CBT",
  description:
    "Distribusi butir pertanyaan, pembobotan skor, dan impor soal multi-tipe",
};

interface ExamQuestionsPageProps {
  params: Promise<{ id: string }>;
}

function ExamQuestionsContent({ params }: ExamQuestionsPageProps) {
  const { id: examId } = use(params);

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="TEACHER"
      user={{
        id: "teacher-1",
        name: "Guru Pengampu",
        email: "guru@aksaventra.sch.id",
        role: "TEACHER",
      }}
      title="Kelola Butir Soal Ujian"
      subtitle="Distribusi butir pertanyaan, pembobotan skor, dan impor soal multi-tipe"
    >
      <ExamQuestionsSection examId={examId} />
    </AppLayout>
  );
}

export default function ExamQuestionsPage({ params }: ExamQuestionsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ExamQuestionsContent params={params} />
    </Suspense>
  );
}
