import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import ResultsIndexSection from "@/sections/recapitulation/pages/ResultsIndexSection";

export const metadata: Metadata = {
  title: "Hasil & Rekapitulasi Nilai Ujian - Aksaventra CBT",
  description: "Daftar hasil ujian dan analisis ketercapaian KKM siswa",
};

export const instant = false;

export default async function ResultsIndexPage() {
  const user = await getCurrentUser();
  return <ResultsIndexSection userRole={user?.role ?? "TEACHER"} />;
}
