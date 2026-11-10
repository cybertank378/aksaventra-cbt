import { type ReactNode, Suspense } from "react";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import AppLayout from "@/shared-ui/layout/AppLayout";

async function ProtectedLayoutContent({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AppLayout role={user?.role ?? "ADMIN"} user={user}>
      {children}
    </AppLayout>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </Suspense>
  );
}
