import { useMemo, useState } from "react"
import { ChevronUp, Search, TriangleAlert, X } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"
import { useIngredients, useMenus } from "@/api/catalog"
import { useActiveShift, useCreateOrder } from "@/api/operations"
import { EmptyState, ErrorState } from "@/components/feedback/states"
import KategoriIlustrasi from "@/components/shared/KategoriIlustrasi"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { MenuPhoto } from "@/components/shared/MenuPhoto"
import { toApiError } from "@/lib/api-error"
import { hargaKanal, samaIsiPesanan, totalKeranjang } from "@/lib/calc"
import { kategoriLabel, rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { uuid } from "@/lib/uuid"
import { jumlahPorsiSchema, orderSchema } from "@/schemas"
import { useCart } from "@/stores/cart-store"
import { useUi } from "@/stores/ui-store"
import type { KategoriMenu, Menu, Pesanan } from "@/types/domain"
import { KanalToggle } from "./KanalToggle"
import { Nota } from "./Nota"

type Filter = "semua" | KategoriMenu
const FILTERS: Filter[] = ["semua", "teh", "jasuke", "lainnya"]

export default function PosPage() {
  const { data: menus, isLoading, error, refetch } = useMenus({ aktif: true })
  const { data: bahan } = useIngredients()
  const { data: shift } = useActiveShift()
  const cart = useCart()
  const online = useUi((s) => s.online)
  const buat = useCreateOrder()
  const [filter, setFilter] = useState<Filter>("semua")
  const [cari, setCari] = useState("")
  const [sheet, setSheet] = useState(false)
  const [ditandai, setDitandai] = useState<string[]>([])

  const menipis = (bahan ?? []).filter((b) => b.aktif && b.status !== "aman").length
  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return (menus ?? []).filter((m) => (filter === "semua" || m.kategori === filter) && (!q || m.nama.toLowerCase().includes(q)))
  }, [menus, filter, cari])
  const jumlahKategori = (f: Filter) => f === "semua" ? (menus ?? []).length : (menus ?? []).filter((m) => m.kategori === f).length
  const qtyById = new Map(cart.items.map((i) => [i.menuId, i.jumlah]))
  const total = totalKeranjang(cart.items, menus ?? [], cart.kanal)
  const jumlahItem = cart.items.reduce((a, i) => a + (Number.isFinite(i.jumlah) ? i.jumlah : 0), 0)
  const adaInvalid = cart.items.some((i) => !jumlahPorsiSchema.safeParse(i.jumlah).success)

  const simpan = () => {
    const payload = { clientRequestId: cart.clientRequestId ?? uuid(), kanal: cart.kanal, items: cart.items }
    const cek = orderSchema.safeParse(payload)
    if (!cek.success) {
      toast.error("Pesanan belum bisa disimpan", { description: cek.error.issues[0]?.message })
      return
    }
    const t = toast.loading("Memproses pesanan...")
    const berhasil = (p: Pesanan) => {
      toast.success(`Pesanan ${p.nomor} tersimpan`, { id: t, description: `Total ${rupiah(p.total)}, kanal ${p.kanal === "toko" ? "Toko" : "Shopee Food"}.` })
      cart.kosongkan(); setDitandai([]); setSheet(false)
    }
    buat.mutate(payload, {
      onSuccess: berhasil,
      onError: (e) => {
        const err = toApiError(e)
        if (err.code === "DUPLICATE_REQUEST" && err.data) {
          const lama = err.data as Pesanan
          if (samaIsiPesanan(lama, payload)) return berhasil(lama)
          cart.idBaru()
          toast.error("Keranjang ini belum disimpan", { id: t, description: `Pesanan sebelumnya (${lama.nomor}) sudah tersimpan. Keranjang ini belum disimpan. Tekan Simpan Pesanan lagi untuk menyimpannya.`, duration: Infinity })
          return
        }
        if (err.code === "STOCK_INSUFFICIENT") setDitandai(((err.data as { menuIds?: string[] })?.menuIds) ?? [])
        toast.error("Pesanan belum tersimpan", { id: t, description: err.code === "STOCK_INSUFFICIENT" ? `${err.message} Kurangi jumlah atau hapus menu yang ditandai.` : err.message, duration: Infinity })
      },
    })
  }

  const notaProps = { menus: menus ?? [], ditandai, total, shiftNama: shift?.nama, pending: buat.isPending, disabled: !cart.items.length || adaInvalid || !online || buat.isPending, disabledReason: !online ? "Koneksi terputus." : adaInvalid ? "Periksa jumlah yang ditandai merah." : undefined, onSimpan: simpan }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px]/8 font-extrabold tracking-tight">Catat pesanan</h1>
          {menipis > 0 && <Link to="/stok?filter=menipis" className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-warn-muda px-3 text-sm font-semibold text-warn hover:underline"><TriangleAlert className="size-4" aria-hidden />{menipis} bahan hampir habis</Link>}
        </div>
        <div className="mb-3 lg:hidden"><KanalToggle /></div>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Kategori menu">
            {FILTERS.map((f) => <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("flex h-14 shrink-0 items-center gap-2 rounded-xl border bg-card px-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", filter === f ? tabAktif[f] : "hover:bg-accent")}>
              <span className={cn("grid size-10 place-items-center rounded-md", kategoriMuda[f])}><KategoriIlustrasi kategori={f === "semua" ? "lainnya" : f} className="size-6" /></span>
              <span><span className="block text-sm font-bold">{f === "semua" ? "Semua" : kategoriLabel[f]}</span><span className="num block text-xs text-muted-foreground">{jumlahKategori(f)} menu</span></span>
            </button>)}
          </div>
          <div className="relative lg:ml-auto lg:w-60"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari menu" aria-label="Cari menu" className="h-11 bg-card pl-9" />{cari && <button type="button" onClick={() => setCari("")} className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground" aria-label="Hapus pencarian"><X className="size-4" /></button>}</div>
        </div>
        {error ? <ErrorState error={error} onRetry={() => refetch()} /> : isLoading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(176px,1fr))]">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />)}</div> : daftar.length === 0 ? <EmptyState title={cari ? `Tidak ada menu "${cari}"` : "Belum ada menu aktif"}>{cari ? "Coba kata lain atau pilih kategori Semua." : "Pemilik dapat menambah menu di halaman Menu dan takaran."}</EmptyState> : <ul className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(176px,1fr))]" aria-label="Daftar menu">{daftar.map((m) => <li key={m.id}><MenuTile menu={m} qty={qtyById.get(m.id) ?? 0} onAdd={() => cart.tambah(m.id)} /></li>)}</ul>}
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
      <aside className="hidden lg:sticky lg:top-20 lg:block" aria-label="Nota pesanan"><Nota {...notaProps} withKanal /></aside>
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 lg:hidden"><div className={cn("mx-auto flex max-w-lg items-stretch gap-2 rounded-2xl border bg-card p-1.5 shadow-[var(--shadow-melayang)] transition-transform", !cart.items.length && "translate-y-[150%]")} aria-hidden={!cart.items.length}><button type="button" onClick={() => setSheet(true)} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-left focus-visible:ring-2 focus-visible:ring-jagung focus-visible:outline-none" tabIndex={cart.items.length ? 0 : -1}><span className="num grid size-8 shrink-0 place-items-center rounded-full bg-jagung text-sm font-bold text-tinta-tetap">{jumlahItem}</span><span className="min-w-0"><span className="block text-xs text-muted-foreground">Lihat nota</span><span className="num block truncate text-[22px]/7 font-extrabold">{rupiah(total)}</span></span><ChevronUp className="ml-auto size-4 text-muted-foreground" aria-hidden /></button><Button onClick={simpan} disabled={notaProps.disabled} size="lg" className="h-14 rounded-xl px-5 text-base font-bold" tabIndex={cart.items.length ? 0 : -1}>{buat.isPending && <Spinner />}Simpan</Button></div></div>
      <Sheet open={sheet} onOpenChange={setSheet}><SheetContent side="bottom" className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl bg-background p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"><SheetTitle className="sr-only">Nota pesanan</SheetTitle><SheetDescription className="sr-only">Ubah jumlah atau kanal sebelum menyimpan pesanan</SheetDescription><Nota {...notaProps} withKanal /></SheetContent></Sheet>
    </div>
  )
}

