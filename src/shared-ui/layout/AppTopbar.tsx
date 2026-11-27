"use client";

import {
  ChevronDown,
  LogOut,
  type LucideIcon,
  Menu,
  RefreshCw,
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
import { useSyncApi } from "@/modules/sync/presentation/useSyncApi";
import Avatar from "@/shared-ui/component/Avatar";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import { DropdownItem } from "@/shared-ui/component/DropdownItem";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/shared-ui/component/Toast";

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
  if (pathname.includes("/proctor")) {
    return {
      title: "Pusat Kendali Pengawas",
      subtitle:
        "Monitoring peserta, pelanggaran, dan intervensi ujian realtime",
    };
  }
  if (pathname.includes("/exams/new")) {
    return {
      title: "Buat Naskah Ujian Baru",
      subtitle: "Konfigurasi parameter asesmen, bobot, dan jadwal pelaksanaan",
    };
  }
  if (pathname.includes("/questions")) {
    return {
      title: "Bank Soal & Butir Ujian",
      subtitle: "Penyusunan naskah soal, opsi jawaban, dan kunci penilaian",
    };
  }
  if (pathname.includes("/exams")) {
    return {
      title: "Manajemen Naskah Ujian CBT",
      subtitle:
        "Daftar jadwal asesmen, distribusi naskah soal, dan pemantauan pengawas",
    };
  }
  if (pathname.includes("/classes")) {
    return {
      title: "Manajemen Rombongan Belajar (Kelas)",
      subtitle:
        "Pengelompokan siswa ke dalam rombel untuk distribusi ujian massal",
    };
  }
  if (pathname.includes("/subjects")) {
    return {
      title: "Manajemen Mata Pelajaran",
      subtitle:
        "Pengelolaan daftar mata pelajaran, kelompok tingkat kelas, dan sinkronisasi Moodle",
    };
  }
  if (pathname.includes("/staff")) {
    return {
      title: "Manajemen Pengawas & Guru",
      subtitle:
        "Kelola akun proktor ruang ujian (1 proktor = 1 ruang) dan guru (Teacher & Course Creator)",
    };
  }
  if (pathname.includes("/students")) {
    return {
      title: "Daftar Peserta Didik (Siswa)",
      subtitle: "Pengelolaan akun login dan pemetaan rombel belajar siswa",
    };
  }
  if (pathname.includes("/rooms")) {
    return {
      title: "Kelola Ruang & Tata Letak Meja Ujian",
      subtitle:
        "Pengaturan ruang ujian, pembuatan nomor meja otomatis, denah 2D, dan cetak PDF meja",
    };
  }
  if (pathname.includes("/exam-cards")) {
    return {
      title: "Cetak Kartu Ujian Siswa",
      subtitle: "Pratinjau & Pencetakan Kartu Tanda Peserta Ujian Siswa",
    };
  }
  if (pathname.includes("/announcements")) {
    return {
      title: "Pengumuman & Arahan CBT",
      subtitle: "Siaran Informasi Tata Tertib & Instruksi Pelaksanaan Ujian",
    };
  }
  if (pathname.includes("/results")) {
    return {
      title: "Hasil & Rekapitulasi Nilai",
      subtitle:
        "Analisis perolehan skor, log durasi pengerjaan, dan catatan pelanggaran",
    };
  }
  if (pathname.startsWith("/attempts")) {
    return {
      title: "Riwayat & Sesi Ujian",
      subtitle: "Status pengerjaan, log pelanggaran, dan finalisasi attempt",
    };
  }
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard")) {
    return {
      title: "Dashboard Utama",
      subtitle: "Ringkasan metrik performa CBT dan status aktivitas peserta",
    };
  }
  return {
    title: "Aksaventra CBT",
    subtitle: "Sistem Ujian Berbasis Komputer",
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
  const { syncAll, isLoading: isSyncing } = useSyncApi();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canSyncMoodle = role === "ADMIN" || role === "TEACHER";

  const handleFullSync = async () => {
    try {
      const res = await syncAll();
      if (res.success) {
        const { courses, classes, students, exams, questions } = res.counts;
        showSuccessToast(
          `Sinkronisasi selesai: ${courses} course/mapel, ${classes} kelas, ${students} siswa, ${exams} ujian, ${questions} soal.`,
        );
      } else {
        showWarningToast(
          `Sinkronisasi selesai dengan peringatan: ${res.errors.join("; ")}`,
        );
      }
      window.dispatchEvent(
        new CustomEvent("aksaventra:synced", { detail: res }),
      );
      router.refresh();
    } catch (err) {
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Gagal melakukan sinkronisasi dengan Moodle",
      );
    }
  };

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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
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
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka navigasi sidebar"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7] md:hidden"
          >
            <Menu size={20} />
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

      <div className="flex items-center gap-3">
        {onSearch && (
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
        )}

        {quickActionSlot && (
          <div className="hidden items-center sm:flex">{quickActionSlot}</div>
        )}

        {canSyncMoodle && (
          <Button
            type="button"
            variant="outline"
            color="teal"
            size="sm"
            onClick={handleFullSync}
            disabled={isSyncing}
            title="Sinkronkan seluruh data (Course/Mapel, Kelas, Siswa, Soal, Ujian) dengan Moodle"
            aria-label="Sinkronkan seluruh data dengan Moodle"
            className="h-9 gap-1.5 rounded-xl px-2.5 text-xs font-semibold sm:px-3"
          >
            <RefreshCw
              size={14}
              className={isSyncing ? "animate-spin shrink-0" : "shrink-0"}
            />
            <span className="hidden sm:inline">
              {isSyncing ? "Menyinkronkan..." : "Sinkron Moodle"}
            </span>
          </Button>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Menu pengguna"
            aria-expanded={isOpen}
            aria-haspopup="menu"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1 pr-2.5 transition-all hover:bg-slate-100 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7]"
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
