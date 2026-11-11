import { useMemo, useState } from "react"
import { ChevronUp, Search, TriangleAlert, X } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"
import { useIngredients, useMenus } from "@/api/catalog"
import { useActiveShift, useCreateOrder } from "@/api/operations"
import { EmptyState, ErrorState } from "@/components/feedback/states"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
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
      cart.kosongkan()
      setDitandai([])
      setSheet(false)
    }
    buat.mutate(payload, {
      onSuccess: berhasil,
      onError: (e) => {
        const err = toApiError(e)
        if (err.code === "DUPLICATE_REQUEST" && err.data) {
          const lama = err.data as Pesanan
          if (samaIsiPesanan(lama, payload)) return berhasil(lama)
          // ID ini milik pesanan lain yang sudah tersimpan. Keranjang dipertahankan dan diberi ID baru.
          cart.idBaru()
          toast.error("Keranjang ini belum disimpan", {
            id: t,
            description: `Pesanan sebelumnya (${lama.nomor}) sudah tersimpan. Keranjang ini belum disimpan. Tekan Simpan Pesanan lagi untuk menyimpannya.`,
            duration: Infinity,
          })
          return
        }
        if (err.code === "STOCK_INSUFFICIENT") setDitandai(((err.data as { menuIds?: string[] })?.menuIds) ?? [])
        toast.error("Pesanan belum tersimpan", {
          id: t,
          description: err.code === "STOCK_INSUFFICIENT" ? `${err.message} Kurangi jumlah atau hapus menu yang ditandai.` : err.message,
          duration: Infinity,
        })
      },
    })
  }

  const notaProps = {
    menus: menus ?? [],
    ditandai,
    total,
    shiftNama: shift?.nama,
    pending: buat.isPending,
    disabled: !cart.items.length || adaInvalid || !online || buat.isPending,
    disabledReason: !online ? "Koneksi terputus." : adaInvalid ? "Periksa jumlah yang ditandai merah." : undefined,
    onSimpan: simpan,
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Catat pesanan</h1>
          {menipis > 0 && (
            <Link
              to="/stok?filter=menipis"
              className="inline-flex items-center gap-1.5 rounded-full bg-warn-muda px-3 py-1 text-sm font-semibold text-warn hover:underline"
            >
              <TriangleAlert className="size-4" aria-hidden />
              {menipis} bahan hampir habis
            </Link>
          )}
        </div>

        <div className="mb-3 lg:hidden">
          <KanalToggle />
        </div>

        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Kategori menu">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  filter === f ? "border-tinta bg-tinta text-white" : "bg-card text-foreground/80 hover:bg-accent",
                )}
              >
                {f === "semua" ? "Semua" : kategoriLabel[f]}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari menu" aria-label="Cari menu" className="h-9 bg-card pl-9" />
            {cari && (
              <button type="button" onClick={() => setCari("")} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Hapus pencarian">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : daftar.length === 0 ? (
          <EmptyState title={cari ? `Tidak ada menu "${cari}"` : "Belum ada menu aktif"}>
            {cari ? "Coba kata lain atau pilih kategori Semua." : "Pemilik dapat menambah menu di halaman Menu dan takaran."}
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4" aria-label="Daftar menu">
            {daftar.map((m) => (
              <li key={m.id}>
                <MenuTile menu={m} qty={qtyById.get(m.id) ?? 0} onAdd={() => cart.tambah(m.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ruang setinggi bar nota agar baris menu terbawah tidak tertutup di ponsel */}
      <div className="h-20 lg:hidden" aria-hidden />

      <aside className="hidden lg:sticky lg:top-20 lg:block" aria-label="Nota pesanan">
        <Nota {...notaProps} withKanal />
      </aside>

      {/* Bar ringkas di ponsel, di atas bottom navigation (POS-09) */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 lg:hidden">
        <div className={cn("mx-auto flex max-w-lg items-stretch gap-2 rounded-2xl border bg-tinta p-1.5 text-white shadow-lg shadow-tinta/15 transition-transform", !cart.items.length && "translate-y-[150%]")} aria-hidden={!cart.items.length}>
          <button type="button" onClick={() => setSheet(true)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-left focus-visible:ring-2 focus-visible:ring-jagung focus-visible:outline-none" tabIndex={cart.items.length ? 0 : -1}>
            <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-jagung text-sm font-bold text-tinta">{jumlahItem}</span>
            <span className="min-w-0">
              <span className="block text-xs text-white/70">Lihat nota</span>
              <span className="num block truncate text-lg leading-tight font-bold">{rupiah(total)}</span>
            </span>
            <ChevronUp className="ml-auto size-4 text-white/60" aria-hidden />
          </button>
          <Button onClick={simpan} disabled={notaProps.disabled} size="lg" className="h-12 rounded-xl bg-jagung px-5 text-base font-bold text-tinta hover:bg-jagung/90" tabIndex={cart.items.length ? 0 : -1}>
            {buat.isPending && <Spinner />}
            Simpan
          </Button>
        </div>
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl bg-background p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <SheetTitle className="sr-only">Nota pesanan</SheetTitle>
          <SheetDescription className="sr-only">Ubah jumlah atau kanal sebelum menyimpan pesanan</SheetDescription>
          <Nota {...notaProps} withKanal />
        </SheetContent>
      </Sheet>
    </div>
  )
}

const garisKategori: Record<KategoriMenu, string> = {
  teh: "before:bg-teh",
  jasuke: "before:bg-jagung",
  lainnya: "before:bg-tinta/40",
}

function MenuTile({ menu, qty, onAdd }: { menu: Menu; qty: number; onAdd: () => void }) {
  const kanal = useCart((s) => s.kanal)
  const habis = !menu.tersedia
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={habis}
      aria-label={`${menu.nama}, ${rupiah(hargaKanal(menu, kanal))}${qty ? `, ${qty} di nota` : ""}`}
      className={cn(
        "relative flex h-full min-h-24 w-full flex-col justify-between overflow-hidden rounded-xl border bg-card p-3 pl-4 text-left transition-[transform,background-color,border-color] duration-100",
        "before:absolute before:inset-y-0 before:left-0 before:w-1",
        garisKategori[menu.kategori],
        "hover:border-teh/40 active:scale-[0.98] active:bg-teh-muda/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        qty > 0 && "border-teh/50 bg-teh-muda/30",
        habis && "cursor-not-allowed opacity-55 active:scale-100",
      )}
    >
      <span className="pr-7 text-[0.95rem] leading-snug font-semibold">{menu.nama}</span>
      <span className="mt-2 flex items-end justify-between gap-2">
        <span className="num font-semibold text-foreground/80">{rupiah(hargaKanal(menu, kanal))}</span>
        {habis && <span className="text-xs font-semibold text-bahaya">Bahan kurang</span>}
      </span>
      {qty > 0 && (
        <span className="num absolute top-2.5 right-2.5 grid h-6 min-w-6 place-items-center rounded-full bg-teh px-1.5 text-xs font-bold text-primary-foreground">{qty}</span>
      )}
    </button>
  )
}
