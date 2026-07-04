"use client";

import { useFormStatus } from "react-dom";
import { loginAsUser } from "@/app/actions/auth";
import { DEMO_USERS, type DemoUser } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

const AVATAR_GRADIENTS: Record<string, string> = {
  maya: "from-[#2C6E5B] to-[#164F41]",
  priya: "from-[#B9862E] to-[#8A6420]",
  tomas: "from-[#3E6FA0] to-[#2C4F73]",
};

function UserLoginButton({ user }: { user: DemoUser }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-coffer-md border border-coffer-border bg-coffer-surface-alt px-4 py-3 text-left transition-[border-color,background,transform] duration-150",
        "hover:border-coffer-green hover:bg-coffer-green-soft/40",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-mono text-[11px] font-semibold text-white",
          AVATAR_GRADIENTS[user.id],
        )}
      >
        {user.initials}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-coffer-text">{user.name}</div>
        <div className="text-xs text-coffer-text-tertiary">{user.role}</div>
      </div>
    </button>
  );
}

export function LoginUserList() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-coffer-bg p-6 [background-image:radial-gradient(900px_500px_at_50%_-10%,rgba(30,111,92,0.06),transparent_60%)]">
      <div className="w-full max-w-md rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface p-8 shadow-coffer-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-coffer-sm bg-gradient-to-br from-[#2C6E5B] to-[#163F34] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <svg
              className="h-5 w-5 stroke-[#EAF3EF]"
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
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-medium text-coffer-text">
            Sign in to Coffer
          </h1>
          <p className="mt-2 text-sm text-coffer-text-secondary">
            Choose a demo user to continue
          </p>
        </div>

        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {DEMO_USERS.map((user) => (
            <li key={user.id}>
              <form action={loginAsUser.bind(null, user.id)}>
                <UserLoginButton user={user} />
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
