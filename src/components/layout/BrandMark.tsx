import { cn } from "@/lib/utils"

/** Logo sederhana: gelas teh tersegel dengan garis jagung */
export function BrandMark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--teh)" />
        <path d="M9 10h14l-1.6 14.2a2 2 0 0 1-2 1.8h-6.8a2 2 0 0 1-2-1.8z" fill="var(--primary-foreground)" />
        <path d="M8 10h16" stroke="var(--jagung)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M17.5 4.5 16 10" stroke="var(--primary-foreground)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[0.95rem] font-bold tracking-tight">Mr. Tea &amp; Jasuke</p>
          <p className="text-xs text-muted-foreground">Catatan toko</p>
        </div>
      )}
    </div>
  )
}
