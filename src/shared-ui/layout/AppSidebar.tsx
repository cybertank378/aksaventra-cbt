"use client";

import clsx from "clsx";
import {
  BarChart2,
  BookOpen,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Megaphone,
  Radio,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  // biome-ignore lint/suspicious/noExplicitAny: generic icon component
  icon: React.ComponentType<any>;
  allowedRoles: UserRole[];
  badge?: string;
}

export interface NavigationCategory {
  category: string;
  items: NavigationMenuItem[];
}

export const DEFAULT_NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    category: "UTAMA",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["ADMIN", "TEACHER", "PROCTOR"],
      },
      {
        id: "proctor",
        title: "Monitoring Ujian",
        path: "/dashboard/proctor",
        icon: Radio,
        allowedRoles: ["ADMIN", "TEACHER", "PROCTOR"],
        badge: "Live",
      },
    ],
  },
  {
    category: "MANAJEMEN",
    items: [
      {
        id: "classes",
        title: "Data Kelas",
        path: "/dashboard/classes",
        icon: Building2,
        allowedRoles: ["ADMIN", "TEACHER"],
      },
      {
        id: "subjects",
        title: "Mata Pelajaran",
        path: "/dashboard/subjects",
        icon: BookOpen,
        allowedRoles: ["ADMIN", "TEACHER"],
      },
      {
        id: "exams",
        title: "Kelola Ujian",
        path: "/dashboard/exams",
        icon: FileText,
        allowedRoles: ["ADMIN", "TEACHER"],
      },
      {
        id: "create-question",
        title: "Buat Soal",
        path: "/dashboard/questions/new",
        icon: LayoutGrid,
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
        title: "Data Siswa",
        path: "/dashboard/students",
        icon: Users,
        allowedRoles: ["ADMIN", "TEACHER"],
      },
      {
        id: "exam-cards",
        title: "Kartu Ujian",
        path: "/dashboard/exam-cards",
        icon: CreditCard,
        allowedRoles: ["ADMIN", "TEACHER"],
      },
    ],
  },
  {
    category: "KOMUNIKASI",
    items: [
      {
        id: "announcements",
        title: "Pengumuman",
        path: "/dashboard/announcements",
        icon: Megaphone,
        allowedRoles: ["ADMIN", "TEACHER", "PROCTOR"],
      },
    ],
  },
  {
    category: "LAPORAN",
    items: [
      {
        id: "results",
        title: "Hasil Ujian",
        path: "/dashboard/results",
        icon: BarChart2,
        allowedRoles: ["ADMIN", "TEACHER"],
      },
    ],
  },
];

export const DEFAULT_NAVIGATION_ITEMS: NavigationMenuItem[] =
  DEFAULT_NAVIGATION_CATEGORIES.flatMap((c) => c.items);

interface AppSidebarProps {
  role?: UserRole;
  user?: SidebarUserSummary | null;
  mobileOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  categories?: NavigationCategory[];
  menuItems?: NavigationMenuItem[];
}

export default function AppSidebar({
  role = "ADMIN",
  user,
  mobileOpen = false,
  onClose,
  onLogout,
  categories = DEFAULT_NAVIGATION_CATEGORIES,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

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
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/90 text-slate-700 shadow-xl lg:shadow-xs transition-all duration-300 lg:static",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* SIDEBAR HEADER: CBT ONLINE LOGO */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">
                  CBT ONLINE
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Aksaventra CBT
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Perlebar navigasi" : "Ciutkan navigasi"}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* NAVIGATION LIST GROUPED BY CATEGORY */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {categories.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !role || item.allowedRoles.includes(role),
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.category} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400/90">
                    — {group.category}
                  </p>
                )}

                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.path ||
                      (item.path !== "/dashboard" &&
                        pathname?.startsWith(item.path));

                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150",
                          isActive
                            ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/25 font-bold"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                          collapsed && "justify-center px-0",
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.title}</span>
                        )}
                        {!collapsed && item.badge && (
                          <Badge
                            size="sm"
                            variant="filled"
                            color="gold"
                            className="ml-auto text-[10px]"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER: USER & LOGOUT BUTTON */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2 border border-slate-100">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d2b5c] text-white font-bold text-xs">
                {user?.name ? user.name[0]?.toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {user?.role || role}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogoutClick}
            className={clsx(
              "w-full flex items-center justify-center gap-2 rounded-2xl py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 transition-colors",
              collapsed && "px-0",
            )}
            title="Keluar"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export { AppSidebar };
