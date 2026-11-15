import { ShoppingBag, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/stores/cart-store"
import type { Kanal } from "@/types/domain"

const OPSI: { v: Kanal; label: string; icon: React.ElementType }[] = [
  { v: "toko", label: "Toko", icon: Store },
  { v: "shopee_food", label: "Shopee Food", icon: ShoppingBag },
]

/** Pemilih kanal (POS-02). Mengganti kanal langsung memperbarui harga. */
export function KanalToggle({ className }: { className?: string }) {
  const kanal = useCart((s) => s.kanal)
  const setKanal = useCart((s) => s.setKanal)
  return (
    <div role="radiogroup" aria-label="Kanal penjualan" className={cn("grid grid-cols-2 gap-1 rounded-xl border bg-muted p-1", className)}>
      {OPSI.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={kanal === o.v}
          onClick={() => setKanal(o.v)}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            kanal === o.v ? (o.v === "toko" ? "bg-card text-foreground shadow-sm" : "bg-shopee-muda text-shopee shadow-sm") : "text-muted-foreground hover:text-foreground",
          )}
        >
          <o.icon className="size-4" aria-hidden />
          {o.label}
        </button>
      ))}
    </div>
  )
}
