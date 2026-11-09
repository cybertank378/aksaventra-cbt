import type { Metadata } from "next";
import { Suspense } from "react";
import ProctorIndexSection from "@/sections/proctor-room/pages/ProctorIndexSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Monitoring Ujian (Live Proctoring) - Aksaventra CBT",
  description: "Daftar sesi ujian aktif dan pemantauan intervensi live pengawas",
};

export default function ProctorDashboardPage() {
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
        role="PROCTOR"
        user={{
          id: "proctor-1",
          name: "Pengawas Ruang CBT",
          email: "proctor@aksaventra.sch.id",
          role: "PROCTOR",
        }}
        title="Monitoring Ujian"
        subtitle="Live Command Center & Pemantauan Intervensi Pelanggaran Siswa"
      >
        <ProctorIndexSection />
      </AppLayout>
    </Suspense>
  );
}

