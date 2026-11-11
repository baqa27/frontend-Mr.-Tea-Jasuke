import { Trash2 } from "lucide-react"
import { QuantityStepper } from "@/components/shared/QuantityStepper"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { hargaKanal } from "@/lib/calc"
import { jam, namaShiftLabel, rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { jumlahPorsiSchema } from "@/schemas"
import { useCart } from "@/stores/cart-store"
import type { Menu, NamaShift } from "@/types/domain"
import { KanalToggle } from "./KanalToggle"

interface Props {
  menus: Menu[]
  ditandai: string[]
  total: number
  shiftNama?: NamaShift
  pending: boolean
  disabled: boolean
  disabledReason?: string
  withKanal?: boolean
  onSimpan: () => void
}

/**
 * Nota pesanan bergaya kertas struk. Satu-satunya elemen dekoratif di aplikasi:
 * tepi bawah bergerigi dan garis putus-putus, mengganti buku catatan kasir.
 */
export function Nota({ menus, ditandai, total, shiftNama, pending, disabled, disabledReason, withKanal, onSimpan }: Props) {
  const { items, kanal, setJumlah, hapus, kosongkan } = useCart()
  const byId = new Map(menus.map((m) => [m.id, m]))

  return (
    <div className="nota-edge rounded-t-xl border border-b-0 bg-card pb-6 shadow-[0_1px_0_var(--border)]">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <p className="font-bold">Nota pesanan</p>
          <p className="text-xs text-muted-foreground">
            {shiftNama ? `Shift ${namaShiftLabel[shiftNama]}, ` : ""}
            {jam(new Date())}
          </p>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={kosongkan} className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-bahaya">
            Kosongkan
          </button>
        )}
      </div>

      {withKanal && <KanalToggle className="mx-4 mt-3" />}

      <div className="mx-4 mt-4 border-t border-dashed border-input" />

      {items.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Ketuk menu di sebelah untuk menambahkannya ke nota.</p>
      ) : (
        <ul className="divide-y divide-dashed divide-input px-4">
          {items.map((it) => {
            const m = byId.get(it.menuId)
            if (!m) return null
            const harga = hargaKanal(m, kanal)
            const valid = jumlahPorsiSchema.safeParse(it.jumlah)
            const flag = ditandai.includes(it.menuId)
            return (
              <li key={it.menuId} className={cn("py-3", flag && "-mx-4 bg-bahaya-muda/60 px-4")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="leading-snug font-semibold">{m.nama}</p>
                    <p className="num text-sm text-muted-foreground">{rupiah(harga)} per porsi</p>
                    {flag && <p className="text-sm font-medium text-bahaya">Stok bahan tidak cukup</p>}
                  </div>
                  <p className="num shrink-0 font-semibold">{valid.success ? rupiah(harga * it.jumlah) : "Rp0"}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <QuantityStepper value={it.jumlah} onChange={(n) => setJumlah(it.menuId, n)} onRemove={() => hapus(it.menuId)} label={m.nama} invalid={!valid.success} />
                  <button type="button" onClick={() => hapus(it.menuId)} className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-bahaya" aria-label={`Hapus ${m.nama}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {!valid.success && <p className="mt-1 text-sm text-bahaya">{valid.error.issues[0]?.message}</p>}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mx-4 border-t border-dashed border-input" />
      <div className="flex items-baseline justify-between px-4 pt-3">
        <span className="font-semibold">Total</span>
        <span className="num text-[1.75rem] leading-none font-extrabold tracking-tight">{rupiah(total)}</span>
      </div>
      <div className="px-4 pt-4">
        <Button size="lg" className="h-12 w-full text-base font-bold" disabled={disabled} onClick={onSimpan}>
          {pending && <Spinner />}
          {pending ? "Memproses..." : "Simpan Pesanan"}
        </Button>
        {disabledReason && <p className="mt-2 text-center text-sm text-bahaya">{disabledReason}</p>}
      </div>
    </div>
  )
}
