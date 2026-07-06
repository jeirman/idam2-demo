"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { parseDateOnly } from "@/lib/dates";
import { createInvoice } from "@/lib/db/invoices";

export async function createInvoiceAction(input: {
  vendorId: string;
  amount: string;
  currency: string;
  dueDate: string;
  submissionCountry: string;
}) {
  const user = await getSessionUser();

  if (!user) {
    return { error: "You must be logged in to create an invoice." };
  }

  const vendorId = input.vendorId.trim();
  const amountValue = input.amount.trim();
  const currency = input.currency.trim();
  const dueDateValue = input.dueDate.trim();
  const submissionCountry = user.country.trim();

  if (!vendorId || !amountValue || !currency || !dueDateValue) {
    return { error: "All fields are required." };
  }

  if (!submissionCountry) {
    return { error: "Your profile is missing a submission country." };
  }

  if (input.submissionCountry.trim() !== submissionCountry) {
    return { error: "Submission country does not match your profile." };
  }

  const amount = Number(amountValue);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount greater than zero." };
  }

  const dueDate = parseDateOnly(dueDateValue);
  if (!dueDate) {
    return { error: "Enter a valid due date." };
  }

  try {
    await createInvoice({
      vendorId: BigInt(vendorId),
      amount,
      currency,
      dueDate,
      submittedBy: user.id,
      submissionCountry,
      entryDate: new Date(),
      status: "submitted",
    });
    revalidatePath("/invoices");
    return { success: true as const };
  } catch (error) {
    console.error("createInvoiceAction failed:", error);
    return { error: "Failed to create invoice." };
  }
}
