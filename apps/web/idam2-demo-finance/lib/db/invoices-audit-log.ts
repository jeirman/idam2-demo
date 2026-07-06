import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function createInvoiceAuditLog(
  data: Prisma.InvoiceAuditLogCreateInput,
) {
  return prisma.invoiceAuditLog.create({ data });
}

export async function getInvoiceAuditLogById(auditId: bigint) {
  return prisma.invoiceAuditLog.findUnique({ where: { auditId } });
}

export async function listInvoiceAuditLogs(
  args?: Pick<
    Prisma.InvoiceAuditLogFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  >,
) {
  return prisma.invoiceAuditLog.findMany({
    orderBy: { auditDatetime: "desc" },
    ...args,
  });
}

export async function listInvoiceAuditLogsForInvoice(auditOn: bigint) {
  return prisma.invoiceAuditLog.findMany({
    where: { auditOn },
    orderBy: { auditDatetime: "desc" },
  });
}

export async function updateInvoiceAuditLog(
  auditId: bigint,
  data: Prisma.InvoiceAuditLogUpdateInput,
) {
  return prisma.invoiceAuditLog.update({ where: { auditId }, data });
}

export async function deleteInvoiceAuditLog(auditId: bigint) {
  return prisma.invoiceAuditLog.delete({ where: { auditId } });
}
