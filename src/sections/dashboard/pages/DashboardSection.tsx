"use client";

import { type FC, useState } from "react";
import type { UserRole } from "@/libs/enums";
import AdminDashboard from "../organisms/AdminDashboard";
import ProctorDashboard from "../organisms/ProctorDashboard";
import TeacherDashboard from "../organisms/TeacherDashboard";

export interface DashboardSectionProps {
  initialRole?: UserRole;
}

export const DashboardSection: FC<DashboardSectionProps> = ({
  initialRole = "ADMIN",
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);

  return (
    <div className="flex flex-col gap-6 w-full">
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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
          Aksaventra CBT • Moodle Multi-Role Architecture
        </span>
      </div>

      {/* Role-Specific Dashboard View */}
      {currentRole === "ADMIN" && <AdminDashboard />}
      {currentRole === "TEACHER" && <TeacherDashboard />}
      {currentRole === "PROCTOR" && <ProctorDashboard />}
    </div>
  );
};

export default DashboardSection;
