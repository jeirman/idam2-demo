"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { DemoUser } from "@/lib/auth/constants";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AVATAR_GRADIENTS: Record<string, string> = {
  maya: "from-[#2C6E5B] to-[#164F41]",
  priya: "from-[#B9862E] to-[#8A6420]",
  tomas: "from-[#3E6FA0] to-[#2C4F73]",
};

function ProfileAvatar({ user }: { user: DemoUser }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br font-mono text-[11px] font-semibold text-white",
        AVATAR_GRADIENTS[user.id],
      )}
    >
      {user.initials}
    </div>
  );
}

export function SidebarProfileMenu({ user }: { user: DemoUser }) {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(() => {
      logout();
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={isPending}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-coffer-md border border-white/[0.06] bg-white/[0.03] p-2 text-left transition-colors duration-150 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60 data-popup-open:bg-white/[0.07]"
      >
        <ProfileAvatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#F1F0EC]">
            {user.name}
          </div>
          <div className="truncate text-[11px] text-coffer-sidebar-dim">
            {user.role}
          </div>
        </div>
        <svg
          className="h-[15px] w-[15px] shrink-0 stroke-coffer-sidebar-dim [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6] fill-none"
          viewBox="0 0 24 24"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={8} className="w-56 p-1">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-coffer-text-secondary hover:text-coffer-rust-strong"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </PopoverContent>
    </Popover>
  );
}
