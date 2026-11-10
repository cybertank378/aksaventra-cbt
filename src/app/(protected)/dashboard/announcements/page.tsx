import type { Metadata } from "next";
import { Suspense } from "react";
import AnnouncementsSection from "@/sections/announcements/pages/AnnouncementsSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Pengumuman & Arahan CBT - Aksaventra CBT",
  description: "Pusat informasi dan tata tertib pelaksanaan ujian CBT",
};

export default function AnnouncementsPage() {
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
        role="ADMIN"
        user={{
          id: "admin-1",
          name: "Admin Pusat CBT",
          email: "admin@aksaventra.sch.id",
          role: "ADMIN",
        }}
        title="Pengumuman CBT"
        subtitle="Siaran Informasi Tata Tertib & Instruksi Pelaksanaan Ujian"
      >
        <AnnouncementsSection />
      </AppLayout>
    </Suspense>
  );
}
