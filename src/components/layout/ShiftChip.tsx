import { Link } from "react-router"
import { useActiveShift } from "@/api/operations"
import { jam, namaShiftLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Status shift selalu terlihat di topbar (NAV-03) */
export function ShiftChip({ className }: { className?: string }) {
  const { data: shift, isLoading } = useActiveShift()
  if (isLoading) return <span className={cn("h-11 w-40 animate-pulse rounded-full bg-muted", className)} />
  return (
    <Link
      to="/shift"
      data-tour="shift-chip"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        shift
          ? shift.nama === "pagi"
            ? "border-warn bg-warn-muda text-warn"
            : shift.nama === "siang"
            ? "border-ok bg-ok-muda text-ok-teks"
            : "border-teh bg-teh-muda text-teh-tua"
          : "bg-card text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          shift ? (shift.nama === "pagi" ? "bg-warn" : shift.nama === "siang" ? "bg-ok" : "bg-teh") : "bg-muted-foreground/40",
        )}
        aria-hidden
      />
      {shift ? (
        <span>
          Shift {namaShiftLabel[shift.nama]} aktif sejak {jam(shift.dibukaPada)}
        </span>
      ) : (
        "Belum ada shift"
      )}
    </Link>
  )
}
