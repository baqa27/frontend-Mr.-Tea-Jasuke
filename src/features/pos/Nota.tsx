import { Trash2 } from "lucide-react"
import KategoriIlustrasi from "@/components/shared/KategoriIlustrasi"
import { MenuPhoto } from "@/components/shared/MenuPhoto"
import { QuantityStepper } from "@/components/shared/QuantityStepper"
import { SugarControl } from "@/components/shared/SugarControl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { hargaKanal } from "@/lib/calc"
import { jam, namaShiftLabel, rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { jumlahPorsiSchema } from "@/schemas"
import { useCart } from "@/stores/cart-store"
import type { KategoriMenu, Menu, NamaShift } from "@/types/domain"
import { KanalToggle } from "./KanalToggle"

interface Props { menus: Menu[]; ditandai: string[]; total: number; shiftNama?: NamaShift; pending: boolean; disabled: boolean; disabledReason?: string; withKanal?: boolean; onSimpan: () => void }
const titikKategori: Record<KategoriMenu, string> = { teh: "bg-kat-teh", jasuke: "bg-kat-jasuke", lainnya: "bg-kat-paket" }

export function Nota({ menus, ditandai, total, shiftNama, pending, disabled, disabledReason, withKanal, onSimpan }: Props) {
  const { items, kanal, setJumlah, setGula, hapus, kosongkan } = useCart()
  const byId = new Map(menus.map((m) => [m.id, m]))
  const subtotal = items.reduce((nilai, item) => { const menu = byId.get(item.menuId); return menu && Number.isFinite(item.jumlah) ? nilai + hargaKanal(menu, kanal) * item.jumlah : nilai }, 0)
  return <div className="nota-edge rounded-t-xl border border-b-0 bg-card pb-6 shadow-[0_1px_0_var(--border)]">
    <div className="flex items-center justify-between px-4 pt-4"><div><p className="text-[22px]/7 font-extrabold">Pesanan baru</p><p className="text-xs text-muted-foreground">{shiftNama ? `Shift ${namaShiftLabel[shiftNama]}, ` : ""}{jam(new Date())}</p></div>{items.length > 0 && <button type="button" onClick={kosongkan} className="min-h-11 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-bahaya">Kosongkan</button>}</div>
    {withKanal && <KanalToggle className="mx-4 mt-3" />}
    <div className="mx-4 mt-4 border-t-2 border-dashed border-input" />
    {items.length === 0 ? <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground"><KategoriIlustrasi kategori="teh" className="size-12" /><p>Ketuk menu di kiri untuk mulai mencatat pesanan.</p></div> : <ul className="divide-y-2 divide-dashed divide-input px-4">{items.map((item) => { const menu = byId.get(item.menuId); if (!menu) return null; const harga = hargaKanal(menu, kanal); const valid = jumlahPorsiSchema.safeParse(item.jumlah); const flag = ditandai.includes(item.menuId); return <li key={item.menuId} className={cn("py-3", flag && "-mx-4 bg-bahaya-muda px-4")}><div className="flex items-start gap-2"><MenuPhoto fotoUrl={menu.fotoUrl} kategori={menu.kategori} nama={menu.nama} className="size-11 shrink-0 rounded-md" /><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 leading-snug font-semibold"><span className={cn("size-2 shrink-0 rounded-full", titikKategori[menu.kategori])} aria-hidden />{menu.nama}</p><p className="num text-sm text-muted-foreground">{item.jumlah} × {rupiah(harga)} = {valid.success ? rupiah(harga * item.jumlah) : "Rp0"}</p>{flag && <p className="text-sm font-medium text-bahaya">Stok bahan tidak cukup</p>}</div></div><div className="mt-2 flex items-center justify-between gap-2"><QuantityStepper value={item.jumlah} onChange={(jumlah) => setJumlah(item.menuId, jumlah)} onRemove={() => hapus(item.menuId)} label={menu.nama} invalid={!valid.success} /><button type="button" onClick={() => hapus(item.menuId)} className="grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-bahaya" aria-label={`Hapus ${menu.nama}`}><Trash2 className="size-4" /></button></div>{menu.bisaAturGula && <SugarControl value={item.tingkatGula} onChange={(gula) => setGula(item.menuId, gula)} ukuran="sm" className="mt-2 w-full" />}{!valid.success && <p className="mt-1 text-sm text-bahaya">{valid.error.issues[0]?.message}</p>}</li> })}</ul>}
    <div className="mx-4 border-t-2 border-dashed border-input" /><div className="space-y-2 px-4 pt-3"><div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span className="num">{rupiah(subtotal)}</span></div><div className="flex items-baseline justify-between"><span className="font-semibold">Total</span><span className="num text-[36px]/10 font-extrabold tracking-tight">{rupiah(total)}</span></div></div>
    <div className="px-4 pt-4 lg:sticky lg:bottom-0 lg:bg-card lg:pb-1"><Button size="lg" className="h-14 w-full text-base font-bold" disabled={disabled} onClick={onSimpan}>{pending && <Spinner />}{pending ? "Memproses..." : "Simpan Pesanan"}</Button>{disabledReason && <p className="mt-2 text-center text-sm text-bahaya">{disabledReason}</p>}</div>
  </div>
}
