import type { Metadata } from "next";
import { Suspense } from "react";
import CreateExamSection from "@/sections/exams/pages/CreateExamSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Buat Jadwal Ujian Baru - Aksaventra CBT",
  description:
    "Konfigurasi mata pelajaran, durasi waktu, token ruangan, dan kebijakan proteksi",
};

export default function NewExamPage() {
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
          name: "Guru Pengampu",
          email: "guru@aksaventra.sch.id",
          role: "TEACHER",
        }}
        title="Buat Jadwal Ujian CBT Baru"
        subtitle="Konfigurasi mata pelajaran, durasi waktu, token ruangan, dan kebijakan proteksi"
      >
        <CreateExamSection />
      </AppLayout>
    </Suspense>
  );
}
