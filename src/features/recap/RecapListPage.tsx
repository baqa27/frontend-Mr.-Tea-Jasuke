import { subDays } from "date-fns"
import { BookOpen } from "lucide-react"
import { useNavigate } from "react-router"
import { useRecaps } from "@/api/insights"
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback/states"
import { Pill } from "@/components/shared/badges"
import { PageHeader } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { angka, isoTanggal, rupiah, tanggalPanjang } from "@/lib/format"

export default function RecapListPage() {
  const navigate = useNavigate()
  const to = isoTanggal(new Date())
  const from = isoTanggal(subDays(new Date(), 29))
  const { data, isLoading, error, refetch } = useRecaps(from, to)

  return (
    <>
      <PageHeader
        title="Rekap harian"
        description="30 hari terakhir. Rekap final setelah Shift Malam ditutup."
        actions={
          <div className="flex items-center gap-2">
            <Label htmlFor="lompat" className="text-sm whitespace-nowrap">Buka tanggal</Label>
            <Input id="lompat" type="date" max={to} className="h-9 w-auto bg-card" onChange={(e) => e.target.value && navigate(`/pemilik/rekap/${e.target.value}`)} />
          </div>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListSkeleton rows={8} />
      ) : !data?.length ? (
        <EmptyState icon={BookOpen} title="Belum ada rekap">Rekap muncul setelah shift pertama dibuka.</EmptyState>
      ) : (
        <ResponsiveTable
          caption="Daftar rekap harian"
          rows={data}
          rowKey={(r) => r.tanggal}
          onRowClick={(r) => navigate(`/pemilik/rekap/${r.tanggal}`)}
          columns={[
            { key: "tgl", header: "Tanggal", mobile: "title", cell: (r) => tanggalPanjang(r.tanggal) },
            { key: "status", header: "Status", mobile: "aside", cell: (r) => (r.status === "lengkap" ? <Pill tone="ok">Lengkap</Pill> : <Pill tone="warn">Belum lengkap</Pill>) },
            { key: "pesanan", header: "Pesanan", align: "right", cell: (r) => <span className="num">{angka(r.jumlahPesanan)}</span> },
            { key: "omzet", header: "Omzet", align: "right", cell: (r) => <span className="num font-semibold">{rupiah(r.omzet)}</span> },
            { key: "selisih", header: "Bahan berselisih", align: "right", cell: (r) => <span className={r.jumlahBahanBerselisih ? "num font-semibold text-warn" : "num text-muted-foreground"}>{r.jumlahBahanBerselisih}</span> },
          ]}
        />
      )}
    </>
  )
}
