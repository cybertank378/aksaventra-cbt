import type { Metadata } from "next";
import { Suspense } from "react";
import AuthSection from "@/sections/auth/pages/AuthSection";

export const metadata: Metadata = {
  title: "Masuk - Aksaventra CBT",
  description: "Halaman autentikasi sistem ujian terpadu Aksaventra CBT",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <AuthSection />
    </Suspense>
  );
}
