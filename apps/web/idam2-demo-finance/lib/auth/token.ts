import "server-only";

import type { TestProfile } from "@/lib/auth/profiles";

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function mintTestJwt(profile: TestProfile): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "none" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: profile.sub,
      name: profile.name,
      department: profile.department,
      job_title: profile.job_title,
      country: profile.country,
      initials: profile.initials,
    }),
  );

  return `${header}.${payload}.`;
}
