import type { Metadata } from "next";
import { Suspense, use } from "react";
import StudentLobbySection from "@/sections/student-lobby/pages/StudentLobbySection";

export const metadata: Metadata = {
  title: "Lobi Ujian Siswa - Aksaventra CBT",
  description: "Ruang persiapan dan verifikasi token pengerjaan ujian siswa",
};

export const instant = false;

interface StudentLobbyPageProps {
  params: Promise<{ examId: string }>;
}

function LobbyContent({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  return <StudentLobbySection examId={examId} />;
}

export default function StudentLobbyPage({ params }: StudentLobbyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <LobbyContent params={params} />
    </Suspense>
  );
}
