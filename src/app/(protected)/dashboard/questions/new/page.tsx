import type { Metadata } from "next";
import { Suspense } from "react";
import CreateQuestionSection from "@/sections/questions/pages/CreateQuestionSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Buat Butir Soal Baru - Aksaventra CBT",
  description: "Formulir penambahan butir soal CBT 8 tipe pertanyaan",
};

export default function CreateQuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      {/* biome-ignore lint/a11y/useValidAriaRole: custom prop */}
      <AppLayout
        role="TEACHER"
        user={{
          id: "teacher-1",
          name: "Guru Mata Pelajaran",
          email: "guru@aksaventra.sch.id",
          role: "TEACHER",
        }}
        title="Buat Soal Baru"
        subtitle="Formulir Input Butir Soal CBT dengan Kunci Jawaban & Bobot Nilai"
      >
        <CreateQuestionSection />
      </AppLayout>
    </Suspense>
  );
}
