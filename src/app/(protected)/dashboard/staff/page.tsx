import type { Metadata } from "next";
import StaffManagementSection from "@/sections/staff/pages/StaffManagementSection";

export const metadata: Metadata = {
  title: "Manajemen Pengawas & Guru - Aksaventra CBT",
  description:
    "Kelola akun proktor ruang ujian (1 proktor = 1 ruang) dan guru pembuat soal",
};

export const instant = false;

export default function StaffManagementPage() {
  return <StaffManagementSection />;
}
