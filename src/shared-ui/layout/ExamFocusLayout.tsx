"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export interface ExamFocusLayoutProps {
  children: ReactNode;
  examTitle?: string;
  courseName?: string;
  studentName?: string;
  studentId?: string;
  roomCode?: string;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}

export default function ExamFocusLayout({
  children,
  examTitle = "Ujian CBT Online",
  courseName,
  studentName,
  studentId,
  roomCode,
  headerCenter,
  headerRight,
  className,
}: ExamFocusLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 select-none antialiased">
      {/* DEEP NAVY CBT HEADER */}
      <header className="sticky top-0 z-40 h-16 w-full bg-[#0d2b5c] text-white shadow-md border-b border-[#163b78] px-4 md:px-6 flex items-center justify-between">
        {/* LEFT: BRAND & EXAM INFO */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0097a7] flex items-center justify-center font-black text-white text-base shadow-sm">
              A
            </div>
            <div className="hidden sm:block">
              <span className="font-bold tracking-tight text-white text-sm md:text-base">
                Aksaventra
              </span>
              <span className="text-[#0097a7] text-xs font-semibold ml-1">
                CBT
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/20 hidden md:block" />

          <div className="min-w-0 truncate">
            <h1 className="text-sm md:text-base font-bold text-white truncate">
              {examTitle}
            </h1>
            {courseName && (
              <p className="text-xs text-[#0097a7] font-medium truncate">
                {courseName}
              </p>
            )}
          </div>
        </div>

        {/* CENTER: TIMER / PROCTOR BADGE SLOT */}
        {headerCenter && (
          <div className="flex items-center justify-center mx-2 shrink-0">
            {headerCenter}
          </div>
        )}

        {/* RIGHT: STUDENT METADATA & ACTIONS */}
        <div className="flex items-center gap-3 shrink-0">
          {(studentName || roomCode) && (
            <div className="hidden lg:flex items-center gap-2 text-right">
              <div>
                {studentName && (
                  <p className="text-xs font-semibold text-white leading-tight">
                    {studentName}
                  </p>
                )}
                <div className="flex items-center gap-1.5 justify-end text-[11px] text-white/70">
                  {studentId && <span>{studentId}</span>}
                  {roomCode && (
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[#0097a7] font-mono font-medium">
                      {roomCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {headerRight && (
            <div className="flex items-center gap-2">{headerRight}</div>
          )}
        </div>
      </header>

      {/* WORKSPACE CANVAS */}
      <main className={clsx("flex-1 p-3 md:p-6 overflow-x-hidden", className)}>
        {children}
      </main>
    </div>
  );
}

export { ExamFocusLayout };
