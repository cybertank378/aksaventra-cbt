import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardSection from "@/sections/dashboard/pages/DashboardSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Dashboard CBT - Aksaventra CBT",
  description:
    "Pusat Komando & Pemantauan Sistem Ujian Berbasis Komputer Aksaventra",
};

export default function DashboardPage() {
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
        role="ADMIN"
        user={{
          id: "admin-1",
          name: "Administrator CBT",
          email: "admin@aksaventra.sch.id",
          role: "ADMIN",
        }}
        title="Aksaventra CBT Control Center"
        subtitle="Pusat Komando & Pemantauan Sistem Ujian Berbasis Komputer"
      >
        <DashboardSection />
      </AppLayout>
    </Suspense>
  );
}
