import { redirect } from "next/navigation";
import { Invoices } from "@/components/invoices";
import { getSessionUser } from "@/lib/auth/session";
import { listCurrencies } from "@/lib/db/currencies";
import { listInvoicesForDisplay } from "@/lib/db/invoices";
import { listVendors } from "@/lib/db/vendors";

export default async function InvoicesPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const [invoices, vendors, currencies] = await Promise.all([
    listInvoicesForDisplay(),
    listVendors(),
    listCurrencies(),
  ]);

  return (
    <Invoices
      user={user}
      invoices={invoices}
      vendors={vendors.map((vendor) => ({
        value: vendor.vendorId.toString(),
        label: vendor.vendorName || `Vendor #${vendor.vendorId}`,
      }))}
      currencies={currencies.map((currency) => ({
        value: currency.currencyCode,
        label: `${currency.currencyCode} — ${currency.currencyName}`,
      }))}
    />
  );
}
