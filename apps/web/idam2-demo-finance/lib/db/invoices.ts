import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { listDemoUsers } from "@/lib/auth/profiles";

export type InvoiceStatus =
  | "pending"
  | "approved"
  | "released"
  | "rejected";

export type InvoiceListItem = {
  invoiceId: string;
  displayId: string;
  vendorName: string;
  amount: string;
  status: InvoiceStatus;
  submitter: {
    initials: string;
    name: string;
    avatar: "maya" | "priya" | "tomas" | "ash";
  };
  date: string;
};

const AVATAR_VARIANTS = ["maya", "priya", "tomas", "ash"] as const;

function normalizeStatus(raw: string | null | undefined): InvoiceStatus {
  const status = (raw ?? "submitted").toLowerCase();
  if (status === "submitted" || status === "pending") return "pending";
  if (status === "approved") return "approved";
  if (status === "released") return "released";
  if (status === "rejected") return "rejected";
  return "pending";
}

function formatAmount(
  amount: Prisma.Decimal | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount == null) return "—";
  const value = Number(amount);
  const code = currency ?? "GBP";

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

function formatEntryDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function resolveSubmitter(submittedBy: string): InvoiceListItem["submitter"] {
  const demoUser = listDemoUsers().find(
    (user) =>
      user.id === submittedBy ||
      user.name === submittedBy ||
      submittedBy.toLowerCase().includes(user.id),
  );

  if (demoUser) {
    return {
      name: demoUser.name,
      initials: demoUser.initials,
      avatar: demoUser.id as InvoiceListItem["submitter"]["avatar"],
    };
  }

  const name = submittedBy.includes("@")
    ? submittedBy.split("@")[0]!.replace(/[._]/g, " ")
    : submittedBy;
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]!)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";
  const avatarIndex =
    [...submittedBy].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    AVATAR_VARIANTS.length;

  return {
    name,
    initials,
    avatar: AVATAR_VARIANTS[avatarIndex]!,
  };
}

export async function listInvoicesForDisplay(): Promise<InvoiceListItem[]> {
  const [invoices, vendors] = await Promise.all([
    listInvoices(),
    prisma.vendor.findMany(),
  ]);

  const vendorMap = new Map(
    vendors.map((vendor) => [vendor.vendorId, vendor.vendorName ?? ""]),
  );

  return invoices.map((invoice) => ({
    invoiceId: invoice.invoiceId.toString(),
    displayId: `INV-${invoice.invoiceId}`,
    vendorName: invoice.vendorId
      ? (vendorMap.get(invoice.vendorId) ?? "Unknown vendor")
      : "Unknown vendor",
    amount: formatAmount(invoice.amount, invoice.currency),
    status: normalizeStatus(invoice.status),
    submitter: resolveSubmitter(invoice.submittedBy),
    date: formatEntryDate(invoice.entryDate),
  }));
}

export async function createInvoice(data: Prisma.InvoiceCreateInput) {
  return prisma.invoice.create({ data });
}

export async function getInvoiceById(invoiceId: bigint) {
  return prisma.invoice.findUnique({ where: { invoiceId } });
}

export async function listInvoices(
  args?: Pick<Prisma.InvoiceFindManyArgs, "where" | "orderBy" | "skip" | "take">,
) {
  return prisma.invoice.findMany({
    orderBy: { entryDate: "desc" },
    ...args,
  });
}

export async function updateInvoice(
  invoiceId: bigint,
  data: Prisma.InvoiceUpdateInput,
) {
  return prisma.invoice.update({ where: { invoiceId }, data });
}

export async function deleteInvoice(invoiceId: bigint) {
  return prisma.invoice.delete({ where: { invoiceId } });
}
