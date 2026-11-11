import { CircleCheck, Printer } from "lucide-react"
import { Link, useLocation, useParams } from "react-router"
import { useShiftRecap } from "@/api/operations"
import { ErrorState, PageSkeleton } from "@/components/feedback/states"
import { SelisihBadge } from "@/components/shared/badges"
import { PageHeader, Panel } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { useSession } from "@/features/auth/session"
import { kategoriSelisih } from "@/lib/calc"
import { angka, bertanda, durasi, jam, namaShiftLabel, rupiah, tanggalPanjang } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function ShiftRecapPage() {
  const { id } = useParams()
  const loc = useLocation()
  const { isPemilik } = useSession()
  const { data: r, isLoading, error, refetch } = useShiftRecap(id)
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isLoading || !r) return <PageSkeleton />
  const baru = (loc.state as { baruDitutup?: boolean } | null)?.baruDitutup
  const berselisih = r.stok.filter((s) => s.selisih !== null && s.selisih !== 0).length

  return (
    <div className="print-full">
      {baru && (
        <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-ok/30 bg-ok-muda px-4 py-3 text-ok">
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Shift {namaShiftLabel[r.nama]} sudah ditutup</p>
            <p className="text-sm text-ok/90">
              {r.rekapHarianDibuat ? `Rekap harian ${tanggalPanjang(r.tanggal)} sudah dibuat. ` : ""}
              {r.durasiTutupDetik ? `Tutup shift selesai dalam ${durasi(r.durasiTutupDetik)}.` : ""}
            </p>
          </div>
        </div>
      )}
      <PageHeader
        title={`Rekap Shift ${namaShiftLabel[r.nama]}`}
        description={`${tanggalPanjang(r.tanggal)}. Dibuka ${r.dibukaOleh} pukul ${jam(r.dibukaPada)}${r.ditutupPada ? `, ditutup pukul ${jam(r.ditutupPada)}` : ", masih berjalan"}.`}
        actions={
          <div className="no-print flex gap-2">
            {isPemilik && r.rekapHarianDibuat && (
              <Button asChild variant="outline"><Link to={`/pemilik/rekap/${r.tanggal}`}>Buka rekap harian</Link></Button>
            )}
            <Button variant="outline" onClick={() => window.print()}><Printer />Cetak</Button>
            <Button asChild><Link to="/shift">Selesai</Link></Button>
          </div>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kotak label="Pesanan" nilai={angka(r.jumlahPesanan)} />
        <Kotak label="Omzet" nilai={rupiah(r.omzet)} />
        <Kotak label="Shopee Food" nilai={rupiah(r.omzetPerKanal.shopee_food)} />
        <Kotak label="Bahan berselisih" nilai={`${berselisih} dari ${r.stok.length}`} />
      </div>
      <Panel title="Stok per bahan" bodyClassName="p-0">
        <ResponsiveTable
          flush
          dense
          caption="Rekap stok per bahan"
          rows={r.stok}
          rowKey={(s) => s.bahanId}
          rowClassName={(s) => (s.melewatiToleransi ? "bg-bahaya-muda/40" : undefined)}
          columns={[
            { key: "nama", header: "Bahan", mobile: "title", cell: (s) => <div><p className="font-semibold">{s.namaBahan}</p>{s.catatan && <p className="text-xs font-normal text-muted-foreground">{s.catatan}</p>}</div> },
            { key: "badge", header: "Status", mobile: "aside", cell: (s) => <SelisihBadge kategori={kategoriSelisih(s.selisih, s.toleransi)} /> },
            { key: "awal", header: "Awal", align: "right", cell: (s) => <span className="num">{angka(s.awal, s.presisi)}</span> },
            { key: "masuk", header: "Masuk", align: "right", cell: (s) => <span className="num">{s.masuk ? `+${angka(s.masuk, s.presisi)}` : "0"}</span> },
            { key: "pakai", header: "Terpakai", align: "right", cell: (s) => <span className="num">{angka(s.terpakai, 2)}</span> },
            { key: "tercatat", header: "Tercatat", align: "right", cell: (s) => <span className="num">{angka(s.tercatat, 2)}</span> },
            { key: "fisik", header: "Fisik", align: "right", cell: (s) => <span className="num font-semibold">{s.fisik !== null ? angka(s.fisik, s.presisi) : "-"} <span className="font-normal text-muted-foreground">{s.satuan}</span></span> },
            { key: "selisih", header: "Selisih", align: "right", cell: (s) => <span className={cn("num font-bold", s.melewatiToleransi ? "text-bahaya" : s.selisih ? "text-warn" : "text-ok")}>{s.selisih !== null ? bertanda(s.selisih, 2) : "-"}</span> },
          ]}
        />
      </Panel>
      {r.catatanShift && (
        <Panel title="Catatan shift" className="mt-4">
          <p className="text-sm">{r.catatanShift}</p>
        </Panel>
      )}
    </div>
  )
}

function Kotak({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="rounded-xl border bg-card px-3.5 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="num mt-0.5 text-lg font-bold">{nilai}</p>
    </div>
  )
}
