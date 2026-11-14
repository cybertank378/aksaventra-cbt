import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import DashboardSection from "@/sections/dashboard/pages/DashboardSection";

export const metadata: Metadata = {
  title: "Dashboard CBT - Aksaventra CBT",
  description:
    "Pusat Komando & Pemantauan Sistem Ujian Berbasis Komputer Aksaventra",
};

export const instant = false;

async function DashboardContent() {
  const user = await getCurrentUser();
  return (
    <DashboardSection
      initialRole={user?.role ?? "ADMIN"}
      userRole={user?.role ?? "ADMIN"}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] w-full items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

