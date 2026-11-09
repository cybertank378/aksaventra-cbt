import type { Metadata } from "next";
import { Suspense } from "react";
import QuestionsCatalogSection from "@/sections/questions/pages/QuestionsCatalogSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Bank Soal CBT - Aksaventra CBT",
  description: "Katalog bank butir soal ujian dengan dukungan 8 jenis pertanyaan",
};

export default function QuestionsCatalogPage() {
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
        title="Bank Soal CBT"
        subtitle="Kelola dan Simpan Butir Soal Ujian Terstandar"
      >
        <QuestionsCatalogSection />
      </AppLayout>
    </Suspense>
  );
}

