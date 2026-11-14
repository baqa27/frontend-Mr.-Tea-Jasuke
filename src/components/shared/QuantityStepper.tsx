import { Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Props {
  value: number
  onChange: (n: number) => void
  onRemove?: () => void
  label: string
  invalid?: boolean
  max?: number
}

/** Stepper jumlah dengan target sentuh 44 px (POS-03, POS-04) */
export function QuantityStepper({ value, onChange, onRemove, label, invalid, max = 99 }: Props) {
  const [teks, setTeks] = useState(String(value))
  useEffect(() => setTeks(String(value)), [value])

  const komit = (raw: string) => {
    const n = Number(raw)
    if (raw.trim() === "" || !Number.isFinite(n)) {
      onChange(Number.NaN)
      return
    }
    onChange(n)
  }

  return (
    <div className={cn("inline-flex items-stretch rounded-lg border bg-card", invalid && "border-bahaya ring-2 ring-bahaya/20")}>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-l-lg text-foreground hover:bg-accent active:bg-accent disabled:bg-muted disabled:text-muted-foreground"
        onClick={() => (value <= 1 ? onRemove?.() : onChange(value - 1))}
        aria-label={value <= 1 ? `Hapus ${label}` : `Kurangi ${label}`}
      >
        <Minus className="size-4" />
      </button>
      <input
        value={teks}
        inputMode="numeric"
        aria-label={`Jumlah ${label}`}
        aria-invalid={invalid}
        className="num w-10 border-x bg-transparent text-center text-base font-semibold outline-none focus-visible:bg-accent"
        onChange={(e) => {
          setTeks(e.target.value)
          komit(e.target.value)
        }}
        onBlur={() => {
          if (!Number.isFinite(Number(teks)) || teks.trim() === "") setTeks(teks)
        }}
      />
      <button
        type="button"
        className="grid size-11 place-items-center rounded-r-lg text-foreground hover:bg-accent active:bg-accent disabled:bg-muted disabled:text-muted-foreground"
        onClick={() => onChange(Math.min(max, (Number.isFinite(value) ? value : 0) + 1))}
        disabled={value >= max}
        aria-label={`Tambah ${label}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
