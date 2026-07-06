import { cookies } from "next/headers";
import {
  PROFILE_TOKEN_COOKIE,
  SESSION_COOKIE,
  type DemoUser,
} from "@/lib/auth/constants";
import { getDemoUser, getTestProfile } from "@/lib/auth/profiles";
import { mintTestJwt } from "@/lib/auth/token";

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
  const profile = getTestProfile(userId);
  if (!profile) {
    throw new Error("Invalid user");
  }

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };

  cookieStore.set(SESSION_COOKIE, userId, cookieOptions);
  cookieStore.set(PROFILE_TOKEN_COOKIE, mintTestJwt(profile), cookieOptions);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: "/" });
  cookieStore.delete({ name: PROFILE_TOKEN_COOKIE, path: "/" });
}
