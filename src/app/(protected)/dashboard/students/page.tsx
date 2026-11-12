import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import StudentsSection from "@/sections/classes/pages/StudentsSection";

export const metadata: Metadata = {
  title: "Daftar Peserta Didik (Siswa) - Aksaventra CBT",
  description: "Manajemen akun login dan penempatan rombel siswa",
};

export const instant = false;

export default async function StudentsPage() {
  const user = await getCurrentUser();
  return <StudentsSection userRole={user?.role ?? "ADMIN"} />;
}
