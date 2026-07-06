"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AppShell } from "@/components/app-shell";
import {
  createVendorAction,
  deleteVendorAction,
  updateVendorAction,
} from "@/app/actions/vendors";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { DemoUser } from "@/lib/auth/constants";
import type { VendorWithCountry } from "@/lib/db/vendors";
import { cn } from "@/lib/utils";

export type CountryOption = {
  countryId: string;
  countryName: string;
};

type DrawerMode = "create" | "edit";

function NewVendorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[38px] cursor-pointer items-center gap-[7px] rounded-coffer-sm border-none bg-gradient-to-b from-[#21745F] to-[#175344] px-4 text-[13.5px] font-semibold text-[#F2FAF6] shadow-[0_6px_16px_-8px_rgba(23,83,68,0.7)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_10px_20px_-8px_rgba(23,83,68,0.75)]"
    >
      <svg
        className="h-[15px] w-[15px] stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      New vendor
    </button>
  );
}

export function Vendors({
  user,
  vendors,
  countries,
}: {
  user: DemoUser;
  vendors: VendorWithCountry[];
  countries: CountryOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setVendorName("");
    setCountryId(countries[0]?.countryId ?? "");
    setEditingVendorId(null);
    setFormError(null);
  }, [countries]);

  const openCreateDrawer = useCallback(() => {
    setDrawerMode("create");
    resetForm();
    setDrawerOpen(true);
  }, [resetForm]);

  const openEditDrawer = useCallback((vendor: VendorWithCountry) => {
    setDrawerMode("edit");
    setEditingVendorId(vendor.vendorId);
    setVendorName(vendor.vendorName);
    setCountryId(vendor.countryId || countries[0]?.countryId || "");
    setFormError(null);
    setDrawerOpen(true);
  }, [countries]);

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open);
      if (!open) {
        resetForm();
      }
    },
    [resetForm],
  );

  const handleSubmit = () => {
    setFormError(null);

    startTransition(async () => {
      const result =
        drawerMode === "create"
          ? await createVendorAction({ vendorName, countryId })
          : editingVendorId
            ? await updateVendorAction({
                vendorId: editingVendorId,
                vendorName,
                countryId,
              })
            : { error: "No vendor selected." };

      if ("error" in result && result.error) {
        setFormError(result.error);
        return;
      }

      setDrawerOpen(false);
      resetForm();
      router.refresh();
    });
  };

  const handleDelete = (vendor: VendorWithCountry) => {
    const confirmed = window.confirm(
      `Delete ${vendor.vendorName || "this vendor"}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteVendorAction(vendor.vendorId);
      if ("error" in result && result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <AppShell user={user} activeNav="vendors">
      <div className="flex flex-wrap items-end justify-between gap-5 max-[720px]:items-start">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.8px] text-coffer-text-tertiary uppercase">
            Directory
          </p>
          <h1 className="font-heading mb-1.5 text-[30px] font-medium tracking-[-0.2px] text-coffer-text max-[720px]:text-2xl">
            Vendors
          </h1>
          <p className="text-[13px] text-coffer-text-secondary">
            Manage supplier records used across invoice entry and approvals
          </p>
        </div>
        <NewVendorButton onClick={openCreateDrawer} />
      </div>

      <section className="rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface shadow-coffer-card">
        <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4">
          <div>
            <h2 className="m-0 text-[14.5px] font-semibold text-coffer-text">
              All vendors
            </h2>
            <p className="mt-0.5 text-xs text-coffer-text-tertiary">
              {vendors.length} vendor{vendors.length === 1 ? "" : "s"} in your
              workspace
            </p>
          </div>
        </div>

        <table className="mt-3.5 w-full border-collapse">
          <thead>
            <tr>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Vendor
              </th>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Country
              </th>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-right text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-[18px] py-10 text-center text-[13px] text-coffer-text-tertiary"
                >
                  No vendors yet. Click &ldquo;New vendor&rdquo; to add your
                  first supplier.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr
                  key={vendor.vendorId}
                  className="border-b border-coffer-border-soft transition-colors duration-150 last:border-b-0 hover:bg-coffer-surface-alt"
                >
                  <td className="px-[18px] py-[13px] align-middle text-[13px]">
                    <span className="block font-medium">
                      {vendor.vendorName || "—"}
                    </span>
                    <span className="block font-mono text-[11px] text-coffer-text-tertiary">
                      #{vendor.vendorId}
                    </span>
                  </td>
                  <td className="px-[18px] py-[13px] align-middle text-[13px] text-coffer-text-secondary">
                    {vendor.countryName || "—"}
                  </td>
                  <td className="px-[18px] py-[13px] text-right align-middle">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(vendor)}
                        disabled={isPending}
                        className="cursor-pointer rounded-coffer-sm border border-coffer-border bg-coffer-surface px-2.5 py-1 text-xs font-medium text-coffer-text-secondary transition-colors hover:border-[#D6D1C4] hover:text-coffer-text disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(vendor)}
                        disabled={isPending}
                        className="cursor-pointer rounded-coffer-sm border border-coffer-rust-soft bg-coffer-rust-soft px-2.5 py-1 text-xs font-medium text-coffer-rust-strong transition-colors hover:border-coffer-rust hover:bg-coffer-rust-soft disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-[18px] pt-3 pb-4 text-xs text-coffer-text-tertiary">
          <span>
            Showing {vendors.length} vendor{vendors.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <Drawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        swipeDirection="right"
      >
        <DrawerContent
          overlayClassName="bg-black/25 supports-backdrop-filter:backdrop-blur-sm"
          className="[--drawer-inset:18px] overflow-hidden !rounded-coffer-xl border border-coffer-border-soft bg-coffer-surface shadow-coffer-pop data-[swipe-direction=right]:border max-[720px]:[--drawer-inset:12px]"
        >
          <div className="flex h-full flex-col px-4 pt-5 pb-4">
            <DrawerHeader className="p-0 pb-5">
              <DrawerTitle className="font-heading text-[18px] font-medium text-coffer-text">
                {drawerMode === "create" ? "New vendor" : "Edit vendor"}
              </DrawerTitle>
              <DrawerDescription className="text-[13px] text-coffer-text-secondary">
                {drawerMode === "create"
                  ? "Add a supplier to your vendor directory."
                  : "Update vendor details."}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-1 flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-coffer-text-secondary">
                  Vendor name
                </span>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(event) => setVendorName(event.target.value)}
                  placeholder="e.g. Nordwind Logistics"
                  className="rounded-coffer-sm border border-coffer-border bg-coffer-surface-alt px-3 py-2 text-[13px] text-coffer-text outline-none transition-colors placeholder:text-coffer-text-tertiary focus:border-coffer-green"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-coffer-text-secondary">
                  Country
                </span>
                <select
                  value={countryId}
                  onChange={(event) => setCountryId(event.target.value)}
                  className="rounded-coffer-sm border border-coffer-border bg-coffer-surface-alt px-3 py-2 text-[13px] text-coffer-text outline-none transition-colors focus:border-coffer-green"
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {countries.map((country) => (
                    <option key={country.countryId} value={country.countryId}>
                      {country.countryName}
                    </option>
                  ))}
                </select>
              </label>

              {formError && (
                <p className="text-[12px] text-coffer-rust-strong">{formError}</p>
              )}
            </div>

            <DrawerFooter className="mt-6 flex-row gap-2 p-0">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !vendorName.trim() || !countryId}
                className={cn(
                  "flex h-[38px] flex-1 cursor-pointer items-center justify-center rounded-coffer-sm border-none bg-gradient-to-b from-[#21745F] to-[#175344] text-[13.5px] font-semibold text-[#F2FAF6] shadow-[0_6px_16px_-8px_rgba(23,83,68,0.7)] transition-[transform,box-shadow,opacity] duration-150 hover:-translate-y-px hover:shadow-[0_10px_20px_-8px_rgba(23,83,68,0.75)] disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {isPending
                  ? "Saving…"
                  : drawerMode === "create"
                    ? "Create vendor"
                    : "Save changes"}
              </button>
              <DrawerClose
                render={
                  <button
                    type="button"
                    className="flex h-[38px] cursor-pointer items-center justify-center rounded-coffer-sm border border-coffer-border bg-coffer-surface px-4 text-[13px] font-medium text-coffer-text-secondary transition-colors hover:border-[#D6D1C4] hover:text-coffer-text"
                  />
                }
              >
                Cancel
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
}
