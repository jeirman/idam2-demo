"use client";

import { AppSidebar } from "@/components/app-sidebar";
import type { DemoUser } from "@/lib/auth/constants";

export function AppShell({
  user,
  activeNav,
  onStubNav,
  children,
}: {
  user: DemoUser;
  activeNav: string;
  onStubNav?: (label: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-coffer-bg font-sans text-coffer-text [background-image:radial-gradient(1100px_600px_at_85%_-10%,rgba(30,111,92,0.05),transparent_60%)]">
      <div className="flex min-h-screen items-start gap-[18px] p-[18px] max-[720px]:flex-col max-[720px]:gap-3 max-[720px]:p-3">
        <AppSidebar
          user={user}
          activeNav={activeNav}
          onStubNav={onStubNav}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-[22px] px-1 pt-1.5 pb-[30px]">
          {children}
        </main>
      </div>
    </div>
  );
}
