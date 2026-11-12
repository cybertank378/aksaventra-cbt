import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ProctorRoomSection from "@/sections/proctor-room/pages/ProctorRoomSection";

export const metadata: Metadata = {
  title: "Ruang Kendali Pengawas (Proctor Command Center) - Aksaventra CBT",
  description:
    "Live monitoring peserta ujian, intervensi strike, dan proyektor token ruangan",
};

interface ProctorRoomPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ProctorRoomPage({
  params,
}: ProctorRoomPageProps) {
  const { examId } = await params;
  const user = await getCurrentUser();
  return (
    <ProctorRoomSection
      examId={examId}
      examTitle="Ujian Penilaian Akhir Semester CBT"
      roomCode="LAB-01"
      userRole={user?.role ?? "PROCTOR"}
    />
  );
}
