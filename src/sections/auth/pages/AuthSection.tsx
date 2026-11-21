"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";
import LoginForm, { type LoginFormProps } from "../organisms/LoginForm";

export interface AuthSectionProps extends LoginFormProps {
  systemVersion?: string;
}

export const AuthSection: FC<AuthSectionProps> = ({
  systemVersion = "v1.0.0",
  ...loginProps
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-slate-50 px-4 py-8 sm:px-6">
      {/* Top Aksaventra Brand Bar */}
      <header className="flex flex-col items-center gap-2 pt-4 sm:pt-8 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-md">
            <Image
              src="/assets/images/logo/web-app-manifest-192x192.png"
              alt="Aksaventra CBT"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0d2b5c]">
              Aksaventra <span className="text-[#0097a7]">CBT</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Zero-Latency Exam Workspace
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Badge color="primary" variant="soft" size="sm">
            High-Performance Engine
          </Badge>
          <Badge color="teal" variant="soft" size="sm">
            Moodle mod_cbt Integrated
          </Badge>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="my-auto flex w-full max-w-md items-center justify-center py-6">
        <LoginForm {...loginProps} />
      </main>

      {/* Footer info & security badge */}
      <footer className="flex flex-col items-center gap-2 text-center text-xs text-slate-500 pb-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <ShieldCheck size={15} className="text-emerald-600" />
          <span>Koneksi Aman & Terproteksi Token Device Binding</span>
        </div>
        <p className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} Aksaventra Computer-Based Testing
          System &middot; {systemVersion}
        </p>
      </footer>
    </div>
  );
};

export default AuthSection;
