import type { Metadata } from "next";
import { Suspense, use } from "react";
import ExamParticipantsSection from "@/sections/exams/pages/ExamParticipantsSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Daftar Peserta & Penempatan Meja - Aksaventra CBT",
  description:
    "Pengaturan nomor meja dan penempatan ruang ujian siswa secara manual",
};

interface ExamParticipantsPageProps {
  params: Promise<{ id: string }>;
}

function ExamParticipantsContent({ params }: ExamParticipantsPageProps) {
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
      title="Daftar Peserta & Penempatan Meja"
      subtitle="Pengaturan nomor meja dan penempatan ruang ujian siswa secara manual"
    >
      <ExamParticipantsSection examId={examId} />
    </AppLayout>
  );
}

export default function ExamParticipantsPage({
  params,
}: ExamParticipantsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ExamParticipantsContent params={params} />
    </Suspense>
  );
}
