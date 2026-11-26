import type { Metadata } from "next";
import { prisma } from "@/libs/prisma";
import { parseStoredRoomAndSeat } from "@/libs/roomSeatUtils";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ProctorRoomSection from "@/sections/proctor-room/pages/ProctorRoomSection";

export const metadata: Metadata = {
  title: "Ruang Kendali Pengawas (Proctor Command Center) - Aksaventra CBT",
  description:
    "Live monitoring peserta ujian, intervensi strike, dan proyektor token ruangan",
};

export const instant = false;

interface ProctorRoomPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ProctorRoomPage({
  params,
}: ProctorRoomPageProps) {
  const { examId } = await params;
  const user = await getCurrentUser();

  const [exam, dbUser] = await Promise.all([
    prisma.exam
      .findUnique({ where: { id: examId }, select: { title: true } })
      .catch(() => null),
    user?.userId
      ? prisma.user
          .findUnique({
            where: { id: String(user.userId) },
            select: { roomCode: true },
          })
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const parsedRoom = dbUser?.roomCode
    ? parseStoredRoomAndSeat(dbUser.roomCode).roomCode
    : undefined;

  const assignedRoomCode =
    user?.role === "PROCTOR" ? parsedRoom || "LAB-01" : undefined;

  return (
    <ProctorRoomSection
      examId={examId}
      examTitle={exam?.title || "Ruang Pengawasan Ujian CBT"}
      roomCode={assignedRoomCode}
      userRole={user?.role ?? "PROCTOR"}
    />
  );
}
