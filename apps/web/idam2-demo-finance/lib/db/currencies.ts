import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function createCurrency(data: Prisma.CurrencyCreateInput) {
  return prisma.currency.create({ data });
}

export async function getCurrencyByCode(currencyCode: string) {
  return prisma.currency.findUnique({ where: { currencyCode } });
}

export async function listCurrencies(
  args?: Pick<Prisma.CurrencyFindManyArgs, "where" | "orderBy" | "skip" | "take">,
) {
  return prisma.currency.findMany({
    orderBy: { currencyCode: "asc" },
    ...args,
  });
}

export async function updateCurrency(
  currencyCode: string,
  data: Prisma.CurrencyUpdateInput,
) {
  return prisma.currency.update({ where: { currencyCode }, data });
}

export async function deleteCurrency(currencyCode: string) {
  return prisma.currency.delete({ where: { currencyCode } });
}
