import type { UserRole } from "./rbacConfig";

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  allowedRoles: UserRole[];
  badge?: string;
}

export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard-overview",
    title: "Overview",
    path: "/dashboard",
    icon: "LayoutDashboard",
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "proctor-center",
    title: "Command Center Pengawas",
    path: "/dashboard/proctor",
    icon: "ShieldAlert",
    allowedRoles: ["ADMIN", "TEACHER", "PROCTOR"],
    badge: "Live",
  },
  {
    id: "exam-management",
    title: "Manajemen Ujian",
    path: "/dashboard/exams",
    icon: "FileText",
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "question-bank",
    title: "Bank Soal",
    path: "/dashboard/questions",
    icon: "HelpCircle",
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "student-roster",
    title: "Daftar Siswa",
    path: "/dashboard/students",
    icon: "Users",
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "audit-reports",
    title: "Laporan & Audit",
    path: "/dashboard/reports",
    icon: "BarChart3",
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "system-settings",
    title: "Pengaturan Sistem",
    path: "/dashboard/admin/settings",
    icon: "Settings",
    allowedRoles: ["ADMIN"],
  },
];

/**
 * Filters sidebar navigation items based on user's authorized role.
 */
export function getAccessibleMenuItems(role: string): MenuItem[] {
  const normalizedRole = role.toUpperCase() as UserRole;
  return SIDEBAR_MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(normalizedRole),
  );
}
