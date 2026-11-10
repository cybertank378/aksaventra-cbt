import type { Metadata } from "next";
import { Suspense, use } from "react";
import AssignGroupsSection from "@/sections/exams/pages/AssignGroupsSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Penugasan Kelas & Nomor Meja - Aksaventra CBT",
  description:
    "Tetapkan rombongan belajar peserta ujian dan generate alokasi meja secara berurutan",
};

interface AssignGroupsPageProps {
  params: Promise<{ id: string }>;
}

function AssignGroupsContent({ params }: AssignGroupsPageProps) {
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
      title="Penugasan Kelas & Alokasi Nomor Meja"
      subtitle="Tetapkan rombongan belajar peserta ujian dan generate alokasi meja secara berurutan"
    >
      <AssignGroupsSection examId={examId} />
    </AppLayout>
  );
}

export default function AssignGroupsPage({ params }: AssignGroupsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <AssignGroupsContent params={params} />
    </Suspense>
  );
}
