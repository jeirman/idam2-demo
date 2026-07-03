"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SidebarProfileMenu } from "@/components/auth/sidebar-profile-menu";
import type { DemoUser } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

type InvoiceStatus = "pending" | "approved" | "released" | "rejected";
type AvatarVariant = "maya" | "priya" | "tomas" | "ash";
type ToastVariant = "approve" | "decline" | "info";

interface Invoice {
  id: string;
  vendor: string;
  amount: string;
  status: InvoiceStatus;
  submitter: { initials: string; name: string; avatar: AvatarVariant };
  date: string;
}

interface ApprovalCard {
  id: string;
  vendor: string;
  amount: string;
  invoiceId: string;
  initials: string;
  avatar: AvatarVariant;
  escalated?: boolean;
}

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving?: boolean;
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", badge: undefined },
  { id: "invoices", label: "Invoices", badge: undefined },
  { id: "approvals", label: "Approvals", badge: "5" },
] as const;

const ACCESS_NAV = [
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles & policies" },
] as const;

const INVOICES: Invoice[] = [
  {
    id: "INV-2049",
    vendor: "Nordwind Logistics",
    amount: "£12,480.00",
    status: "pending",
    submitter: { initials: "PS", name: "Priya Shah", avatar: "priya" },
    date: "Jul 2, 2026",
  },
  {
    id: "INV-2048",
    vendor: "Anchor Cloud Services",
    amount: "£3,215.50",
    status: "approved",
    submitter: { initials: "TW", name: "Tomas Weber", avatar: "tomas" },
    date: "Jul 1, 2026",
  },
  {
    id: "INV-2047",
    vendor: "Bramwell & Co Legal",
    amount: "£8,900.00",
    status: "released",
    submitter: { initials: "MC", name: "Maya Chen", avatar: "maya" },
    date: "Jun 29, 2026",
  },
  {
    id: "INV-2046",
    vendor: "Solstice Office Supplies",
    amount: "£642.10",
    status: "approved",
    submitter: { initials: "PS", name: "Priya Shah", avatar: "priya" },
    date: "Jun 28, 2026",
  },
  {
    id: "INV-2045",
    vendor: "Meridian Freight",
    amount: "£15,760.00",
    status: "rejected",
    submitter: { initials: "TW", name: "Tomas Weber", avatar: "tomas" },
    date: "Jun 27, 2026",
  },
  {
    id: "INV-2044",
    vendor: "Halcyon Marketing Group",
    amount: "£4,300.00",
    status: "pending",
    submitter: { initials: "MC", name: "Maya Chen", avatar: "maya" },
    date: "Jun 26, 2026",
  },
  {
    id: "INV-2043",
    vendor: "Ferro Industrial Parts",
    amount: "£22,150.00",
    status: "released",
    submitter: { initials: "PS", name: "Priya Shah", avatar: "priya" },
    date: "Jun 24, 2026",
  },
];

const INITIAL_APPROVALS: ApprovalCard[] = [
  {
    id: "1",
    vendor: "Nordwind Logistics",
    amount: "£12,480.00",
    invoiceId: "INV-2049",
    initials: "NL",
    avatar: "priya",
    escalated: true,
  },
  {
    id: "2",
    vendor: "Halcyon Marketing Group",
    amount: "£4,300.00",
    invoiceId: "INV-2044",
    initials: "HM",
    avatar: "maya",
  },
  {
    id: "3",
    vendor: "Ashgrove Facilities Ltd",
    amount: "£1,120.00",
    invoiceId: "INV-2050",
    initials: "AF",
    avatar: "tomas",
  },
];

const TABS = [
  { id: "all", label: "All invoices" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "released", label: "Released" },
] as const;

const AVATAR_GRADIENTS: Record<AvatarVariant, string> = {
  maya: "bg-gradient-to-br from-[#2C6E5B] to-[#164F41]",
  priya: "bg-gradient-to-br from-[#B9862E] to-[#8A6420]",
  tomas: "bg-gradient-to-br from-[#3E6FA0] to-[#2C4F73]",
  ash: "bg-gradient-to-br from-[#B24F3D] to-[#8A3B2C]",
};

