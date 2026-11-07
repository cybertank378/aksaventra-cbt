"use client";

import { type ReactNode, useState } from "react";
import type { UserRole } from "@/libs/enums";
import AppSidebar, {
  type SidebarUserSummary,
} from "@/shared-ui/layout/AppSidebar";
import AppTopbar, { type TopbarMenuItem } from "@/shared-ui/layout/AppTopbar";

interface AppLayoutProps {
  children: ReactNode;
  role?: UserRole;
  user?: SidebarUserSummary | null;
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
        user={user}
        mobileOpen={mobileOpen}
        onClose={handleCloseMobileSidebar}
      />

      {/* RIGHT LAYOUT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* TOPBAR */}
        <AppTopbar
          role={role}
          username={user?.name ?? undefined}
          userEmail={user?.email ?? undefined}
          userImage={user?.image}
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
