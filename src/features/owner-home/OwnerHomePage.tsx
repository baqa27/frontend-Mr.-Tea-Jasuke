import { subDays } from "date-fns"
import { BookOpen, ChartLine, LayoutDashboard } from "lucide-react"
import { Link } from "react-router"
import { useIngredients } from "@/api/catalog"
import { useRecap, useRecaps } from "@/api/insights"
import { useActiveShift } from "@/api/operations"
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary"
import { ErrorState } from "@/components/feedback/states"
import { StatusStokBadge } from "@/components/shared/badges"
import { PageHeader, Panel } from "@/components/shared/PageHeader"
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ErrorBoundary><OmzetHariIni tanggal={hariIni} /></ErrorBoundary>
        <ErrorBoundary><ShiftSekarang /></ErrorBoundary>
        <ErrorBoundary><TujuhHari /></ErrorBoundary>
        <ErrorBoundary><BahanMenipis /></ErrorBoundary>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Pintasan to="/pemilik/rekap" icon={BookOpen} judul="Rekap harian" ket="Omzet, menu terjual, dan selisih per tanggal" />
        <Pintasan to="/pemilik/perkiraan-belanja" icon={ChartLine} judul="Perkiraan belanja" ket="Kebutuhan bahan untuk besok" />
        {dashboardTersedia && <Pintasan to="/pemilik/dasbor" icon={LayoutDashboard} judul="Dasbor" ket="Grafik dengan filter tanggal dan shift" />}
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
    <section className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Omzet hari ini</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{data?.status === "lengkap" ? "Final" : "Sementara"}</span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-12 w-48" />
      ) : (
        <>
          <p className="num mt-2 text-[2.5rem] leading-none font-extrabold tracking-tight">{rupiah(omzet)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{belumAda ? "Belum ada shift yang dibuka hari ini." : `${angka(data?.jumlahPesanan ?? 0)} pesanan dari ${data?.perShift.length ?? 0} shift`}</p>
          {data && omzet > 0 && (
            <div className="mt-4">
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="bg-teh" style={{ width: `${(data.omzetPerKanal.toko / omzet) * 100}%` }} />
                <div className="bg-shopee" style={{ width: `${(data.omzetPerKanal.shopee_food / omzet) * 100}%` }} />
              </div>
              <dl className="num mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-teh" aria-hidden /><dt>Toko</dt><dd className="font-semibold">{rupiah(data.omzetPerKanal.toko)}</dd></div>
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-shopee" aria-hidden /><dt>Shopee Food</dt><dd className="font-semibold">{rupiah(data.omzetPerKanal.shopee_food)}</dd></div>
              </dl>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function ShiftSekarang() {
  const { data: shift, isLoading } = useActiveShift()
  return (
    <Panel title="Shift sekarang">
      {isLoading ? (
        <Skeleton className="h-12" />
      ) : shift ? (
        <div>
          <p className="text-lg font-bold">Shift {namaShiftLabel[shift.nama]}</p>
          <p className="text-sm text-muted-foreground">Dibuka {shift.dibukaOleh.nama} pukul {jam(shift.dibukaPada)}</p>
          <Link to="/pesanan" className="mt-3 inline-block text-sm font-medium text-teh hover:underline">Lihat pesanan hari ini</Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Tidak ada shift yang sedang berjalan.</p>
      )}
    </Panel>
  )
}

function TujuhHari() {
  const to = isoTanggal(new Date())
  const from = isoTanggal(subDays(new Date(), 6))
  const { data, isLoading, error, refetch } = useRecaps(from, to)
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  const rows = [...(data ?? [])].reverse()
  const max = Math.max(1, ...rows.map((r) => r.omzet))
  return (
    <Panel title="Omzet tujuh hari" action={<Link to="/pemilik/rekap" className="text-sm font-medium text-teh hover:underline">Semua rekap</Link>}>
      {isLoading ? (
        <Skeleton className="h-36" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada data.</p>
      ) : (
        <ol className="flex h-40 items-end gap-2" aria-label="Omzet per hari">
          {rows.map((r) => (
            <li key={r.tanggal} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <Link to={`/pemilik/rekap/${r.tanggal}`} className="group flex w-full flex-1 flex-col justify-end" aria-label={`${tanggalRingkas(r.tanggal)}: ${rupiah(r.omzet)}`}>
                <span className="num mb-1 hidden text-center text-[11px] font-semibold text-muted-foreground group-hover:block sm:group-hover:block">{Math.round(r.omzet / 1000)}rb</span>
                <span
                  className={cn("w-full rounded-t-md transition-colors", r.status === "lengkap" ? "bg-teh/80 group-hover:bg-teh" : "bg-jagung group-hover:bg-jagung/80")}
                  style={{ height: `${Math.max(4, (r.omzet / max) * 100)}%` }}
                />
              </Link>
              <span className="text-[11px] font-medium text-muted-foreground">{tanggalRingkas(r.tanggal).split(",")[0]}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

function BahanMenipis() {
  const { data, isLoading } = useIngredients()
  const list = urutkanMenurutStatus((data ?? []).filter((b) => b.aktif && b.status !== "aman")).slice(0, 6)
  return (
    <Panel title="Perlu diperhatikan" action={<Link to="/stok" className="text-sm font-medium text-teh hover:underline">Semua stok</Link>} bodyClassName="p-0">
      {isLoading ? (
        <div className="p-4"><Skeleton className="h-36" /></div>
      ) : list.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">Semua bahan masih di atas stok minimum.</p>
      ) : (
        <ul className="divide-y">
          {list.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{b.nama}</p>
                <p className="num text-muted-foreground">{angka(b.stokSaatIni, b.presisi)} {b.satuan}</p>
              </div>
              <StatusStokBadge status={b.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function Pintasan({ to, icon: Icon, judul, ket }: { to: string; icon: React.ElementType; judul: string; ket: string }) {
  return (
    <Link to={to} className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-teh/40 hover:bg-teh-muda/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teh-muda text-teh"><Icon className="size-5" aria-hidden /></span>
      <span>
        <span className="block font-semibold">{judul}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{ket}</span>
      </span>
    </Link>
  )
}
