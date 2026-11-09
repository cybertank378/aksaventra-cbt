import type { Metadata } from "next";
import { Suspense } from "react";
import ExamCardsSection from "@/sections/exam-cards/pages/ExamCardsSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Cetak Kartu Ujian Siswa - Aksaventra CBT",
  description: "Cetak massal kartu tanda peserta ujian per rombel kelas",
};

export default function ExamCardsPage() {
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
          name: "Guru / Panitia CBT",
          email: "panitia@aksaventra.sch.id",
          role: "TEACHER",
        }}
        title="Kartu Peserta Ujian"
        subtitle="Pratinjau & Pencetakan Kartu Tanda Peserta Ujian Siswa"
      >
        <ExamCardsSection />
      </AppLayout>
    </Suspense>
  );
}

