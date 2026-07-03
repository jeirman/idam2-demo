import { cookies } from "next/headers";
import {
  getDemoUser,
  SESSION_COOKIE,
  type DemoUser,
} from "@/lib/auth/constants";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId || !getDemoUser(userId)) {
    return null;
  }
  return userId;
}

export async function getSessionUser(): Promise<DemoUser | null> {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }
  return getDemoUser(userId) ?? null;
}

export async function createSession(userId: string): Promise<void> {
  const user = getDemoUser(userId);
  if (!user) {
    throw new Error("Invalid user");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
