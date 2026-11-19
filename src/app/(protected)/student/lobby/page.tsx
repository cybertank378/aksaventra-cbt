import type { Metadata } from "next";
import { Suspense } from "react";
import StudentLobbyIndexSection from "@/sections/student-lobby/pages/StudentLobbyIndexSection";

export const metadata: Metadata = {
  title: "Lobi Ujian Siswa - Aksaventra CBT",
  description: "Daftar ujian aktif dan ruang persiapan pengerjaan ujian siswa",
};

export default function StudentLobbyIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <StudentLobbyIndexSection />
    </Suspense>
  );
}
