import { cn } from "@/lib/utils";

export function Icon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={cn(
        "block h-[18px] w-[18px] shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6]",
        className,
      )}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}
