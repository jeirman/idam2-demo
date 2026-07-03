export const SESSION_COOKIE = "coffer-session";

export type DemoUser = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: "maya",
    name: "Maya Chen",
    role: "Finance Approver",
    initials: "MC",
  },
  {
    id: "priya",
    name: "Priya Shah",
    role: "Accounts Payable Clerk",
    initials: "PS",
  },
  {
    id: "tomas",
    name: "Tomas Weber",
    role: "Finance Analyst",
    initials: "TW",
  },
];

export function getDemoUser(userId: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === userId);
}

export function isValidSessionUserId(userId: string | undefined): boolean {
  return Boolean(userId && getDemoUser(userId));
}
