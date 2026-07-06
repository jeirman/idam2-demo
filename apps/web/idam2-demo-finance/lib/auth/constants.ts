export const SESSION_COOKIE = "coffer-session";
export const PROFILE_TOKEN_COOKIE = "coffer-token";

export type DemoUser = {
  id: string;
  name: string;
  role: string;
  department: string;
  job_title: string;
  country: string;
  initials: string;
};

export const DEMO_USER_IDS = ["maya", "priya", "tomas"] as const;

export type DemoUserId = (typeof DEMO_USER_IDS)[number];

export function isValidSessionUserId(
  userId: string | undefined,
): userId is DemoUserId {
  return Boolean(userId && DEMO_USER_IDS.includes(userId as DemoUserId));
}
