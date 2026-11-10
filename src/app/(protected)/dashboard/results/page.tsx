import type { Metadata } from "next";
import { Suspense } from "react";
import ResultsIndexSection from "@/sections/recapitulation/pages/ResultsIndexSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Hasil & Rekapitulasi Nilai Ujian - Aksaventra CBT",
  description: "Daftar hasil ujian dan analisis ketercapaian KKM siswa",
};

export default function ResultsIndexPage() {
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
        title="Hasil Ujian"
        subtitle="Rekapitulasi Nilai, Analisis Ketuntasan KKM, dan Ekspor Laporan"
      >
        <ResultsIndexSection />
      </AppLayout>
    </Suspense>
  );
}
