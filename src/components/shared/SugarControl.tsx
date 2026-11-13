import { cn } from "@/lib/utils"
import type { TingkatGula } from "@/types/domain"
import { Check } from "lucide-react"
import { useRef } from "react"

interface Props {
  value?: TingkatGula
  onChange: (v: TingkatGula) => void
  className?: string
  ukuran?: "sm" | "md"
}

const pilihan: TingkatGula[] = ["kurang", "normal", "ekstra"]

export function SugarControl({ value = "normal", onChange, className, ukuran = "md" }: Props) {
  const refs = useRef<Record<TingkatGula, HTMLButtonElement | null>>({ kurang: null, normal: null, ekstra: null })

  const pindahPilihan = (arah: -1 | 1) => {
    const berikutnya = pilihan[Math.min(pilihan.length - 1, Math.max(0, pilihan.indexOf(value) + arah))]
    onChange(berikutnya)
    refs.current[berikutnya]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tingkat gula"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          pindahPilihan(-1)
        }
        if (e.key === "ArrowRight") {
          e.preventDefault()
          pindahPilihan(1)
        }
      }}
      className={cn(
        "inline-flex items-stretch rounded-lg border bg-card",
        ukuran === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      {pilihan.map((p) => (
        <button
          key={p}
          ref={(node) => { refs.current[p] = node }}
          type="button"
          role="radio"
          aria-checked={p === value}
          tabIndex={p === value ? 0 : -1}
          onClick={() => onChange(p)}
          className={cn(
            "relative grid min-h-11 flex-1 place-items-center px-2 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            p === value ? "bg-teh-muda text-teh" : "hover:bg-accent"
          )}
        >
          {p === "kurang" && "Kurang"}
          {p === "normal" && "Normal"}
          {p === "ekstra" && "Ekstra"}
          {p === value && <Check className="absolute right-1 top-1 size-3.5" aria-hidden />}
        </button>
      ))}
    </div>
  )
}