const STATUS_PILL: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  approved: {
    label: "Approved",
    bg: "bg-coffer-green-soft",
    text: "text-coffer-green-strong",
    dot: "bg-coffer-green",
  },
  pending: {
    label: "Pending",
    bg: "bg-coffer-gold-soft",
    text: "text-coffer-gold-strong",
    dot: "bg-coffer-gold",
  },
  released: {
    label: "Released",
    bg: "bg-coffer-blue-soft",
    text: "text-coffer-blue-strong",
    dot: "bg-coffer-blue",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-coffer-rust-soft",
    text: "text-coffer-rust-strong",
    dot: "bg-coffer-rust",
  },
};

function Icon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={cn(
        "block h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6]",
        className,
      )}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function Avatar({
  initials,
  variant,
  size = "sm",
}: {
  initials: string;
  variant: AvatarVariant;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "h-8 w-8 rounded-[9px] text-[11px]"
      : size === "md"
        ? "h-[26px] w-[26px] rounded-lg text-[10px]"
        : "h-[26px] w-[26px] rounded-lg text-[10px]";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-mono font-semibold text-white",
        sizeClass,
        AVATAR_GRADIENTS[variant],
      )}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  const pill = STATUS_PILL[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium",
        pill.bg,
        pill.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", pill.dot)} />
      {pill.label}
    </span>
  );
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const color =
    variant === "approve"
      ? "text-[#7CC9AE]"
      : variant === "decline"
        ? "text-[#E29684]"
        : "text-[#C9A968]";

  if (variant === "approve") {
    return (
      <Icon className={cn("h-[15px] w-[15px]", color)}>
        <path d="M4 12l5 5L20 6" />
      </Icon>
    );
  }
  if (variant === "decline") {
    return (
      <Icon className={cn("h-[15px] w-[15px]", color)}>
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </Icon>
    );
  }
  return (
    <Icon className={cn("h-[15px] w-[15px]", color)}>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="8" r="0.4" fill="currentColor" stroke="none" />
    </Icon>
  );
}

