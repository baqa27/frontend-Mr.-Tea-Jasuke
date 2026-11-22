import { useRef, type ComponentProps, type KeyboardEvent } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PilihanTema } from "@/lib/tema"
import { useTema } from "@/stores/tema-store"

const PILIHAN: Array<{ nilai: PilihanTema; label: string; Ikon: typeof Sun }> = [
  { nilai: "terang", label: "Terang", Ikon: Sun },
  { nilai: "gelap", label: "Gelap", Ikon: Moon },
  { nilai: "sistem", label: "Ikuti sistem", Ikon: Monitor },
]

export function PilihTema({ className, ringkas = false, ...div }: ComponentProps<"div"> & { ringkas?: boolean }) {
  const pilihan = useTema((s) => s.pilihan)
  const setPilihan = useTema((s) => s.setPilihan)
  const tombol = useRef<Array<HTMLButtonElement | null>>([])

  const aktifkan = (i: number) => {
    const berikut = (i + PILIHAN.length) % PILIHAN.length
    setPilihan(PILIHAN[berikut].nilai)
    tombol.current[berikut]?.focus()
  }

  const saatTekan = (e: KeyboardEvent<HTMLButtonElement>, indeks: number) => {
    const arah =
      e.key === "ArrowLeft" || e.key === "ArrowUp"
        ? -1
        : e.key === "ArrowRight" || e.key === "ArrowDown"
          ? 1
          : 0
    if (arah !== 0) {
      e.preventDefault()
      return aktifkan(indeks + arah)
    }
    if (e.key === "Home") {
      e.preventDefault()
      return aktifkan(0)
    }
    if (e.key === "End") {
      e.preventDefault()
      return aktifkan(PILIHAN.length - 1)
    }
    if (e.key === " ") e.preventDefault()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema tampilan"
      className={cn("inline-grid h-11 auto-cols-fr grid-flow-col gap-1.5", className)}
      {...div}
    >
      {PILIHAN.map((p, i) => (
        <button
          key={p.nilai}
          ref={(el) => {
            tombol.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={pilihan === p.nilai}
          aria-label={p.label}
          onClick={() => aktifkan(i)}
          onKeyDown={(e) => saatTekan(e, i)}
          className={cn(
            "grid h-11 place-items-center gap-1.5 rounded-lg border px-3.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
            pilihan === p.nilai
              ? "border-teh bg-teh-muda font-medium text-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <p.Ikon className="size-4 shrink-0" aria-hidden />
          {!ringkas && <span>{p.label}</span>}
        </button>
      ))}
    </div>
  )
}
