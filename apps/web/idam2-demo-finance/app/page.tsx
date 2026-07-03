import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";

export default async function IndexPage() {
  const userId = await getSessionUserId();

  if (userId) {
    redirect("/home");
  }

  redirect("/login");
}
