"use client";

import clsx from "clsx";
import {
  ChevronsLeft,
  ChevronsRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/libs/enums";
import Badge from "@/shared-ui/component/Badge";

export interface SidebarUserSummary {
  id?: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: UserRole;
  image?: string | null;
}

export interface NavigationMenuItem {
  id: string;
  title: string;
  path: string;
  icon: typeof LayoutDashboard;
  allowedRoles: UserRole[];
  badge?: string;
}

export const DEFAULT_NAVIGATION_ITEMS: NavigationMenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "proctor",
    title: "Command Center Pengawas",
    path: "/dashboard/proctor",
    icon: ShieldAlert,
    allowedRoles: ["ADMIN", "TEACHER", "PROCTOR"],
    badge: "Live",
  },
  {
    id: "exams",
    title: "Manajemen Ujian",
    path: "/dashboard/exams",
    icon: FileText,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "questions",
    title: "Bank Soal",
    path: "/dashboard/questions",
    icon: HelpCircle,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    id: "students",
    title: "Daftar Siswa",
    path: "/dashboard/students",
    icon: Users,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
];

interface AppSidebarProps {
  role?: UserRole;
  user?: SidebarUserSummary | null;
  mobileOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  menuItems?: NavigationMenuItem[];
}

export default function AppSidebar({
  role = "ADMIN",
  user,
  mobileOpen = false,
  onClose,
  onLogout,
  menuItems = DEFAULT_NAVIGATION_ITEMS,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredItems = menuItems.filter(
    (item) => !role || item.allowedRoles.includes(role),
  );

  return (
    <>
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 h-full w-full cursor-default border-none bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0d2b5c] text-white shadow-xl transition-all duration-300 lg:static",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0097a7] font-black text-white shadow-sm">
              A
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold tracking-tight text-white text-base">
                  Aksaventra
                </span>
                <span className="ml-1 rounded bg-[#0097a7]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#0097a7]">
                  CBT
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path !== "/dashboard" && pathname?.startsWith(item.path));

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#0097a7] text-white shadow-sm font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
                {!collapsed && item.badge && (
                  <Badge
                    size="sm"
                    variant="filled"
                    color="gold"
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER: USER & LOGOUT */}
        <div className="border-t border-white/10 p-3">
          <div
            className={clsx(
              "flex items-center gap-3 rounded-xl bg-white/5 p-2.5",
              collapsed && "justify-center p-2",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0097a7]/20 text-[#0097a7] font-bold text-sm">
              {user?.name ? user.name[0]?.toUpperCase() : "U"}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || "Pengguna"}
                </p>
                <p className="text-[11px] text-white/50 truncate font-mono">
                  {user?.role || role}
                </p>
              </div>
            )}

            {!collapsed && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-white/60 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export { AppSidebar };
