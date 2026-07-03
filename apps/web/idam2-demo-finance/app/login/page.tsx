import { redirect } from "next/navigation";
import { LoginUserList } from "@/components/auth/login-user-list";
import { getSessionUserId } from "@/lib/auth/session";

export default async function LoginPage() {
  const userId = await getSessionUserId();

  if (userId) {
    redirect("/home");
  }

  return <LoginUserList />;
}
