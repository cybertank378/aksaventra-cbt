"use client";

import {
  Bell,
  ChevronDown,
  LogOut,
  type LucideIcon,
  Menu,
  Search,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FC,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { UserRole } from "@/libs/enums";
import Avatar from "@/shared-ui/component/Avatar";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import { DropdownItem } from "@/shared-ui/component/DropdownItem";

export interface TopbarMenuItem {
  label: string;
  icon?: LucideIcon;
  path?: string;
  badge?: string;
  onClick?: () => void;
}

export interface AppTopbarProps {
  role?: UserRole;
  username?: string;
  userEmail?: string;
  userImage?: string | null;
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onLogout?: () => void | Promise<void>;
  isLoggingOut?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  quickActionSlot?: ReactNode;
  menuItems?: TopbarMenuItem[];
}

const roleBadgeMap: Record<UserRole, { label: string; color: BadgeColor }> = {
  ADMIN: { label: "Admin", color: "primary" },
  TEACHER: { label: "Guru", color: "teal" },
  PROCTOR: { label: "Pengawas", color: "gold" },
  STUDENT: { label: "Siswa", color: "neutral" },
};

function resolveCbtHeader(pathname: string): {
  title: string;
  subtitle: string;
} {
  if (pathname.startsWith("/proctor")) {
    return {
      title: "Pusat Kendali Pengawas",
      subtitle:
        "Monitoring peserta, pelanggaran, dan intervensi ujian realtime",
    };
  }
  if (pathname.startsWith("/exams")) {
    return {
      title: "Bank Ujian & Soal",
      subtitle: "Kelola daftar ujian, konfigurasi durasi, dan token akses",
    };
  }
  if (pathname.startsWith("/attempts")) {
    return {
      title: "Riwayat & Sesi Ujian",
      subtitle: "Status pengerjaan, log pelanggaran, dan finalisasi attempt",
    };
  }
  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Dashboard Utama",
      subtitle: "Ringkasan metrik performa CBT dan status aktivitas peserta",
    };
  }
  return {
    title: "Aksaventra CBT",
    subtitle: "High-Performance Zero-Latency Exam Workspace",
  };
}

const AppTopbar: FC<AppTopbarProps> = ({
  role = "ADMIN",
  username = "Pengguna",
  userEmail,
  userImage,
  title,
  subtitle,
  onMenuClick,
  onLogout,
  isLoggingOut = false,
  onSearch,
  searchPlaceholder = "Cari ujian, siswa, atau token...",
  quickActionSlot,
  menuItems = [],
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const headerMeta = resolveCbtHeader(pathname);
  const displayTitle = title || headerMeta.title;
  const displaySubtitle = subtitle || headerMeta.subtitle;
  const roleInfo = roleBadgeMap[role] || {
    label: role,
    color: "neutral" as BadgeColor,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md md:px-6">
      {/* LEFT SECTION: HAMBURGER & DYNAMIC TITLE */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka navigasi sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-[#0d2b5c] md:text-base">
            {displayTitle}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            {displaySubtitle}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: SEARCH, ACTIONS, NOTIFICATIONS, PROFILE */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="hidden h-9 w-48 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 transition-colors focus-within:border-[#0097a7] focus-within:bg-white lg:flex xl:w-64">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Quick Action Slot */}
        {quickActionSlot && (
          <div className="hidden items-center sm:flex">{quickActionSlot}</div>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          title="Notifikasi"
          aria-label="Notifikasi"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0d2b5c]"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* USER PROFILE PILL & DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Menu pengguna"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1 pr-2.5 transition-all hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          >
            <Avatar
              name={username}
              image={userImage}
              size="sm"
              className="bg-[#0d2b5c] text-white"
            />
            <div className="hidden text-left sm:block">
              <p className="max-w-[120px] truncate text-xs font-bold text-slate-900 leading-tight">
                {username}
              </p>
              <Badge
                color={roleInfo.color}
                size="sm"
                variant="soft"
                className="px-1.5 py-0 text-[10px]"
              >
                {roleInfo.label}
              </Badge>
            </div>
            <ChevronDown
              size={14}
              className="text-slate-400 transition-transform duration-150"
            />
          </button>

          {/* DROPDOWN MENU */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
              {/* Header */}
              <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                <p className="truncate text-xs font-bold text-slate-900">
                  {username}
                </p>
                {userEmail && (
                  <p className="truncate text-[11px] text-slate-500">
                    {userEmail}
                  </p>
                )}
                <div className="mt-1.5">
                  <Badge color={roleInfo.color} size="sm" variant="filled">
                    {roleInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Dynamic Menu Items */}
              {menuItems.length > 0 ? (
                <div className="py-1">
                  {menuItems.map((item) => (
                    <DropdownItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      onClick={() => {
                        setIsOpen(false);
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.path) {
                          router.push(item.path);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-1">
                  <DropdownItem
                    icon={User}
                    label="Profil Saya"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/profile");
                    }}
                  />
                </div>
              )}

              {/* Logout Button */}
              {onLogout && (
                <div className="border-t border-slate-100 p-2.5">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    loading={isLoggingOut}
                    variant="filled"
                    color="danger"
                    size="sm"
                    leftIcon={LogOut}
                    fullWidth
                  >
                    {isLoggingOut ? "Keluar..." : "Keluar (Logout)"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppTopbar;
