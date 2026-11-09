import type { Metadata } from "next";
import StudentsSection from "@/sections/classes/pages/StudentsSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Daftar Peserta Didik (Siswa) - Aksaventra CBT",
  description: "Manajemen akun login dan penempatan rombel siswa",
};

export default function StudentsPage() {
  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="ADMIN"
      user={{
        id: "admin-1",
        name: "Administrator CBT",
        email: "admin@aksaventra.sch.id",
        role: "ADMIN",
      }}
      title="Daftar Peserta Didik (Siswa)"
      subtitle="Pengelolaan akun login dan pemetaan rombel belajar siswa"
    >
      <StudentsSection />
    </AppLayout>
  );
}
