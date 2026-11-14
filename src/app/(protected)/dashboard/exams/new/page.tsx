import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import CreateExamSection from "@/sections/exams/pages/CreateExamSection";

export const metadata: Metadata = {
  title: "Buat Jadwal Ujian Baru - Aksaventra CBT",
  description:
    "Konfigurasi mata pelajaran, durasi waktu, token ruangan, dan kebijakan proteksi",
};

export const instant = false;

export default async function NewExamPage() {
  const user = await getCurrentUser();
  return <CreateExamSection userRole={user?.role ?? "TEACHER"} />;
}
