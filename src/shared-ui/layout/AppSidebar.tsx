"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/libs/enums";
import type { AuthTelemetryResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import type { DashboardSummaryResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { useDashboardApi } from "@/modules/dashboards/presentation/hooks/useDashboardApi";
import { roleConfig } from "@/security/rbacConfig";
import {
  getSidebarMenu,
  type SidebarGroup,
} from "@/security/sidebar/getSidebarMenu";
import { showSuccessToast } from "@/shared-ui/component/Toast";
import {
  RecursiveSidebarItem,
  type SidebarItem,
} from "@/shared-ui/layout/sidebar/RecursiveSidebarItem";

export interface SidebarUserSummary {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
}

interface Props {
  role?: UserRole;
  user?: SidebarUserSummary | null;
  mobileOpen: boolean;
  onClose: () => void;
}

function getInitials(name?: string | null, fallback = "AU"): string {
  if (!name || !name.trim()) {
    return fallback;
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function AppSidebar({
  role = "ADMIN",
  user,
  mobileOpen,
  onClose,
}: Props) {
  const router = useRouter();
  const { logout, getTelemetry } = useAuthApi();
  const { getSummary } = useDashboardApi();

  const [collapsed, setCollapsed] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [summary, setSummary] = useState<DashboardSummaryResponseDTO | null>(
    null,
  );
  const [telemetry, setTelemetry] = useState<AuthTelemetryResponseDTO | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    getSummary()
      .then((res) => {
        if (active && res) {
          setSummary(res);
        }
      })
      .catch(() => {
        // Fallback jika ringkasan dasbor belum tersedia
      });

    getTelemetry()
      .then((res) => {
        if (active && res) {
          setTelemetry(res);
        }
      })
      .catch(() => {
        // Fallback jika telemetri sistem belum tersedia
      });

    return () => {
      active = false;
    };
  }, [getSummary, getTelemetry]);

  const groups = useMemo(() => {
    const baseGroups = getSidebarMenu(role);
    const activeLicensesLabel =
      summary !== null
        ? summary.kpis.activeLicenses.total.toLocaleString("id-ID")
        : "0";
    const utilizationLabel =
      summary !== null
        ? `${summary.kpis.hwidUtilization.rate.toFixed(0)}%`
        : "0%";

    return baseGroups.map((group: SidebarGroup) => ({
      ...group,
      items: group.items.map((item: SidebarItem): SidebarItem => {
        if (item.path === "/dashboard/licenses") {
          return {
            ...item,
            badge: {
              label: activeLicensesLabel,
              tone: "primary",
            },
          };
        }

        if (item.path === "/dashboard/engine/monitor") {
          return {
            ...item,
            badge: {
              label: utilizationLabel,
              tone: "emerald",
            },
          };
        }

        return item;
      }),
    }));
  }, [role, summary]);

  const displayName = user?.name?.trim() || "Admin Utama";
  const displaySubtitle =
    user?.email?.trim() || roleConfig[role]?.label || "Super Administrator";
  const userInitials = getInitials(user?.name, "AU");
  const isServerOnline = telemetry?.online ?? true;
  const uptimeLabel =
    telemetry !== null && typeof telemetry.uptimePercent === "number"
      ? `${telemetry.uptimePercent.toFixed(2)}%`
      : "100.00%";

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
      showSuccessToast("Sesi Anda telah diakhiri dengan aman.");
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderSidebarPanel = (isMobileDrawer: boolean) => {
    const isCollapsedView = !isMobileDrawer && collapsed;

    return (
      <div
        className={clsx(
          "flex h-screen flex-col border-r border-slate-200/90 bg-white transition-all duration-200",
          isCollapsedView ? "w-20" : "w-[264px]",
        )}
      >
        {/* ================================================= */}
        {/* 1. HEADER — IDENTITAS PRODUK AKSAVENTRA           */}
        {/* ================================================= */}
        <div
          className={clsx(
            "border-b border-slate-100",
            isCollapsedView ? "px-3 py-4" : "px-4 py-4",
          )}
        >
          {isCollapsedView ? (
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
                <Image
                  src="/assets/images/logo/logo.png"
                  alt="Aksaventra Logo"
                  width={28}
                  height={28}
                  style={{ width: "auto", height: "auto" }}
                  className="max-h-7 max-w-7 object-contain"
                />
              </div>

              <button
                type="button"
                onClick={handleToggleCollapse}
                title="Perluas Sidebar"
                aria-label="Perluas Sidebar"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
                  <Image
                    src="/assets/images/logo/logo.png"
                    alt="Aksaventra Logo"
                    width={28}
                    height={28}
                    style={{ width: "auto", height: "auto" }}
                    className="max-h-7 max-w-7 object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">
                      Aksaventra
                    </h1>
                    <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      V3.4
                    </span>
                  </div>

                  <p className="truncate text-[11px] font-medium text-slate-400">
                    Enterprise License Suite
                  </p>
                </div>
              </div>

              {!isMobileDrawer && (
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  title="Ringkas Sidebar"
                  aria-label="Ringkas Sidebar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                >
                  <ChevronsLeft size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* 2. NAVIGATION — MODUL OPERASIONAL & SISTEM        */}
        {/* ================================================= */}
        <nav
          className={clsx(
            "flex-1 overflow-y-auto bg-white py-4",
            isCollapsedView ? "px-2" : "px-3.5",
          )}
        >
          <div className="space-y-5">
            {groups.map((group: SidebarGroup, index: number) => (
              <div
                key={`group-${group.label ?? index}`}
                className={clsx(index > 0 && "border-t border-slate-100 pt-4")}
              >
                {!isCollapsedView && group.label && (
                  <div className="mb-2 px-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      {group.label}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  {group.items.map((item: SidebarItem, itemIndex: number) => (
                    <RecursiveSidebarItem
                      key={
                        item.path ??
                        `${group.label ?? "group"}-${item.label}-${itemIndex}`
                      }
                      item={item}
                      role={role}
                      collapsed={isCollapsedView}
                      onNavigate={onClose}
                      openKey={openKey}
                      setOpenKey={setOpenKey}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* ================================================= */}
        {/* 3. FOOTER — STATUS SERVER & KARTU SESI PENGGUNA   */}
        {/* ================================================= */}
        <div
          className={clsx(
            "border-t border-slate-100 bg-white",
            isCollapsedView ? "p-2.5" : "space-y-2.5 p-3.5",
          )}
        >
          {isCollapsedView ? (
            <div className="flex flex-col items-center gap-2.5">
              {/* Server Status Indicator (Collapsed) */}
              <div
                title={
                  isServerOnline
                    ? `Server Validasi Aktif (${uptimeLabel})`
                    : `Server Validasi Terkendala (${uptimeLabel})`
                }
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-xl border",
                  isServerOnline
                    ? "border-emerald-200/80 bg-emerald-50/70"
                    : "border-amber-200/80 bg-amber-50/70",
                )}
              >
                <span
                  className={clsx(
                    "h-2.5 w-2.5 rounded-full",
                    isServerOnline ? "bg-emerald-500" : "bg-amber-500",
                  )}
                />
              </div>

              {/* User Avatar & Logout Trigger (Collapsed) */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title={`${displayName} (${displaySubtitle}) — Klik untuk Keluar`}
                aria-label="Keluar dari Sesi"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xs font-extrabold text-white shadow-xs transition-transform hover:scale-105 disabled:opacity-60"
              >
                {userInitials}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </button>
            </div>
          ) : (
            <>
              {/* Indikator Uptime Server Validasi */}
              <div
                className={clsx(
                  "flex items-center justify-between rounded-xl border px-3.5 py-2",
                  isServerOnline
                    ? "border-emerald-200/90 bg-emerald-50/75"
                    : "border-amber-200/90 bg-amber-50/75",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "h-2 w-2 rounded-full",
                      isServerOnline ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-[11px] font-bold",
                      isServerOnline ? "text-emerald-800" : "text-amber-800",
                    )}
                  >
                    {isServerOnline
                      ? "Server Validasi Aktif"
                      : "Server Terkendala"}
                  </span>
                </div>

                <span
                  className={clsx(
                    "text-[11px] font-extrabold",
                    isServerOnline ? "text-emerald-600" : "text-amber-600",
                  )}
                >
                  {uptimeLabel}
                </span>
              </div>

              {/* Kartu Sesi Pengguna & Tombol Keluar */}
              <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-extrabold text-white">
                    {userInitials}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {displayName}
                    </p>
                    <p className="truncate text-[11px] font-medium text-slate-500">
                      {displaySubtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Keluar dari Sesi"
                  aria-label="Keluar dari Sesi"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50/80 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-60"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex">{renderSidebarPanel(false)}</aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <motion.aside
              className="fixed left-0 top-0 z-50 md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
            >
              {renderSidebarPanel(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
