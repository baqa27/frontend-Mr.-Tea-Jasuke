import { subDays } from "date-fns"
import { AlertTriangle, BookOpen, ChartLine, CheckCircle2, LayoutDashboard } from "lucide-react"
import { Link } from "react-router"
import { useIngredients } from "@/api/catalog"
import { useRecap, useRecaps } from "@/api/insights"
import { useActiveShift } from "@/api/operations"
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary"
import { ErrorState } from "@/components/feedback/states"
import { StatusStokBadge } from "@/components/shared/badges"
import { PageHeader } from "@/components/shared/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardTersedia } from "@/components/layout/nav"
import { useSession } from "@/features/auth/session"
import { toApiError } from "@/lib/api-error"
import { urutkanMenurutStatus } from "@/lib/calc"
import { angka, isoTanggal, jam, namaShiftLabel, rupiah, tanggalPanjang, tanggalRingkas } from "@/lib/format"
import { cn } from "@/lib/utils"

function sapaan(d = new Date()) {
  const h = d.getHours()
  if (h < 11) return "Selamat pagi"
  if (h < 15) return "Selamat siang"
  if (h < 18) return "Selamat sore"
  return "Selamat malam"
}

export default function OwnerHomePage() {
  const { pengguna } = useSession()
  const hariIni = isoTanggal(new Date())
  return (
    <>
      <PageHeader title={`${sapaan()}, ${pengguna?.nama ?? ""}`} description={tanggalPanjang(new Date())} />
      <div className="grid gap-4 lg:grid-cols-12">
        <ErrorBoundary><OmzetHariIni tanggal={hariIni} /></ErrorBoundary>
        <ErrorBoundary><ShiftSekarang /></ErrorBoundary>
        <ErrorBoundary><BahanMenipis /></ErrorBoundary>
        <Pintasan />
      </div>
    </>
  )
}

