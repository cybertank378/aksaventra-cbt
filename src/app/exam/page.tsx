"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { generateDeviceFingerprint } from "@/security/deviceFingerprint";

function ExamLaunchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cbtid = searchParams.get("cbtid");
  const cmid = searchParams.get("cmid");
  const launchToken = searchParams.get("launch_token");
  const moodleApi = searchParams.get("moodle_api");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function performLaunchHandshake() {
      if (!cbtid || !launchToken) {
        setStatus("error");
        setErrorMessage(
          "Parameter SSO Moodle tidak lengkap (cbtid atau launch_token tidak ditemukan).",
        );
        return;
      }

      try {
        const deviceHash = await generateDeviceFingerprint();

        const response = await fetch("/api/auth/moodle-launch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moodleCbtId: Number.parseInt(cbtid, 10),
            launchToken,
            deviceHash,
          }),
        });

        const data = await response.json();

        if (isCancelled) return;

        if (response.ok && data.success) {
          setStatus("success");
          if (data.data?.user?.fullName) {
            setStudentName(data.data.user.fullName);
          }

          const redirectUrl =
            data.data?.redirectUrl || `/student/lobby/${cbtid}`;

          // Seamless zero-friction redirect with brief confirmation
          setTimeout(() => {
            router.replace(redirectUrl);
          }, 800);
        } else {
          setStatus("error");
          setErrorMessage(
            data?.error?.message ||
              "Gagal mengautentikasi sesi ujian dari Moodle. Token mungkin telah kedaluwarsa.",
          );
        }
      } catch (err) {
        if (isCancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan jaringan saat menghubungkan ke server.",
        );
      }
    }

    performLaunchHandshake();

    return () => {
      isCancelled = true;
    };
  }, [cbtid, launchToken, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-slate-50 px-4 py-8 sm:px-6">
      {/* Brand Header */}
      <header className="flex flex-col items-center gap-2 pt-6 text-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d2b5c] text-white shadow-md">
            <span className="font-extrabold text-xl tracking-wider text-[#eab308]">
              A
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0d2b5c]">
              AKSAVENTRA<span className="text-[#0097a7]">CBT</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Single Sign-On (SSO) Launch Bridge
            </span>
          </div>
        </div>
      </header>

      {/* Main Handshake Status Card */}
      <main className="my-auto w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
          {status === "loading" && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-[#0097a7]">
                <Loader2 size={36} className="animate-spin text-[#0097a7]" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0d2b5c]">
                Memverifikasi Sesi Moodle...
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Menyinkronkan kredensial ujian dan mengikat perangkat Anda ke lembar kerja ujian secara aman.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-[11px] font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                Moodle Activity ID: #{cbtid || "?"}
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0d2b5c]">
                Autentikasi Berhasil!
              </h2>
              <p className="mt-1 text-sm font-semibold text-teal-700">
                {studentName ? `Selamat datang, ${studentName}` : "Sesi Anda telah terhubung"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Mengarahkan Anda langsung ke lobi ujian...
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                <span>Membuka ruang pengerjaan...</span>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-center animate-in fade-in">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={36} className="text-rose-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-rose-700">
                Gagal Menghubungkan Sesi
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {errorMessage}
              </p>

              <div className="mt-6 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2b5c] px-4 py-2.5 font-semibold text-sm text-white shadow hover:bg-[#0d2b5c]/90 transition"
                >
                  <span>Coba Lagi</span>
                </button>

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <span>Masuk Manual via Halaman Login</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-1.5 text-center text-xs text-slate-400 pb-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-500">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Terproteksi Protokol Zero-Latency Moodle mod_cbt</span>
        </div>
        <p className="text-[11px]">&copy; {new Date().getFullYear()} Aksaventra CBT</p>
      </footer>
    </div>
  );
}

export default function ExamLaunchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 size={32} className="animate-spin text-[#0d2b5c]" />
        </div>
      }
    >
      <ExamLaunchContent />
    </Suspense>
  );
}

