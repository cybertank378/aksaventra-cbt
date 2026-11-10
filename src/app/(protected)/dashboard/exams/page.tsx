import type { Metadata } from "next";
import { Suspense } from "react";
import ExamsManagementSection from "@/sections/exams/pages/ExamsManagementSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Kelola Ujian CBT - Aksaventra CBT",
  description:
    "Daftar jadwal asesmen, distribusi naskah soal, dan pemantauan pengawas",
};

export default function ExamsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      {/* biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop */}
      <AppLayout
        role="TEACHER"
        user={{
          id: "teacher-1",
          name: "Guru Mata Pelajaran",
          email: "guru@aksaventra.sch.id",
          role: "TEACHER",
        }}
        title="Manajemen Naskah Ujian CBT"
        subtitle="Daftar jadwal asesmen, distribusi naskah soal, dan pemantauan pengawas"
      >
        <ExamsManagementSection />
      </AppLayout>
    </Suspense>
  );
}
