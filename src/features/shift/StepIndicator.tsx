import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Langkah tutup shift memang berurutan, jadi penomoran di sini membawa informasi */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const total = steps.length
  const stepNum = current + 1
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label={`Langkah tutup shift, langkah ${stepNum} dari ${total}`}>
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
            <div className="flex flex-col min-w-0">
              <span className={cn("truncate text-sm font-semibold", now ? "text-foreground" : "text-muted-foreground")}>
                {s}
              </span>
              {now && (
                <span className="text-xs text-muted-foreground">
                  Langkah {stepNum} dari {total}
                </span>
              )}
            </div>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", done ? "bg-ok" : "bg-border")} aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}