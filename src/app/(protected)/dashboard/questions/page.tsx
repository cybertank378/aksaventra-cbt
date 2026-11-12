import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import QuestionsCatalogSection from "@/sections/questions/pages/QuestionsCatalogSection";

export const metadata: Metadata = {
  title: "Bank Soal CBT - Aksaventra CBT",
  description:
    "Katalog bank butir soal ujian dengan dukungan 8 jenis pertanyaan",
};

export const instant = false;

export default async function QuestionsCatalogPage() {
  const user = await getCurrentUser();
  return <QuestionsCatalogSection userRole={user?.role ?? "TEACHER"} />;
}
