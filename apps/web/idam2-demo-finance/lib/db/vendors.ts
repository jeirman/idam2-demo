import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function createVendor(data: Prisma.VendorCreateInput) {
  return prisma.vendor.create({ data });
}

export async function getVendorById(vendorId: bigint) {
  return prisma.vendor.findUnique({ where: { vendorId } });
}

export async function listVendors(
  args?: Pick<Prisma.VendorFindManyArgs, "where" | "orderBy" | "skip" | "take">,
) {
  return prisma.vendor.findMany({
    orderBy: { vendorName: "asc" },
    ...args,
  });
}

export async function updateVendor(
  vendorId: bigint,
  data: Prisma.VendorUpdateInput,
) {
  return prisma.vendor.update({ where: { vendorId }, data });
}

export async function deleteVendor(vendorId: bigint) {
  return prisma.vendor.delete({ where: { vendorId } });
}

export type VendorWithCountry = {
  vendorId: string;
  vendorName: string;
  countryId: string;
  countryName: string;
};

export async function listVendorsWithCountries(): Promise<VendorWithCountry[]> {
  const [vendors, countries] = await Promise.all([
    listVendors(),
    prisma.country.findMany({ orderBy: { countryName: "asc" } }),
  ]);

  const countryMap = new Map(
    countries.map((country) => [country.countryId, country.countryName]),
  );

  return vendors.map((vendor) => ({
    vendorId: vendor.vendorId.toString(),
    vendorName: vendor.vendorName ?? "",
    countryId: vendor.countryId ?? "",
    countryName: vendor.countryId
      ? (countryMap.get(vendor.countryId) ?? vendor.countryId)
      : "",
  }));
}
