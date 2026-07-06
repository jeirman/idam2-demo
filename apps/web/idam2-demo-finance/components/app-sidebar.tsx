"use client";

import Link from "next/link";
import { SidebarProfileMenu } from "@/components/auth/sidebar-profile-menu";
import { Icon } from "@/components/icon";
import type { DemoUser } from "@/lib/auth/constants";
import { ACCESS_NAV, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

function NavIcon({ id }: { id: string }) {
  if (id === "overview") {
    return (
      <Icon>
        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
        <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" />
        <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" />
        <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" />
      </Icon>
    );
  }

  if (id === "invoices") {
    return (
      <Icon>
        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
        <path d="M15 3.5V8h4" />
        <line x1="8" y1="12" x2="15.5" y2="12" />
        <line x1="8" y1="15.5" x2="13.5" y2="15.5" />
      </Icon>
    );
  }

  if (id === "approvals") {
    return (
      <Icon>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.5 12.2l2.3 2.3 4.7-5" />
      </Icon>
    );
  }

  if (id === "vendors") {
    return (
      <Icon>
        <path d="M4.5 7.5h15v11a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-11z" />
        <path d="M8 7.5V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7.5" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="15" x2="13" y2="15" />
      </Icon>
    );
  }

  return null;
}

export function AppSidebar({
  user,
  activeNav,
  onStubNav,
}: {
  user: DemoUser;
  activeNav: string;
  onStubNav?: (label: string) => void;
}) {
  const handleStubClick = (label: string) => {
    onStubNav?.(label);
  };

  return (
    <aside className="relative sticky top-[18px] flex h-[calc(100vh-36px)] w-[268px] shrink-0 flex-col overflow-hidden rounded-coffer-xl bg-coffer-sidebar text-coffer-sidebar-text shadow-coffer-sidebar max-[720px]:static max-[720px]:h-auto max-[720px]:w-full">
      <div className="pointer-events-none absolute -bottom-[30px] -right-[34px] z-0 h-[250px] w-[250px] opacity-[0.055]">
        <svg className="h-full w-full" viewBox="0 0 200 200" fill="none">
          <rect
            x="14"
            y="14"
            width="172"
            height="172"
            rx="26"
            stroke="white"
            strokeWidth="2.4"
          />
          <circle cx="100" cy="100" r="46" stroke="white" strokeWidth="2.4" />
          <circle cx="100" cy="100" r="6" fill="white" />
          <line x1="100" y1="54" x2="100" y2="66" stroke="white" strokeWidth="2.4" />
          <line x1="100" y1="134" x2="100" y2="146" stroke="white" strokeWidth="2.4" />
          <line x1="54" y1="100" x2="66" y2="100" stroke="white" strokeWidth="2.4" />
          <line x1="134" y1="100" x2="146" y2="100" stroke="white" strokeWidth="2.4" />
          <line x1="68" y1="68" x2="76" y2="76" stroke="white" strokeWidth="2.4" />
          <line x1="124" y1="124" x2="132" y2="132" stroke="white" strokeWidth="2.4" />
          <line x1="132" y1="68" x2="124" y2="76" stroke="white" strokeWidth="2.4" />
          <line x1="76" y1="124" x2="68" y2="132" stroke="white" strokeWidth="2.4" />
          <path
            d="M186 84 v32 a6 6 0 0 1 -6 6 h-8 v-44 h8 a6 6 0 0 1 6 6 z"
            stroke="white"
            strokeWidth="2.4"
          />
        </svg>
      </div>

      <div className="relative z-[1] flex h-full flex-col px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5 px-1 pt-0.5 pb-[18px]">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-coffer-sm bg-gradient-to-br from-[#2C6E5B] to-[#163F34] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <svg
              className="h-4 w-4 stroke-[#EAF3EF]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <line
                x1="12"
                y1="6.4"
                x2="12"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-heading text-[18px] font-medium tracking-[0.2px] text-[#F3F2EE]">
              Coffer
            </div>
            <div className="mt-px text-[10.5px] tracking-[0.4px] text-coffer-sidebar-dim">
              Finance workspace
            </div>
          </div>
        </div>

        <div className="mb-[18px] flex items-center gap-2 rounded-coffer-md border border-white/[0.07] bg-white/5 px-2.5 py-[9px]">
          <Icon className="h-[15px] w-[15px] text-coffer-sidebar-dim">
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.2" y2="16.2" />
          </Icon>
          <input
            type="text"
            placeholder="Search..."
            className="w-full border-none bg-transparent text-[13px] text-coffer-sidebar-text outline-none placeholder:text-coffer-sidebar-dim"
          />
          <span className="shrink-0 rounded-[5px] bg-white/[0.06] px-[5px] py-0.5 font-mono text-[10px] text-coffer-sidebar-dim">
            ⌘K
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-[18px] overflow-y-auto pb-2 max-[720px]:max-h-[260px]">
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              const className = cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-coffer-sm border-none px-2.5 py-2 text-left text-[13.5px] font-medium transition-[background,color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isActive
                  ? "bg-coffer-sidebar-active-bg text-coffer-sidebar-active-text shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] [&_svg]:text-coffer-green"
                  : "bg-transparent text-coffer-sidebar-text hover:bg-white/[0.055] hover:text-[#EDEDEA] [&_svg]:text-coffer-sidebar-dim hover:[&_svg]:text-[#C9CBC8]",
              );

              const content = (
                <>
                  <NavIcon id={item.id} />
                  {item.label}
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-1.5 py-px font-mono text-[10.5px] font-medium",
                        isActive
                          ? "bg-coffer-green-soft text-coffer-green-strong"
                          : "bg-white/[0.09] text-coffer-sidebar-text",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleStubClick(item.label)}
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-[18px]">
            <div className="px-2.5 pb-[7px] text-[10.5px] font-semibold tracking-[0.7px] text-coffer-sidebar-dim uppercase">
              Access
            </div>
            <div className="ml-2.5 flex flex-col gap-0.5 border-l border-coffer-sidebar-border pl-[11px]">
              {ACCESS_NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleStubClick(item.label)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-coffer-sm border-none px-2.5 py-2 text-left text-[13.5px] font-medium transition-[background,color] duration-150",
                    activeNav === item.id
                      ? "bg-coffer-sidebar-active-bg text-coffer-sidebar-active-text"
                      : "bg-transparent text-coffer-sidebar-text hover:bg-white/[0.055] hover:text-[#EDEDEA] [&_svg]:text-coffer-sidebar-dim",
                  )}
                >
                  {item.id === "users" ? (
                    <Icon>
                      <circle cx="9" cy="8" r="3.2" />
                      <path d="M3.5 19.5c.8-3.6 3.2-5.5 5.5-5.5s4.7 1.9 5.5 5.5" />
                      <circle cx="17.5" cy="9" r="2.4" />
                      <path d="M15 17.5c.5-2 1.8-3.2 3.2-3.2" />
                    </Icon>
                  ) : (
                    <Icon>
                      <path d="M7 5.5h10v13H7z" />
                      <path d="M10 9h4M10 12h4M10 15h2.5" />
                    </Icon>
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleStubClick("Settings")}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-coffer-sm border-none px-2.5 py-2 text-left text-[13.5px] font-medium transition-[background,color] duration-150",
                activeNav === "settings"
                  ? "bg-coffer-sidebar-active-bg text-coffer-sidebar-active-text"
                  : "bg-transparent text-coffer-sidebar-text hover:bg-white/[0.055] hover:text-[#EDEDEA] [&_svg]:text-coffer-sidebar-dim",
              )}
            >
              <Icon>
                <circle cx="12" cy="12" r="2.6" />
                <path d="M12 4.3v2.1M12 17.6v2.1M19.7 12h-2.1M6.4 12H4.3M17.4 6.6l-1.5 1.5M8.1 15.9l-1.5 1.5M17.4 17.4l-1.5-1.5M8.1 8.1L6.6 6.6" />
              </Icon>
              Settings
            </button>
          </div>
        </nav>

        <div className="mt-1 border-t border-coffer-sidebar-border pt-3.5">
          <SidebarProfileMenu user={user} />
        </div>
      </div>
    </aside>
  );
}
