import { FlaskConical } from "lucide-react"

export function SimulasiBanner({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="flex items-start gap-2.5 rounded-lg border border-info/20 bg-info-muda px-3.5 py-3 text-sm text-info">
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}
