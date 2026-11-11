import { useMemo, useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, PackagePlus, Scale, Search } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { useIngredients, useMovements, useRisk } from "@/api/catalog"
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback/states"
import { RisikoBadge, StatusStokBadge } from "@/components/shared/badges"
import { HelpTooltip, ISTILAH } from "@/components/shared/HelpTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { ResponsiveTable, type Column } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { urutkanMenurutStatus } from "@/lib/calc"
import { flags } from "@/lib/flags"
import { angka, bertanda, jam, tanggalRingkas } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Bahan, MutasiStok } from "@/types/domain"

type Filter = "semua" | "menipis" | "aman"

export default function StockPage() {
  const { data, isLoading, error, refetch } = useIngredients()
  const risk = useRisk()
  const [params, setParams] = useSearchParams()
  const filter = (params.get("filter") as Filter) || "semua"
  const [cari, setCari] = useState("")
  const [pilih, setPilih] = useState<Bahan | null>(null)

  const aktif = useMemo(() => urutkanMenurutStatus((data ?? []).filter((b) => b.aktif)), [data])
  const jumlahMenipis = aktif.filter((b) => b.status !== "aman").length
  const daftar = aktif.filter((b) => {
    if (filter === "menipis" && b.status === "aman") return false
    if (filter === "aman" && b.status !== "aman") return false
    return !cari.trim() || b.nama.toLowerCase().includes(cari.trim().toLowerCase())
  })
  const risikoById = new Map((risk.data ?? []).map((r) => [r.bahanId, r]))
  const tampilRisiko = flags.riskModel && risk.isSuccess

  const kolom: Column<Bahan>[] = [
    { key: "nama", header: "Bahan", mobile: "title", cell: (b) => <span className="font-semibold">{b.nama}</span> },
    { key: "status", header: "Status", mobile: "aside", cell: (b) => <StatusStokBadge status={b.status} /> },
    {
      key: "stok", header: "Stok saat ini", align: "right",
      cell: (b) => <span className={cn("num font-semibold", b.status === "habis" && "text-bahaya", b.status === "hampir_habis" && "text-warn")}>{angka(b.stokSaatIni, b.presisi)} <span className="font-normal text-muted-foreground">{b.satuan}</span></span>,
    },
    { key: "min", header: "Stok minimum", align: "right", cell: (b) => <span className="num text-muted-foreground">{angka(b.stokMinimum, b.presisi)} {b.satuan}</span> },
  ]
  if (tampilRisiko)
    kolom.push({
      key: "risiko",
      label: "Risiko habis",
      header: <span className="inline-flex items-center gap-1">Risiko habis <HelpTooltip istilah="Risiko habis">Perkiraan model, bukan stok aktual. Dihitung dari pola pemakaian beberapa hari terakhir.</HelpTooltip></span>,
      cell: (b) => (risikoById.get(b.id) ? <RisikoBadge risiko={risikoById.get(b.id)!.risiko} /> : <span className="text-muted-foreground">Tidak ada</span>),
    })

  const setFilter = (f: Filter) => {
    const next = new URLSearchParams(params)
    if (f === "semua") next.delete("filter")
    else next.set("filter", f)
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Stok bahan"
        description="Stok berubah otomatis dari pesanan, barang masuk, dan tutup shift."
        actions={
          <Button asChild>
            <Link to="/stok/barang-masuk">
              <PackagePlus />
              Catat barang masuk
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex gap-1.5" role="tablist" aria-label="Saring status">
          {([
            ["semua", `Semua (${aktif.length})`],
            ["menipis", `Menipis (${jumlahMenipis})`],
            ["aman", "Aman"],
          ] as [Filter, string][]).map(([f, label]) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                filter === f ? "border-tinta bg-tinta text-white" : "bg-card text-foreground/80 hover:bg-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari bahan" aria-label="Cari bahan" className="h-9 bg-card pl-9" />
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListSkeleton rows={8} />
      ) : daftar.length === 0 ? (
        <EmptyState title={filter === "menipis" ? "Tidak ada bahan yang menipis" : "Tidak ada bahan yang cocok"}>
          {filter === "menipis" ? "Semua bahan masih di atas stok minimum." : "Ubah kata pencarian atau pilih Semua."}
        </EmptyState>
      ) : (
        <ResponsiveTable caption="Daftar stok bahan" rows={daftar} rowKey={(b) => b.id} columns={kolom} onRowClick={setPilih} />
      )}
      {flags.riskModel && risk.isError && <p className="mt-3 text-sm text-muted-foreground">Perkiraan risiko habis sedang tidak tersedia. Daftar stok di atas tetap akurat.</p>}

      <Sheet open={!!pilih} onOpenChange={(o) => !o && setPilih(null)}>
        <SheetContent className="w-full sm:max-w-md">{pilih && <DetailBahan bahan={pilih} />}</SheetContent>
      </Sheet>
    </>
  )
}

const JENIS: Record<MutasiStok["jenis"], { label: string; icon: React.ElementType; warna: string }> = {
  masuk: { label: "Barang masuk", icon: ArrowDownToLine, warna: "text-ok bg-ok-muda" },
  terpakai: { label: "Terpakai", icon: ArrowUpFromLine, warna: "text-teh bg-teh-muda" },
  penyesuaian: { label: "Penyesuaian tutup shift", icon: Scale, warna: "text-info bg-info-muda" },
}

function DetailBahan({ bahan }: { bahan: Bahan }) {
  const { data, isLoading, error, refetch } = useMovements(bahan.id)
  const perHari = useMemo(() => {
    const m = new Map<string, MutasiStok[]>()
    for (const x of data ?? []) {
      const k = x.waktu.slice(0, 10)
      m.set(k, [...(m.get(k) ?? []), x])
    }
    return [...m.entries()]
  }, [data])
  return (
    <>
      <SheetHeader>
        <SheetTitle>{bahan.nama}</SheetTitle>
        <SheetDescription className="num">
          Stok {angka(bahan.stokSaatIni, bahan.presisi)} {bahan.satuan}, minimum {angka(bahan.stokMinimum, bahan.presisi)} {bahan.satuan}
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <p className="mb-3 flex items-center gap-1 text-sm font-semibold">
          Riwayat tujuh hari terakhir
          <HelpTooltip istilah="Penyesuaian">{ISTILAH.selisih} Penyesuaian dicatat saat tutup shift agar stok sama dengan hasil hitung.</HelpTooltip>
        </p>
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
        ) : perHari.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada perubahan stok dalam tujuh hari terakhir.</p>
        ) : (
          perHari.map(([hari, list]) => (
            <div key={hari} className="mb-4">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">{tanggalRingkas(hari)}</p>
              <ul className="divide-y rounded-lg border bg-card">
                {list.map((m) => {
                  const j = JENIS[m.jenis]
                  const nilai = m.jenis === "terpakai" ? -m.jumlah : m.jumlah
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", j.warna)}>
                        <j.icon className="size-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{m.referensi?.label ?? j.label}</p>
                        <p className="text-xs text-muted-foreground">{j.label}, {jam(m.waktu)}</p>
                      </div>
                      <span className={cn("num shrink-0 font-semibold", nilai < 0 ? "text-foreground" : "text-ok")}>
                        {bertanda(nilai, Math.max(bahan.presisi, m.jenis === "terpakai" ? 2 : 0))}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  )
}
