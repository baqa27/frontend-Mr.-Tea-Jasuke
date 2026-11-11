import { Link } from "react-router"
import { useActiveShift } from "@/api/operations"
import { jam, namaShiftLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Status shift selalu terlihat di topbar (NAV-03) */
export function ShiftChip({ className }: { className?: string }) {
  const { data: shift, isLoading } = useActiveShift()
  if (isLoading) return <span className={cn("h-8 w-36 animate-pulse rounded-full bg-muted", className)} />
  return (
    <Link
      to="/shift"
      data-tour="shift-chip"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        shift ? "border-jagung/60 bg-jagung-muda text-tinta hover:bg-jagung-muda/70" : "bg-card text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", shift ? "bg-ok" : "bg-muted-foreground/40")} aria-hidden />
      {shift ? (
        <span>
          Shift {namaShiftLabel[shift.nama]} <span className="hidden font-normal text-tinta/70 sm:inline">sejak {jam(shift.dibukaPada)}</span>
        </span>
      ) : (
        "Belum ada shift"
      )}
    </Link>
  )
}
