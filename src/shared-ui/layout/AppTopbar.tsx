"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import {
  type AvatarMenuItem,
  getAvatarMenuByRole,
} from "@/security/AvatarMenu";
import { roleConfig } from "@/security/rbacConfig";
import Avatar from "@/shared-ui/component/Avatar";
import Button from "@/shared-ui/component/Button";
import { DropdownItem } from "@/shared-ui/component/DropdownItem";

interface Props {
  role?: UserRole;
  username?: string;
  userImage?: string | null;
  onMenuClick?: () => void;
}

interface PageHeaderMeta {
  title: string;
  subtitle: string;
}

function resolvePageHeader(pathname: string): PageHeaderMeta {
  if (pathname === "/dashboard/licenses/create") {
    return {
      title: "Penerbitan Kunci Lisensi Baru",
      subtitle:
        "Konfigurasi serial key, paket lisensi, dan masa berlaku pelanggan",
    };
  }

  if (pathname === "/dashboard/licenses/devices") {
    return {
      title: "Perangkat & Aktivitas Lisensi",
      subtitle:
        "Pemantauan lisensi aktif dan versi engine yang digunakan perangkat klien",
    };
  }

  if (pathname === "/dashboard/licenses/revocations") {
    return {
      title: "Blacklist & Revokasi Lisensi",
      subtitle:
        "Daftar serial key yang dibekukan atau dicabut dari akses validasi engine",
    };
  }

  if (pathname.startsWith("/dashboard/licenses")) {
    return {
      title: "Manajemen Direktori Lisensi",
      subtitle:
        "Pemantauan status serial key, alokasi perangkat, dan masa aktif lisensi",
    };
  }

  if (pathname.startsWith("/dashboard/engine")) {
    return {
      title: "Monitor & Integritas Engine Aksaventra",
      subtitle:
        "Telemetri validasi real-time (/api/v1/validate) dan verifikasi checksum SHA-256",
    };
  }

  if (pathname === "/dashboard/logs/validations") {
    return {
      title: "Log Validasi Mesin (Engine Telemetry)",
      subtitle:
        "Rekam jejak seluruh permintaan otentikasi lisensi dari aksaventra_engine.exe",
    };
  }

  if (pathname.startsWith("/dashboard/logs")) {
    return {
      title: "Riwayat Aktivitas & Log Audit",
      subtitle:
        "Rekam jejak validasi mesin dan aktivitas keamanan administrator",
    };
  }

  if (pathname === "/dashboard/profile") {
    return {
      title: "Profil Akun & Pengaturan Keamanan Pribadi",
      subtitle:
        "Kelola identitas akun personel, pembaruan kata sandi Argon2id, dan perangkat yang sedang login",
    };
  }

  if (pathname === "/dashboard/security") {
    return {
      title: "Security Audit & Riwayat Tindakan Administrator",
      subtitle:
        "Pemantauan terpusat perubahan konfigurasi, pembaruan lisensi, dan deteksi percobaan login mencurigakan",
    };
  }

  if (pathname === "/dashboard/settings") {
    return {
      title: "Pengaturan Sistem & Kebijakan Keamanan",
      subtitle:
        "Konfigurasi parameter operasional lisensi, validasi engine, autentikasi, dan retensi log",
    };
  }

  return {
    title: "Ringkasan Eksekutif & Aktivitas Lisensi",
    subtitle:
      "Pemantauan kuota perangkat, masa berlaku paket, dan validasi lisensi pelanggan",
  };
}

export default function AppTopbar({
  role = "ADMIN",
  username,
  userImage,
  onMenuClick,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthApi();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const avatarMenu = getAvatarMenuByRole(role);
  const headerMeta = useMemo(() => resolvePageHeader(pathname), [pathname]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handler);
    }

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white px-4 py-3.5 md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* ================= LEFT SECTION: PAGE TITLE ================= */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Buka menu navigasi"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              {headerMeta.title}
            </h1>
            <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
              {headerMeta.subtitle}
            </p>
          </div>
        </div>

        {/* ================= RIGHT SECTION: SEARCH, BELL, PRIMARY CTA ================= */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 transition-colors focus-within:border-blue-500 focus-within:bg-white lg:flex xl:w-72">
            <Search size={15} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Cari lisensi atau pelanggan..."
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            title="Notifikasi"
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/70 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell size={18} className="text-slate-600" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* ================= AVATAR USER AKTIF ================= */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleToggleDropdown}
              className="flex items-center justify-center rounded-full border border-slate-200 shadow-xs transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Menu Profil Pengguna"
            >
              <Avatar
                name={username || "Admin"}
                image={userImage}
                size="sm"
                className="bg-blue-600 text-white"
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl">
                {/* ===== USER HEADER ===== */}
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                  <div className="relative shrink-0">
                    <Avatar
                      name={username || "Admin"}
                      image={userImage}
                      size="md"
                      className="bg-blue-600 text-white"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {username || "User"}
                    </p>
                    <p className="truncate text-[11px] font-medium text-slate-500">
                      {roleConfig[role].label}
                    </p>
                  </div>
                </div>

                {/* ===== DYNAMIC MENU ===== */}
                <div className="py-1.5">
                  {avatarMenu.map((item: AvatarMenuItem) => {
                    if ("action" in item && item.action === "logout") {
                      return null;
                    }

                    if ("path" in item) {
                      const handleNavigateItem = () => {
                        router.push(item.path);
                        setIsOpen(false);
                      };

                      return (
                        <DropdownItem
                          key={item.path}
                          icon={item.icon}
                          label={item.label}
                          onClick={handleNavigateItem}
                        />
                      );
                    }

                    return null;
                  })}
                </div>

                <div className="border-t border-slate-100 p-3">
                  <Button
                    type="button"
                    onClick={handleLogout}
                    loading={loading}
                    variant="filled"
                    color="error"
                    size="sm"
                    leftIcon={LogOut}
                    fullWidth
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
