import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ExamRoomsSection from "@/sections/classes/pages/ExamRoomsSection";

export const metadata: Metadata = {
  title: "Kelola Ruang & Tata Letak Meja Ujian - Aksaventra CBT",
  description:
    "Pengelolaan ruang ujian, pembuatan nomor meja otomatis, denah meja 2D, dan cetak PDF meja ujian",
};

export const instant = false;

export default async function ExamRoomsPage() {
  const user = await getCurrentUser();
  return <ExamRoomsSection userRole={user?.role ?? "ADMIN"} />;
}
