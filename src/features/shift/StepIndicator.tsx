import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Langkah tutup shift memang berurutan, jadi penomoran di sini membawa informasi */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Langkah tutup shift">
      {steps.map((s, i) => {
        const done = i < current
        const now = i === current
        return (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-2" aria-current={now ? "step" : undefined}>
            <span
              className={cn(
                "num grid size-7 shrink-0 place-items-center rounded-full border text-sm font-bold",
                done && "border-ok bg-ok text-white",
                now && "border-teh bg-teh text-primary-foreground",
                !done && !now && "bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span className={cn("truncate text-sm font-semibold", now ? "text-foreground" : "text-muted-foreground", !now && "max-sm:sr-only")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", done ? "bg-ok" : "bg-border")} aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
