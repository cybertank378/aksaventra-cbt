import type { Metadata } from "next";
import ClassesSection from "@/sections/classes/pages/ClassesSection";
import AppLayout from "@/shared-ui/layout/AppLayout";

export const metadata: Metadata = {
  title: "Manajemen Kelas & Rombel - Aksaventra CBT",
  description: "Kelola rombongan belajar siswa untuk penugasan ujian CBT",
};

export default function ClassesPage() {
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
      title="Manajemen Rombongan Belajar (Kelas)"
      subtitle="Pengelompokan siswa ke dalam rombel untuk distribusi ujian massal"
    >
      <ClassesSection />
    </AppLayout>
  );
}
