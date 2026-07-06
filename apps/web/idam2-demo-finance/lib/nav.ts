export const NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/home", badge: undefined },
  { id: "invoices", label: "Invoices", href: "/invoices", badge: undefined },
  { id: "approvals", label: "Approvals", href: undefined, badge: "5" },
  { id: "vendors", label: "Vendors", href: "/vendors", badge: undefined },
] as const;

export const ACCESS_NAV = [
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles & policies" },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]["id"];
