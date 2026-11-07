import type { Metadata } from "next";
import { Suspense, use } from "react";
import ProctorRoomSection from "@/sections/proctor-room/pages/ProctorRoomSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Ruang Kendali Pengawas (Proctor Command Center) - Aksaventra CBT",
  description:
    "Live monitoring peserta ujian, intervensi strike, dan proyektor token ruangan",
};

interface ProctorRoomPageProps {
  params: Promise<{ examId: string }>;
}

function ProctorRoomContent({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="PROCTOR"
      user={{
        id: "proctor-1",
        name: "Pengawas Ruang CBT",
        email: "pengawas@aksaventra.sch.id",
        role: "PROCTOR",
      }}
      title="Ruang Kendali Pengawas"
      subtitle="Pemantauan Interaktif Peserta Ujian & Rotasi Token Real-Time"
    >
      <ProctorRoomSection
        examId={examId}
        examTitle="Ujian Penilaian Akhir Semester CBT"
        roomCode="LAB-01"
      />
    </AppLayout>
  );
}

export default function ProctorRoomPage({ params }: ProctorRoomPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ProctorRoomContent params={params} />
    </Suspense>
  );
}
