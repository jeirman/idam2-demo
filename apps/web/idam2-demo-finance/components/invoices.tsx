"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CalendarIcon } from "lucide-react";
import { createInvoiceAction } from "@/app/actions/invoices";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateOnly } from "@/lib/dates";
import type { DemoUser } from "@/lib/auth/constants";
import type { InvoiceListItem, InvoiceStatus } from "@/lib/db/invoices";
import { cn } from "@/lib/utils";

export type VendorOption = {
  value: string;
  label: string;
};

export type CurrencyOption = {
  value: string;
  label: string;
};

const TABS = [
  { id: "all", label: "All invoices" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "released", label: "Released" },
] as const;

const AVATAR_GRADIENTS: Record<
  InvoiceListItem["submitter"]["avatar"],
  string
> = {
  maya: "bg-gradient-to-br from-[#2C6E5B] to-[#164F41]",
  priya: "bg-gradient-to-br from-[#B9862E] to-[#8A6420]",
  tomas: "bg-gradient-to-br from-[#3E6FA0] to-[#2C4F73]",
  ash: "bg-gradient-to-br from-[#B24F3D] to-[#8A3B2C]",
};

const STATUS_PILL: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  approved: {
    label: "Approved",
    bg: "bg-coffer-green-soft",
    text: "text-coffer-green-strong",
    dot: "bg-coffer-green",
  },
  pending: {
    label: "Pending",
    bg: "bg-coffer-gold-soft",
    text: "text-coffer-gold-strong",
    dot: "bg-coffer-gold",
  },
  released: {
    label: "Released",
    bg: "bg-coffer-blue-soft",
    text: "text-coffer-blue-strong",
    dot: "bg-coffer-blue",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-coffer-rust-soft",
    text: "text-coffer-rust-strong",
    dot: "bg-coffer-rust",
  },
};

function formatDueDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function NewInvoiceButton({ onClick }: { onClick: () => void }) {
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
      New invoice
    </button>
  );
}