function OmzetHariIni({ tanggal }: { tanggal: string }) {
  const { data, isLoading, error, refetch } = useRecap(tanggal)
  const belumAda = error && toApiError(error).status === 404
  if (error && !belumAda) return <ErrorState error={error} onRetry={() => refetch()} />
  const omzet = data?.omzet ?? 0
  return (
    <section className="rounded-xl border bg-card p-5 lg:col-span-7">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Omzet hari ini</h2>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{data?.status === "lengkap" ? "Final" : "Sementara"}</span>
      </div>
      {isLoading ? <Skeleton className="mt-3 h-12 w-48" /> : (
        <>
          <p className="num mt-3 text-[44px]/[48px] font-extrabold tracking-tight">{rupiah(omzet)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{belumAda ? "Belum ada shift yang dibuka hari ini." : `${angka(data?.jumlahPesanan ?? 0)} pesanan dari ${data?.perShift.length ?? 0} shift`}</p>
          {data && omzet > 0 && <>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span className="inline-block h-full bg-teh align-top" style={{ width: `${(data.omzetPerKanal.toko / omzet) * 100}%` }} />
              <span className="inline-block h-full bg-shopee align-top" style={{ width: `${(data.omzetPerKanal.shopee_food / omzet) * 100}%` }} />
            </div>
            <dl className="num mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-teh" aria-hidden /><dt>Toko</dt><dd className="font-semibold">{rupiah(data.omzetPerKanal.toko)}</dd></div>
              <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-shopee" aria-hidden /><dt>Shopee Food</dt><dd className="font-semibold">{rupiah(data.omzetPerKanal.shopee_food)}</dd></div>
            </dl>
          </>}
          <TujuhHari />
        </>
      )}
    </section>
  )
}

function ShiftSekarang() {
  const { data: shift, isLoading } = useActiveShift()
  return (
    <section className="rounded-xl border bg-ok-muda p-5 lg:col-span-5">
      <div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-ok" aria-hidden /><h2 className="font-semibold">Shift aktif</h2></div>
      {isLoading ? <Skeleton className="mt-3 h-12" /> : shift ? <div className="mt-3"><p className="text-lg font-bold">Shift {namaShiftLabel[shift.nama]}</p><p className="text-sm text-ok-teks">Dibuka {shift.dibukaOleh.nama} pukul {jam(shift.dibukaPada)}</p><Link to="/pesanan" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-teh hover:underline">Lihat pesanan hari ini</Link></div> : <p className="mt-3 text-sm text-ok-teks">Tidak ada shift yang sedang berjalan.</p>}
    </section>
  )
}

function TujuhHari() {
  const to = isoTanggal(new Date())
  const from = isoTanggal(subDays(new Date(), 6))
  const { data, isLoading, error, refetch } = useRecaps(from, to)
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  const rows = [...(data ?? [])].reverse()
  const max = Math.max(1, ...rows.map((r) => r.omzet))
  return <div className="mt-6"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Omzet tujuh hari</h3><Link to="/pemilik/rekap" className="inline-flex min-h-11 items-center text-sm font-medium text-teh hover:underline">Semua rekap</Link></div>{isLoading ? <Skeleton className="h-32" /> : rows.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada data.</p> : <ol className="flex h-36 items-end gap-2" aria-label="Omzet per hari">{rows.map((r) => <li key={r.tanggal} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"><Link to={`/pemilik/rekap/${r.tanggal}`} className="flex w-full flex-1 flex-col justify-end rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label={`${tanggalRingkas(r.tanggal)}: ${rupiah(r.omzet)}. Buka rekap.`}><span className="num mb-1 text-center text-xs font-semibold text-muted-foreground">{Math.round(r.omzet / 1000)}rb</span><span className={cn("w-full rounded-t-md", r.status === "lengkap" ? "bg-teh" : "bg-ok")} style={{ height: `${Math.max(4, (r.omzet / max) * 100)}%` }} /></Link><span className="text-xs font-medium text-muted-foreground">{tanggalRingkas(r.tanggal).split(",")[0]}</span></li>)}</ol>}</div>
}

function BahanMenipis() {
  const { data, isLoading } = useIngredients()
  const list = urutkanMenurutStatus((data ?? []).filter((b) => b.aktif && b.status !== "aman")).slice(0, 5)
  return <section className="rounded-xl border bg-card p-5 lg:col-span-5"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><AlertTriangle className="size-5 text-warn" aria-hidden /><h2 className="font-semibold">Hampir habis</h2></div><Link to="/stok" className="inline-flex min-h-11 items-center text-sm font-medium text-teh hover:underline">Semua stok</Link></div>{isLoading ? <Skeleton className="mt-3 h-28" /> : list.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Semua bahan masih di atas stok minimum.</p> : <ul className="mt-3 grid gap-3">{list.map((b) => <li key={b.id}><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{b.nama}</span><StatusStokBadge status={b.status} /></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-warn" style={{ width: `${Math.min(100, (b.stokSaatIni / Math.max(b.stokMinimum, 1)) * 100)}%` }} /></div><p className="num mt-1 text-xs text-muted-foreground">{angka(b.stokSaatIni, b.presisi)} {b.satuan} tersisa</p></li>)}</ul>}</section>
}

function Pintasan() {
  return <section className="rounded-xl border border-dashed bg-card p-5 lg:col-span-5"><h2 className="font-semibold">Pintasan</h2><div className="mt-2 grid"> <Link to="/pemilik/rekap" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-teh hover:underline"><BookOpen className="size-4" aria-hidden />Rekap harian</Link><Link to="/pemilik/perkiraan-belanja" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-teh hover:underline"><ChartLine className="size-4" aria-hidden />Perkiraan belanja</Link>{dashboardTersedia && <Link to="/pemilik/dasbor" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-teh hover:underline"><LayoutDashboard className="size-4" aria-hidden />Dasbor</Link>}</div></section>
}