const kategoriMuda: Record<Filter, string> = { semua: "bg-muted", teh: "bg-kat-teh-muda", jasuke: "bg-kat-jasuke-muda", lainnya: "bg-kat-paket-muda" }
const tabAktif: Record<Filter, string> = { semua: "border-2 border-tinta bg-muted", teh: "border-2 border-kat-teh bg-kat-teh-muda", jasuke: "border-2 border-kat-jasuke bg-kat-jasuke-muda", lainnya: "border-2 border-kat-paket bg-kat-paket-muda" }
const borderKategori: Record<KategoriMenu, string> = { teh: "border-kat-teh", jasuke: "border-kat-jasuke", lainnya: "border-kat-paket" }

function MenuTile({ menu, qty, onAdd }: { menu: Menu; qty: number; onAdd: () => void }) {
  const kanal = useCart((s) => s.kanal)
  const habis = !menu.tersedia
  return <button type="button" onClick={onAdd} disabled={habis} aria-label={`${menu.nama}, ${rupiah(hargaKanal(menu, kanal))}${qty ? `, ${qty} di nota` : ""}${habis ? ", bahan kurang" : ""}`} className={cn("group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition-[transform,border-color] duration-120 hover:border-teh active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", qty > 0 && cn("border-2", borderKategori[menu.kategori]), habis && "cursor-not-allowed active:scale-100")}><span className="relative block"><MenuPhoto fotoUrl={menu.fotoUrl} kategori={menu.kategori} nama={menu.nama} className={cn("rounded-none", habis && "grayscale")} />{habis && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-bahaya-muda px-2 py-1 text-xs font-semibold text-bahaya"><TriangleAlert className="size-3.5" aria-hidden />Bahan kurang</span>}{qty > 0 && <span className="num absolute top-2 right-2 grid h-7 min-w-7 place-items-center rounded-full bg-teh px-1.5 text-sm font-bold text-primary-foreground">{qty}</span>}</span><span className="flex flex-1 flex-col justify-between gap-1 p-3"><span className="line-clamp-2 text-base/6 font-bold">{menu.nama}</span><span className="num text-[18px]/6 font-extrabold text-teh-tua">{rupiah(hargaKanal(menu, kanal))}</span></span></button>
}