function getGreeting(firstName: string): string {
  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${greetWord}, ${firstName}`;
}

function getTodayLabel(): string {
  return `${new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })} — all accounts synced`;
}

export function Home({ user }: { user: DemoUser }) {
  const firstName = user.name.split(" ")[0];
  const [activeNav, setActiveNav] = useState("overview");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [leavingApprovals, setLeavingApprovals] = useState<Set<string>>(
    new Set(),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [greeting, setGreeting] = useState(`Good afternoon, ${firstName}`);
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    setGreeting(getGreeting(firstName));
    setTodayLabel(getTodayLabel());
  }, [firstName]);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 220);
    }, 2600);
  }, []);

  const handleStub = useCallback(
    (label: string) => {
      showToast(`${label} isn't wired up in this demo yet.`, "info");
    },
    [showToast],
  );

  const handleNavClick = useCallback(
    (id: string, label: string) => {
      setActiveNav(id);
      if (id !== "overview") {
        showToast(
          `${label} isn't wired up yet — this demo covers Overview only.`,
          "info",
        );
      }
    },
    [showToast],
  );

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return INVOICES.filter((invoice) => {
      const matchesStatus =
        activeTab === "all" || invoice.status === activeTab;
      const text =
        `${invoice.vendor} ${invoice.id} ${invoice.submitter.name}`.toLowerCase();
      const matchesSearch = query === "" || text.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleApproval = useCallback(
    (id: string, vendor: string, action: "approve" | "decline") => {
      setLeavingApprovals((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
        setLeavingApprovals((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 260);
      showToast(
        `${vendor} ${action === "approve" ? "approved" : "declined"}.`,
        action,
      );
    },
    [showToast],
  );

  return (
    <div
      className="min-h-screen bg-coffer-bg font-sans text-coffer-text [background-image:radial-gradient(1100px_600px_at_85%_-10%,rgba(30,111,92,0.05),transparent_60%)]"
    >
      <div className="flex min-h-screen items-start gap-[18px] p-[18px] max-[720px]:flex-col max-[720px]:gap-3 max-[720px]:p-3">
        {/* Sidebar */}
        <aside
          className="relative sticky top-[18px] flex h-[calc(100vh-36px)] w-[268px] shrink-0 flex-col overflow-hidden rounded-coffer-xl bg-coffer-sidebar text-coffer-sidebar-text shadow-coffer-sidebar max-[720px]:static max-[720px]:h-auto max-[720px]:w-full"
        >
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
              <circle
                cx="100"
                cy="100"
                r="46"
                stroke="white"
                strokeWidth="2.4"
              />
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
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id, item.label)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-coffer-sm border-none px-2.5 py-2 text-left text-[13.5px] font-medium transition-[background,color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      activeNav === item.id
                        ? "bg-coffer-sidebar-active-bg text-coffer-sidebar-active-text shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] [&_svg]:text-coffer-green"
                        : "bg-transparent text-coffer-sidebar-text hover:bg-white/[0.055] hover:text-[#EDEDEA] [&_svg]:text-coffer-sidebar-dim hover:[&_svg]:text-[#C9CBC8]",
                    )}
                  >
                    {item.id === "overview" && (
                      <Icon>
                        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
                        <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" />
                        <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" />
                        <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" />
                      </Icon>
                    )}
                    {item.id === "invoices" && (
                      <Icon>
                        <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
                        <path d="M15 3.5V8h4" />
                        <line x1="8" y1="12" x2="15.5" y2="12" />
                        <line x1="8" y1="15.5" x2="13.5" y2="15.5" />
                      </Icon>
                    )}
                    {item.id === "approvals" && (
                      <Icon>
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M8.5 12.2l2.3 2.3 4.7-5" />
                      </Icon>
                    )}
                    {item.label}
                    {item.badge && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-1.5 py-px font-mono text-[10.5px] font-medium",
                          activeNav === item.id
                            ? "bg-coffer-green-soft text-coffer-green-strong"
                            : "bg-white/[0.09] text-coffer-sidebar-text",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
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
                      onClick={() => handleNavClick(item.id, item.label)}
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
                          <path d="M3.8 19c0-3 2.3-5.2 5.2-5.2s5.2 2.2 5.2 5.2" />
                          <circle cx="17" cy="8.8" r="2.4" />
                          <path d="M15.8 13.5c2.3.3 4 2.2 4 4.7" />
                        </Icon>
                      ) : (
                        <Icon>
                          <path d="M12 3.5l7 2.6v5.4c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6.1l7-2.6z" />
                          <path d="M9 12l2.1 2.1L15.2 10" />
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
                  onClick={() => handleNavClick("settings", "Settings")}
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

        {/* Main content */}
        <main className="flex min-w-0 flex-1 flex-col gap-[22px] px-1 pt-1.5 pb-[30px]">
          {/* Topbar */}
          <div className="flex flex-wrap items-end justify-between gap-5 max-[720px]:items-start">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-[0.8px] text-coffer-text-tertiary uppercase">
                Overview
              </p>
              <h1 className="font-heading mb-1.5 text-[30px] font-medium tracking-[-0.2px] text-coffer-text max-[720px]:text-2xl">
                {greeting}
              </h1>
              <div className="flex items-center gap-[7px] text-[13px] text-coffer-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-coffer-green shadow-[0_0_0_3px_var(--color-coffer-green-soft)]" />
                <span>{todayLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Search"
                onClick={() => handleStub("Search")}
                className="relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-coffer-sm border border-coffer-border bg-coffer-surface text-coffer-text-secondary transition-[border-color,color,background] duration-150 hover:border-[#D6D1C4] hover:bg-coffer-surface-alt hover:text-coffer-text"
              >
                <Icon>
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.2" y2="16.2" />
                </Icon>
              </button>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => handleStub("Notifications")}
                className="relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-coffer-sm border border-coffer-border bg-coffer-surface text-coffer-text-secondary transition-[border-color,color,background] duration-150 hover:border-[#D6D1C4] hover:bg-coffer-surface-alt hover:text-coffer-text"
              >
                <Icon>
                  <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.4 5.2 1.4 5.2H4.6S6 14.5 6 10.5z" />
                  <path d="M9.7 18.5a2.3 2.3 0 0 0 4.6 0" />
                </Icon>
                <span className="absolute top-2 right-[9px] h-1.5 w-1.5 rounded-full bg-coffer-rust shadow-[0_0_0_2px_var(--color-coffer-surface)]" />
              </button>
              <button
                type="button"
                onClick={() => handleStub("New invoice")}
                className="flex h-[38px] cursor-pointer items-center gap-[7px] rounded-coffer-sm border-none bg-gradient-to-b from-[#21745F] to-[#175344] px-4 text-[13.5px] font-semibold text-[#F2FAF6] shadow-[0_6px_16px_-8px_rgba(23,83,68,0.7)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_10px_20px_-8px_rgba(23,83,68,0.75)]"
              >
                <svg
                  className="h-[15px] w-[15px] stroke-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New invoice
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3.5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-2">
            <KpiCard
              variant="balance"
              label="Total balance"
              value="£284,650.12"
              foot="Across 4 connected accounts"
              delta={{ direction: "up", value: "4.2%" }}
              icon={
                <>
                  <path d="M3.5 8.5h17v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-10z" />
                  <path d="M3.5 8.5l2.3-4h12.4l2.3 4" />
                  <circle cx="16.5" cy="13.5" r="1.3" />
                </>
              }
            />
            <KpiCard
              variant="pending"
              label="Pending approvals"
              value="£48,230.00"
              foot="12 invoices need review"
              icon={
                <>
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5V12l3 2" />
                </>
              }
            />
            <KpiCard
              variant="overdue"
              label="Overdue"
              value="£9,412.00"
              foot="3 invoices past due date"
              icon={
                <>
                  <path d="M12 4l9.5 16h-19L12 4z" />
                  <line x1="12" y1="10.5" x2="12" y2="14.5" />
                  <circle
                    cx="12"
                    cy="17.2"
                    r="0.4"
                    fill="currentColor"
                    stroke="none"
                  />
                </>
              }
            />
            <KpiCard
              variant="released"
              label="Released this month"
              value="£156,204.00"
              foot="27 payments completed"
              delta={{ direction: "up", value: "18%" }}
              icon={
                <>
                  <path d="M4 12h13" />
                  <path d="M12 5.5L18.5 12 12 18.5" />
                </>
              }
            />
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-[minmax(0,1.68fr)_minmax(0,1fr)] items-start gap-4 max-[1180px]:grid-cols-1">
            {/* Invoices panel */}
            <section className="rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface shadow-coffer-card">
              <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4">
                <div>
                  <h2 className="m-0 text-[14.5px] font-semibold text-coffer-text">
                    Recent invoices
                  </h2>
                  <p className="mt-0.5 text-xs text-coffer-text-tertiary">
                    Everything moving through entry, approval and release
                  </p>
                </div>
              </div>

              <div className="flex gap-1 border-b border-coffer-border-soft px-[18px] pt-3.5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative mr-3.5 cursor-pointer border-none bg-transparent px-1 pb-[11px] text-[13px] font-medium transition-colors duration-150",
                      activeTab === tab.id
                        ? "text-coffer-text after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-0.5 after:rounded-t-sm after:bg-coffer-green after:content-['']"
                        : "text-coffer-text-tertiary hover:text-coffer-text",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 px-[18px] py-3">
                <div className="flex min-w-[160px] flex-1 items-center gap-[7px] rounded-coffer-sm border border-coffer-border bg-coffer-surface-alt px-2.5 py-[7px]">
                  <Icon className="h-3.5 w-3.5 text-coffer-text-tertiary">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="20" y1="20" x2="16.2" y2="16.2" />
                  </Icon>
                  <input
                    type="text"
                    placeholder="Search vendor or invoice ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none bg-transparent text-[12.5px] text-coffer-text outline-none placeholder:text-coffer-text-tertiary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleStub("Vendor filter")}
                  className="flex cursor-pointer items-center gap-[5px] rounded-full border border-coffer-border bg-coffer-surface px-[11px] py-1.5 text-xs whitespace-nowrap text-coffer-text-secondary hover:border-[#D6D1C4]"
                >
                  Vendor
                  <Icon className="h-3 w-3">
                    <path d="M6 9l6 6 6-6" />
                  </Icon>
                </button>
                <button
                  type="button"
                  onClick={() => handleStub("Date filter")}
                  className="flex cursor-pointer items-center gap-[5px] rounded-full border border-coffer-border bg-coffer-surface px-[11px] py-1.5 text-xs whitespace-nowrap text-coffer-text-secondary hover:border-[#D6D1C4]"
                >
                  Jun 24 → Jul 3
                  <Icon className="h-3 w-3">
                    <path d="M6 9l6 6 6-6" />
                  </Icon>
                </button>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                      Invoice
                    </th>
                    <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-right text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                      Amount
                    </th>
                    <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                      Status
                    </th>
                    <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                      Submitted by
                    </th>
                    <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-coffer-border-soft transition-colors duration-150 last:border-b-0 hover:bg-coffer-surface-alt"
                    >
                      <td className="px-[18px] py-[13px] align-middle text-[13px]">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <span className="block font-medium">
                              {invoice.vendor}
                            </span>
                            <span className="block font-mono text-[11px] text-coffer-text-tertiary">
                              {invoice.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-[18px] py-[13px] text-right align-middle font-mono text-[13px] font-medium">
                        {invoice.amount}
                      </td>
                      <td className="px-[18px] py-[13px] align-middle text-[13px]">
                        <StatusPill status={invoice.status} />
                      </td>
                      <td className="px-[18px] py-[13px] align-middle text-[13px] text-coffer-text-secondary">
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={invoice.submitter.initials}
                            variant={invoice.submitter.avatar}
                          />
                          {invoice.submitter.name}
                        </div>
                      </td>
                      <td className="px-[18px] py-[13px] align-middle text-[13px]">
                        {invoice.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between px-[18px] pt-3 pb-4 text-xs text-coffer-text-tertiary">
                <span>
                  Showing {filteredInvoices.length} of 84 invoices
                </span>
                <button
                  type="button"
                  onClick={() => handleStub("Invoices page")}
                  className="cursor-pointer border-none bg-transparent font-medium text-coffer-green-strong hover:underline"
                >
                  View all invoices →
                </button>
              </div>
            </section>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <section className="rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface shadow-coffer-card">
                <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4">
                  <div>
                    <h2 className="m-0 text-[14.5px] font-semibold text-coffer-text">
                      Awaiting your approval
                    </h2>
                    <p className="mt-0.5 text-xs text-coffer-text-tertiary">
                      {approvals.length} invoices need a decision
                    </p>
                  </div>
                </div>
                <div className="px-2.5 pt-1.5 pb-3">
                  {approvals.map((card) => (
                    <div
                      key={card.id}
                      className={cn(
                        "flex items-start gap-2.5 border-b border-coffer-border-soft px-2 py-3 transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] last:border-b-0",
                        leavingApprovals.has(card.id) &&
                          "translate-x-2 opacity-0",
                      )}
                    >
                      <Avatar
                        initials={card.initials}
                        variant={card.avatar}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-coffer-text">
                          {card.vendor}
                        </div>
                        <div className="mt-0.5 font-mono text-[12.5px] text-coffer-text-secondary">
                          {card.amount} · {card.invoiceId}
                        </div>
                        {card.escalated ? (
                          <div className="mt-2 flex items-center gap-1.5 rounded-coffer-sm border border-coffer-border-soft bg-coffer-surface-alt px-2 py-[5px] text-[11.5px] text-coffer-text-tertiary">
                            <Icon className="h-3 w-3 shrink-0 text-coffer-gold-strong">
                              <rect
                                x="5"
                                y="10.5"
                                width="14"
                                height="9"
                                rx="1.8"
                              />
                              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                            </Icon>
                            Exceeds your £10,000 limit — escalated
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-1.5">
                            <button
                              type="button"
                              aria-label="Approve"
                              onClick={() =>
                                handleApproval(card.id, card.vendor, "approve")
                              }
                              className="flex h-[27px] w-[27px] cursor-pointer items-center justify-center rounded-lg border border-coffer-border bg-coffer-surface text-coffer-text-secondary transition-all duration-150 hover:border-coffer-green hover:bg-coffer-green-soft hover:text-coffer-green-strong [&_svg]:h-[13px] [&_svg]:w-[13px]"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M4 12l5 5L20 6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              aria-label="Decline"
                              onClick={() =>
                                handleApproval(card.id, card.vendor, "decline")
                              }
                              className="flex h-[27px] w-[27px] cursor-pointer items-center justify-center rounded-lg border border-coffer-border bg-coffer-surface text-coffer-text-secondary transition-all duration-150 hover:border-coffer-rust hover:bg-coffer-rust-soft hover:text-coffer-rust-strong [&_svg]:h-[13px] [&_svg]:w-[13px]"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="6" y1="6" x2="18" y2="18" />
                                <line x1="18" y1="6" x2="6" y2="18" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border-t border-coffer-border-soft px-[18px] pt-2.5 pb-4">
                  <button
                    type="button"
                    onClick={() => handleStub("Approvals page")}
                    className="inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent text-[12.5px] font-medium text-coffer-green-strong hover:underline [&_svg]:h-[13px] [&_svg]:w-[13px]"
                  >
                    Go to approval queue
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </section>

              <section className="rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface shadow-coffer-card">
                <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4">
                  <h2 className="m-0 text-[14.5px] font-semibold text-coffer-text">
                    Your access
                  </h2>
                </div>
                <div className="mx-[18px] mt-3.5 mb-3 flex items-center gap-[9px] rounded-coffer-md border border-coffer-border-soft bg-coffer-surface-alt px-3 py-2.5">
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-coffer-sm bg-coffer-green-soft text-coffer-green-strong">
                    <Icon className="h-[15px] w-[15px]">
                      <path d="M12 3.5l7 2.6v5.4c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6.1l7-2.6z" />
                    </Icon>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">
                      Finance Approver
                    </div>
                    <div className="text-[11.5px] text-coffer-text-tertiary">
                      Team: Finance Ops
                    </div>
                  </div>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2.5 px-[18px] pb-1.5">
                  {[
                    "Approve invoices up to £10,000",
                    "View payments across Finance Ops",
                    "Manage users within your own team",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[12.5px] leading-snug text-coffer-text-secondary"
                    >
                      <Icon className="mt-px h-3.5 w-3.5 shrink-0 text-coffer-green">
                        <path d="M4 12l5 5L20 6" />
                      </Icon>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 border-t border-coffer-border-soft px-[18px] pt-2.5 pb-4">
                  <button
                    type="button"
                    onClick={() => handleStub("Roles & policies page")}
                    className="inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent text-[12.5px] font-medium text-coffer-green-strong hover:underline [&_svg]:h-[13px] [&_svg]:w-[13px]"
                  >
                    View full permissions
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Toast stack */}
      <div className="fixed right-[22px] bottom-[22px] z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-[9px] rounded-coffer-md bg-[#1B1D1F] px-[15px] py-[11px] text-[13px] text-[#F2F1EC] shadow-coffer-pop",
              toast.leaving ? "animate-toast-out" : "animate-toast-in",
            )}
          >
            <ToastIcon variant={toast.variant} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  variant,
  label,
  value,
  foot,
  delta,
  icon,
}: {
  variant: "balance" | "pending" | "overdue" | "released";
  label: string;
  value: string;
  foot: string;
  delta?: { direction: "up" | "down"; value: string };
  icon: React.ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface p-4 pb-[15px] shadow-coffer-card"
      style={{
        backgroundImage: `linear-gradient(135deg, ${
          variant === "balance"
            ? "rgba(30,111,92,0.09)"
            : variant === "pending"
              ? "rgba(185,134,46,0.10)"
              : variant === "overdue"
                ? "rgba(178,79,61,0.09)"
                : "rgba(62,111,160,0.09)"
        }, transparent 55%)`,
      }}
    >
      <div className="relative mb-3 flex items-center justify-between">
        <div
          className={cn(
            "flex h-[30px] w-[30px] items-center justify-center rounded-coffer-sm [&_svg]:h-4 [&_svg]:w-4",
            variant === "balance" && "bg-coffer-green-soft text-coffer-green-strong",
            variant === "pending" && "bg-coffer-gold-soft text-coffer-gold-strong",
            variant === "overdue" && "bg-coffer-rust-soft text-coffer-rust-strong",
            variant === "released" && "bg-coffer-blue-soft text-coffer-blue-strong",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon}
          </svg>
        </div>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-[3px] font-mono text-[11px] font-semibold [&_svg]:h-[11px] [&_svg]:w-[11px]",
              delta.direction === "up"
                ? "text-coffer-green-strong"
                : "text-coffer-rust-strong",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {delta.direction === "up" ? (
                <path d="M6 15l6-6 6 6" />
              ) : (
                <path d="M6 9l6 6 6-6" />
              )}
            </svg>
            {delta.value}
          </span>
        )}
      </div>
      <p className="relative m-0 mb-1 text-xs text-coffer-text-secondary">
        {label}
      </p>
      <div className="relative font-mono text-[21px] font-semibold tracking-[-0.3px] text-coffer-text">
        {value}
      </div>
      <p className="relative mt-[3px] text-[11.5px] text-coffer-text-tertiary">
        {foot}
      </p>
    </div>
  );
}
