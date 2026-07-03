import { redirect } from "next/navigation";
import { Home } from "@/components/home";
import { getSessionUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <Home user={user} />;
}
