"use server";

import { revalidatePath } from "next/cache";
import {
  createVendor,
  deleteVendor,
  updateVendor,
} from "@/lib/db/vendors";

export async function createVendorAction(input: {
  vendorName: string;
  countryId: string;
}) {
  const vendorName = input.vendorName.trim();
  const countryId = input.countryId.trim();

  if (!vendorName || !countryId) {
    return { error: "Vendor name and country are required." };
  }

  try {
    await createVendor({ vendorName, countryId });
    revalidatePath("/vendors");
    return { success: true as const };
  } catch {
    return { error: "Failed to create vendor." };
  }
}

export async function updateVendorAction(input: {
  vendorId: string;
  vendorName: string;
  countryId: string;
}) {
  const vendorName = input.vendorName.trim();
  const countryId = input.countryId.trim();

  if (!vendorName || !countryId) {
    return { error: "Vendor name and country are required." };
  }

  try {
    await updateVendor(BigInt(input.vendorId), { vendorName, countryId });
    revalidatePath("/vendors");
    return { success: true as const };
  } catch {
    return { error: "Failed to update vendor." };
  }
}

export async function deleteVendorAction(vendorId: string) {
  try {
    await deleteVendor(BigInt(vendorId));
    revalidatePath("/vendors");
    return { success: true as const };
  } catch {
    return { error: "Failed to delete vendor." };
  }
}
