import type { Metadata } from "next";
import { Suspense, use } from "react";
import ExamWorkspaceSection from "@/sections/exam-workspace/pages/ExamWorkspaceSection";

export const metadata: Metadata = {
  title: "Ruang Ujian Siswa - Aksaventra CBT",
  description: "Zero-Latency Workspace Pengerjaan Ujian Siswa Aksaventra CBT",
};

export const instant = false;

interface StudentExamPageProps {
  params: Promise<{ attemptId: string }>;
}

function ExamContent({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  return <ExamWorkspaceSection attemptId={attemptId} />;
}

export default function StudentExamPage({ params }: StudentExamPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ExamContent params={params} />
    </Suspense>
  );
}
