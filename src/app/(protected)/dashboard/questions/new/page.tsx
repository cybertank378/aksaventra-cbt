import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import CreateQuestionSection from "@/sections/questions/pages/CreateQuestionSection";

export const metadata: Metadata = {
  title: "Buat Butir Soal Baru - Aksaventra CBT",
  description: "Formulir penambahan butir soal CBT 8 tipe pertanyaan",
};

export default async function CreateQuestionPage() {
  const user = await getCurrentUser();
  return <CreateQuestionSection userRole={user?.role ?? "TEACHER"} />;
}
