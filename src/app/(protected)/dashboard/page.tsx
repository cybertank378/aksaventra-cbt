"use client";

import { useState } from "react";
import type { UserRole } from "@/libs/enums";
import AppLayout from "@/shared-ui/layout/AppLayout";
import AdminDashboard from "./components/AdminDashboard";
import ProctorDashboard from "./components/ProctorDashboard";
import TeacherDashboard from "./components/TeacherDashboard";

export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN");

  const mockUser = {
    id: "user-admin-1",
    name:
      currentRole === "ADMIN"
        ? "Administrator CBT"
        : currentRole === "PROCTOR"
          ? "Budi Prasetyo, S.Kom"
          : "Dewi Anggraini, M.Pd",
    email:
      currentRole === "ADMIN"
        ? "admin@aksaventra.sch.id"
        : currentRole === "PROCTOR"
          ? "pengawas@aksaventra.sch.id"
          : "guru.matematika@aksaventra.sch.id",
    role: currentRole,
  };

  return (
    <AppLayout
      role={currentRole}
      user={mockUser}
      title="Aksaventra CBT Control Center"
      subtitle="Pusat Komando & Pemantauan Sistem Ujian Berbasis Komputer"
    >
      <div className="flex flex-col gap-6">
        {/* Role Switcher for Demonstration & Testing */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Pratinjau Mode Peran (Role View):
            </span>
            <div className="flex items-center gap-1.5">
              {(["ADMIN", "PROCTOR", "TEACHER"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCurrentRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentRole === r
                      ? "bg-[#0d2b5c] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            Login sebagai:{" "}
            <strong className="text-slate-700">{mockUser.name}</strong>
          </span>
        </div>

        {/* Role-Specific Dashboard View */}
        {currentRole === "ADMIN" && <AdminDashboard />}
        {currentRole === "PROCTOR" && <ProctorDashboard />}
        {currentRole === "TEACHER" && <TeacherDashboard />}
      </div>
    </AppLayout>
  );
}
