import { redirect } from "next/navigation";
import { Vendors } from "@/components/vendors";
import { getSessionUser } from "@/lib/auth/session";
import { listCountries } from "@/lib/db/countries";
import { listVendorsWithCountries } from "@/lib/db/vendors";

export default async function VendorsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const [vendors, countries] = await Promise.all([
    listVendorsWithCountries(),
    listCountries(),
  ]);

  return (
    <Vendors
      user={user}
      vendors={vendors}
      countries={countries.map((country) => ({
        countryId: country.countryId,
        countryName: country.countryName,
      }))}
    />
  );
}
