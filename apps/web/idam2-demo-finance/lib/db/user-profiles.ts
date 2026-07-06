import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function createUserProfile(data: Prisma.UserProfileCreateInput) {
  return prisma.userProfile.create({ data });
}

export async function getUserProfileByEmail(email: string) {
  return prisma.userProfile.findUnique({ where: { email } });
}

export async function listUserProfiles(
  args?: Pick<Prisma.UserProfileFindManyArgs, "where" | "orderBy" | "skip" | "take">,
) {
  return prisma.userProfile.findMany({
    orderBy: { displayName: "asc" },
    ...args,
  });
}

export async function updateUserProfile(
  email: string,
  data: Prisma.UserProfileUpdateInput,
) {
  return prisma.userProfile.update({ where: { email }, data });
}

export async function deleteUserProfile(email: string) {
  return prisma.userProfile.delete({ where: { email } });
}
