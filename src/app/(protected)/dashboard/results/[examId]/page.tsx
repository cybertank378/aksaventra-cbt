import type { Metadata } from "next";
import { Suspense, use } from "react";
import RecapitulationSection from "@/sections/recapitulation/pages/RecapitulationSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Rekapitulasi Nilai & Hasil Ujian - Aksaventra CBT",
  description:
    "Hasil rekapitulasi nilai peserta ujian dan analisis ketuntasan KKM",
};

interface ExamResultPageProps {
  params: Promise<{ examId: string }>;
}

function ExamResultContent({ params }: ExamResultPageProps) {
  const { examId } = use(params);

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="TEACHER"
      user={{
        id: "teacher-1",
        name: "Guru Mata Pelajaran",
        email: "guru@aksaventra.sch.id",
        role: "TEACHER",
      }}
      title="Rekapitulasi Nilai & Hasil Ujian"
      subtitle="Analisis perolehan skor, log durasi pengerjaan, dan catatan pelanggaran"
    >
      <RecapitulationSection examId={examId} />
    </AppLayout>
  );
}

export default function ExamResultDetailPage({ params }: ExamResultPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ExamResultContent params={params} />
    </Suspense>
  );
}