function Avatar({
  initials,
  variant,
}: {
  initials: string;
  variant: InvoiceListItem["submitter"]["avatar"];
}) {
  return (
    <div
      className={cn(
        "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-semibold text-white",
        AVATAR_GRADIENTS[variant],
      )}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  const pill = STATUS_PILL[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium",
        pill.bg,
        pill.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", pill.dot)} />
      {pill.label}
    </span>
  );
}

function NewInvoiceDialog({
  open,
  onOpenChange,
  user,
  vendors,
  currencies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DemoUser;
  vendors: VendorOption[];
  currencies: CurrencyOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultCurrency = useMemo(
    () =>
      currencies.find((option) => option.value === "GBP") ??
      currencies[0] ??
      null,
    [currencies],
  );

  const [vendor, setVendor] = useState<VendorOption | null>(null);
  const [currency, setCurrency] = useState<CurrencyOption | null>(defaultCurrency);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    setFormError(null);

    if (!vendor || !currency || !amount.trim() || !dueDate) {
      setFormError("All fields are required.");
      return;
    }

    startTransition(async () => {
      const result = await createInvoiceAction({
        vendorId: vendor.value,
        amount,
        currency: currency.value,
        dueDate: formatDateOnly(dueDate),
        submissionCountry: user.country,
      });

      if ("error" in result && result.error) {
        setFormError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-black/25 supports-backdrop-filter:backdrop-blur-sm"
        className="gap-0 overflow-hidden border-coffer-border-soft bg-coffer-surface p-0 sm:max-w-md"
      >
        <DialogHeader className="border-b border-coffer-border-soft px-5 py-4">
          <DialogTitle className="font-heading text-[18px] font-medium text-coffer-text">
            New invoice
          </DialogTitle>
          <DialogDescription className="text-[13px] text-coffer-text-secondary">
            Create an invoice for entry and approval.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 py-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-coffer-text-secondary">
              Vendor
            </span>
            <Combobox
              items={vendors}
              value={vendor}
              onValueChange={(value) => setVendor(value)}
              itemToStringLabel={(option) => option.label}
              isItemEqualToValue={(a, b) => a.value === b.value}
            >
              <ComboboxInput
                placeholder="Select a vendor"
                className="w-full"
                disabled={vendors.length === 0}
              />
              <ComboboxContent>
                <ComboboxEmpty>No vendors found.</ComboboxEmpty>
                <ComboboxList>
                  {(option) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-coffer-text-secondary">
              Amount
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-coffer-text-secondary">
              Currency
            </span>
            <Combobox
              items={currencies}
              value={currency}
              onValueChange={(value) => setCurrency(value)}
              itemToStringLabel={(option) => option.label}
              isItemEqualToValue={(a, b) => a.value === b.value}
            >
              <ComboboxInput
                placeholder="Select a currency"
                className="w-full"
                disabled={currencies.length === 0}
              />
              <ComboboxContent>
                <ComboboxEmpty>No currencies found.</ComboboxEmpty>
                <ComboboxList>
                  {(option) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-coffer-text-secondary">
              Due date
            </span>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger
                className={cn(
                  "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none hover:bg-muted/40",
                  !dueDate && "text-muted-foreground",
                )}
              >
                {dueDate ? formatDueDate(dueDate) : "Pick a due date"}
                <CalendarIcon className="size-4 text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setDatePickerOpen(false);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </label>

          {formError && (
            <p className="text-[12px] text-coffer-rust-strong">{formError}</p>
          )}
        </div>

        <DialogFooter className="border-t border-coffer-border-soft bg-coffer-surface-alt px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isPending ||
              !vendor ||
              !currency ||
              !amount.trim() ||
              !dueDate ||
              vendors.length === 0
            }
            className="bg-gradient-to-b from-[#21745F] to-[#175344] text-[#F2FAF6] hover:from-[#1f6d59] hover:to-[#154d3f]"
          >
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Invoices({
  user,
  invoices,
  vendors,
  currencies,
}: {
  user: DemoUser;
  invoices: InvoiceListItem[];
  vendors: VendorOption[];
  currencies: CurrencyOption[];
}) {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus =
        activeTab === "all" || invoice.status === activeTab;
      const text =
        `${invoice.vendorName} ${invoice.displayId} ${invoice.submitter.name}`.toLowerCase();
      const matchesSearch = query === "" || text.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [activeTab, invoices, searchQuery]);

  return (
    <AppShell user={user} activeNav="invoices">
      <div className="flex flex-wrap items-end justify-between gap-5 max-[720px]:items-start">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.8px] text-coffer-text-tertiary uppercase">
            Ledger
          </p>
          <h1 className="font-heading mb-1.5 text-[30px] font-medium tracking-[-0.2px] text-coffer-text max-[720px]:text-2xl">
            Invoices
          </h1>
          <p className="text-[13px] text-coffer-text-secondary">
            Everything moving through entry, approval and release
          </p>
        </div>
        <NewInvoiceButton
          onClick={() => {
            setDialogKey((key) => key + 1);
            setDialogOpen(true);
          }}
        />
      </div>

      <NewInvoiceDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        vendors={vendors}
        currencies={currencies}
      />

      <section className="rounded-coffer-lg border border-coffer-border-soft bg-coffer-surface shadow-coffer-card">
        <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4">
          <div>
            <h2 className="m-0 text-[14.5px] font-semibold text-coffer-text">
              All invoices
            </h2>
            <p className="mt-0.5 text-xs text-coffer-text-tertiary">
              {invoices.length} invoice{invoices.length === 1 ? "" : "s"} in your
              workspace
            </p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-coffer-border-soft px-[18px] pt-3.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative mr-3.5 cursor-pointer border-none bg-transparent px-1 pb-[11px] text-[13px] font-medium transition-colors duration-150",
                activeTab === tab.id
                  ? "text-coffer-text after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-0.5 after:rounded-t-sm after:bg-coffer-green after:content-['']"
                  : "text-coffer-text-tertiary hover:text-coffer-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-[18px] py-3">
          <div className="flex min-w-[160px] flex-1 items-center gap-[7px] rounded-coffer-sm border border-coffer-border bg-coffer-surface-alt px-2.5 py-[7px]">
            <Icon className="h-3.5 w-3.5 text-coffer-text-tertiary">
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.2" y2="16.2" />
            </Icon>
            <input
              type="text"
              placeholder="Search vendor or invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent text-[12.5px] text-coffer-text outline-none placeholder:text-coffer-text-tertiary"
            />
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Invoice
              </th>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-right text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Amount
              </th>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Status
              </th>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Submitted by
              </th>
              <th className="border-t border-b border-coffer-border-soft px-[18px] py-2.5 text-left text-[11px] font-semibold tracking-[0.4px] text-coffer-text-tertiary uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-[18px] py-10 text-center text-[13px] text-coffer-text-tertiary"
                >
                  {invoices.length === 0
                    ? "No invoices yet."
                    : "No invoices match your filters."}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.invoiceId}
                  className="border-b border-coffer-border-soft transition-colors duration-150 last:border-b-0 hover:bg-coffer-surface-alt"
                >
                  <td className="px-[18px] py-[13px] align-middle text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <span className="block font-medium">
                          {invoice.vendorName}
                        </span>
                        <span className="block font-mono text-[11px] text-coffer-text-tertiary">
                          {invoice.displayId}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-[18px] py-[13px] text-right align-middle font-mono text-[13px] font-medium">
                    {invoice.amount}
                  </td>
                  <td className="px-[18px] py-[13px] align-middle text-[13px]">
                    <StatusPill status={invoice.status} />
                  </td>
                  <td className="px-[18px] py-[13px] align-middle text-[13px] text-coffer-text-secondary">
                    <div className="flex items-center gap-2">
                      <Avatar
                        initials={invoice.submitter.initials}
                        variant={invoice.submitter.avatar}
                      />
                      {invoice.submitter.name}
                    </div>
                  </td>
                  <td className="px-[18px] py-[13px] align-middle text-[13px]">
                    {invoice.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-[18px] pt-3 pb-4 text-xs text-coffer-text-tertiary">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      </section>
    </AppShell>
  );
}
