import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import type { DemoUser } from "@/lib/auth/constants";

export type TestProfile = {
  sub: string;
  name: string;
  department: string;
  job_title: string;
  country: string;
  initials: string;
};

const PROFILE_IDS = ["priya", "maya", "tomas"] as const;

export type ProfileId = (typeof PROFILE_IDS)[number];

function profilesDir(): string {
  return path.resolve(process.cwd(), "../../../test-profiles");
}

function loadProfile(id: ProfileId): TestProfile {
  const filePath = path.join(profilesDir(), `${id}.json`);
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as TestProfile;
}

const profileCache = new Map<ProfileId, TestProfile>();

export function getTestProfile(userId: string): TestProfile | undefined {
  if (!PROFILE_IDS.includes(userId as ProfileId)) {
    return undefined;
  }

  const id = userId as ProfileId;
  if (!profileCache.has(id)) {
    profileCache.set(id, loadProfile(id));
  }

  return profileCache.get(id);
}

export function listTestProfiles(): TestProfile[] {
  return PROFILE_IDS.map((id) => getTestProfile(id)!);
}

export function isValidProfileId(userId: string | undefined): userId is ProfileId {
  return Boolean(userId && PROFILE_IDS.includes(userId as ProfileId));
}

export function toDemoUser(profile: TestProfile): DemoUser {
  return {
    id: profile.sub,
    name: profile.name,
    role: profile.job_title,
    department: profile.department,
    job_title: profile.job_title,
    country: profile.country,
    initials: profile.initials,
  };
}

export function getDemoUser(userId: string): DemoUser | undefined {
  const profile = getTestProfile(userId);
  return profile ? toDemoUser(profile) : undefined;
}

export function listDemoUsers(): DemoUser[] {
  return listTestProfiles().map(toDemoUser);
}
