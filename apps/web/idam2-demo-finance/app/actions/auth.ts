"use server";

import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/auth/session";

export async function loginAsUser(userId: string) {
  await createSession(userId);
  redirect("/home");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
