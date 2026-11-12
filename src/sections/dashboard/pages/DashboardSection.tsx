"use client";

import { type FC, useState } from "react";
import type { UserRole } from "@/libs/enums";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import AdminDashboard from "../organisms/AdminDashboard";
import ProctorDashboard from "../organisms/ProctorDashboard";
import TeacherDashboard from "../organisms/TeacherDashboard";

export interface DashboardSectionProps {
  initialRole?: UserRole;
  userRole?: UserRole;
}

export const DashboardSection: FC<DashboardSectionProps> = ({
  initialRole,
  userRole,
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(
    userRole ?? initialRole ?? "ADMIN",
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Role Switcher for Demonstration & Testing */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Pratinjau Mode Peran (Role View):
          </span>
          <div className="flex items-center gap-1.5">
            {(["ADMIN", "PROCTOR", "TEACHER"] as UserRole[]).map((r) => (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={currentRole === r ? "filled" : "outline"}
                color={currentRole === r ? "primary" : "secondary"}
                onClick={() => setCurrentRole(r)}
                className="rounded-lg"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Aksaventra CBT • Moodle Multi-Role Architecture
        </span>
      </Card>

      {/* Role-Specific Dashboard View */}
      {currentRole === "ADMIN" && <AdminDashboard />}
      {currentRole === "TEACHER" && <TeacherDashboard />}
      {currentRole === "PROCTOR" && <ProctorDashboard />}
    </div>
  );
};

export default DashboardSection;
