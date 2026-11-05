"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useMemo } from "react";
import type { UserRole } from "@/libs/enums";
import { canAccess } from "@/security/fieldGuard";
import type { Permission } from "@/security/Permissions";

export type SidebarBadgeTone = "primary" | "emerald" | "warning" | "neutral";

export interface SidebarItemBadge {
  label: string;
  tone?: SidebarBadgeTone;
}

export type SidebarItem = {
  label: string;
  path?: string;
  icon?: React.ElementType;
  permission?: Permission;
  badge?: SidebarItemBadge;
  external?: boolean;
  activeMatchPrefixes?: string[];
  children?: SidebarItem[];
};

interface Props {
  item: SidebarItem;
  role?: UserRole;
  depth?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
  openKey: string | null;
  setOpenKey: React.Dispatch<React.SetStateAction<string | null>>;
}

function getBadgeToneClasses(tone: SidebarBadgeTone = "primary"): string {
  switch (tone) {
    case "primary":
      return "rounded-full border border-blue-200/90 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600";
    case "emerald":
      return "rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600";
    case "warning":
      return "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700";
    case "neutral":
      return "px-1.5 text-xs font-semibold text-slate-400 group-hover:text-blue-600";
  }
}

function getCollapsedDotColor(tone: SidebarBadgeTone = "primary"): string {
  switch (tone) {
    case "emerald":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    default:
      return "bg-blue-600";
  }
}

export function RecursiveSidebarItem({
  item,
  role = "ADMIN",
  depth = 0,
  collapsed = false,
  onNavigate,
  openKey,
  setOpenKey,
}: Props) {
  const pathname = usePathname();

  const allowed = useMemo(() => {
    if (!item.permission) {
      return true;
    }
    return canAccess(role, item.permission);
  }, [item.permission, role]);

  const hasChildren = Boolean(item.children?.length);

  const isActive = useMemo(() => {
    if (item.path && pathname === item.path) {
      return true;
    }

    if (
      item.activeMatchPrefixes?.some((prefix) => pathname.startsWith(prefix))
    ) {
      return true;
    }

    return (
      item.children?.some((child) =>
        child.path ? pathname.startsWith(child.path) : false,
      ) ?? false
    );
  }, [item.activeMatchPrefixes, item.children, item.path, pathname]);

  const itemKey = item.path ?? item.label;
  const open = openKey === itemKey;

  if (!allowed) {
    return null;
  }

  const Icon = item.icon;
  const paddingLeft = collapsed ? 0 : 12 + depth * 16;

  const expandedItemClass = clsx(
    "group flex h-11 w-full items-center justify-between rounded-xl pr-3 transition-all duration-150",
    isActive
      ? "bg-blue-600 font-semibold text-white shadow-sm shadow-blue-600/25"
      : "border border-transparent font-medium text-slate-600 hover:border-blue-200/80 hover:bg-blue-50/70 hover:text-blue-600",
  );

  const collapsedItemClass = clsx(
    "group relative mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150",
    isActive
      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
      : "border border-transparent text-slate-500 hover:border-blue-200/80 hover:bg-blue-50/70 hover:text-blue-600",
  );

  const handleToggle = () => {
    setOpenKey((prev) => (prev === itemKey ? null : itemKey));
  };

  if (collapsed) {
    return (
      <div className="flex justify-center py-0.5">
        <Link
          href={item.path ?? "#"}
          onClick={onNavigate}
          title={item.label}
          aria-label={item.label}
          className={collapsedItemClass}
        >
          {Icon && (
            <Icon
              size={19}
              className={clsx(
                "shrink-0 transition-colors",
                isActive
                  ? "text-white"
                  : "text-slate-500 group-hover:text-blue-600",
              )}
            />
          )}

          {!isActive && item.badge && (
            <span
              className={clsx(
                "absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white",
                getCollapsedDotColor(item.badge.tone),
              )}
            />
          )}
        </Link>
      </div>
    );
  }

  const rightBadgeElement = isActive ? (
    <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white">
      Aktif
    </span>
  ) : item.badge ? (
    <span className={getBadgeToneClasses(item.badge.tone)}>
      {item.badge.label}
    </span>
  ) : item.external ? (
    <ExternalLink
      size={14}
      className="shrink-0 text-slate-400 transition-colors group-hover:text-blue-600"
    />
  ) : null;

  return (
    <div className="space-y-1">
      {hasChildren ? (
        <button
          type="button"
          onClick={handleToggle}
          style={{ paddingLeft }}
          className={expandedItemClass}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <Icon
                size={18}
                className={clsx(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-blue-600",
                )}
              />
            )}
            <span className="truncate text-[13px]">{item.label}</span>
          </div>

          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown size={15} />
          </motion.div>
        </button>
      ) : (
        <Link
          href={item.path ?? "#"}
          onClick={onNavigate}
          style={{ paddingLeft }}
          className={expandedItemClass}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <Icon
                size={18}
                className={clsx(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-blue-600",
                )}
              />
            )}
            <span className="truncate text-[13px]">{item.label}</span>
          </div>

          {rightBadgeElement}
        </Link>
      )}

      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {item.children?.map((child) => (
                <RecursiveSidebarItem
                  key={child.path ?? child.label}
                  item={child}
                  role={role}
                  depth={depth + 1}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  openKey={openKey}
                  setOpenKey={setOpenKey}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
