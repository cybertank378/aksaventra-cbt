"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import type { UserRole } from "@/libs/enums";
import type { AuthJwtPayload } from "@/proxy";
import AppSidebar, {
  type SidebarUserSummary,
} from "@/shared-ui/layout/AppSidebar";
import AppTopbar, { type TopbarMenuItem } from "@/shared-ui/layout/AppTopbar";

interface AppLayoutProps {
  children: ReactNode;
  role?: UserRole;
  user?: SidebarUserSummary | AuthJwtPayload | null;
  onLogout?: () => void | Promise<void>;
  isLoggingOut?: boolean;
  topbarMenuItems?: TopbarMenuItem[];
  title?: string;
  subtitle?: string;
}

export default function AppLayout({
  children,
  role = "ADMIN",
  user,
  onLogout,
  isLoggingOut = false,
  topbarMenuItems,
  title,
  subtitle,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Student pages (lobby & exam workspace) use their own standalone ExamFocusLayout shell
  if (pathname === "/student" || pathname?.startsWith("/student/")) {
    return <>{children}</>;
  }

  // Normalise user display info without `any`
  const normalizedUser: SidebarUserSummary | null = user
    ? "userId" in user
      ? {
          id: String(user.userId),
          name: user.username,
          username: user.username,
          email: null,
          role: user.role ?? role,
          image: null,
        }
      : {
          id: user.id ? String(user.id) : undefined,
          name: user.name ?? user.username ?? "Pengguna",
          username: user.username ?? "pengguna",
          email: user.email ?? null,
          role: user.role ?? role,
          image: user.image ?? null,
        }
    : null;

  const handleOpenMobileSidebar = () => {
    setMobileOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR */}
      <AppSidebar
        role={role}
        user={normalizedUser}
        mobileOpen={mobileOpen}
        onClose={handleCloseMobileSidebar}
      />

      {/* RIGHT LAYOUT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* TOPBAR */}
        <AppTopbar
          role={role}
          username={normalizedUser?.name ?? undefined}
          userEmail={normalizedUser?.email ?? undefined}
          userImage={normalizedUser?.image}
          onMenuClick={handleOpenMobileSidebar}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          menuItems={topbarMenuItems}
          title={title}
          subtitle={subtitle}
        />

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
