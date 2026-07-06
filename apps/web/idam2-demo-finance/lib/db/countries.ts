import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function createCountry(data: Prisma.CountryCreateInput) {
  return prisma.country.create({ data });
}

export async function getCountryById(countryId: string) {
  return prisma.country.findUnique({ where: { countryId } });
}

export async function listCountries(
  args?: Pick<Prisma.CountryFindManyArgs, "where" | "orderBy" | "skip" | "take">,
) {
  return prisma.country.findMany({
    orderBy: { countryName: "asc" },
    ...args,
  });
}

export async function updateCountry(
  countryId: string,
  data: Prisma.CountryUpdateInput,
) {
  return prisma.country.update({ where: { countryId }, data });
}

export async function deleteCountry(countryId: string) {
  return prisma.country.delete({ where: { countryId } });
}
