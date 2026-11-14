import { addDays, parseISO, subDays } from "date-fns"
import { ChevronLeft, ChevronRight, Printer } from "lucide-react"
import { Link, useParams } from "react-router"
import { useRecap } from "@/api/insights"
import { EmptyState, ErrorState, PageSkeleton } from "@/components/feedback/states"
import { Pill } from "@/components/shared/badges"
import { PageHeader, Panel } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { toApiError } from "@/lib/api-error"
import { angka, bertanda, isoTanggal, jam, namaShiftLabel, rupiah, tanggalPanjang } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function RecapDetailPage() {
  const { tanggal = "" } = useParams()
  const { data: r, isLoading, error, refetch } = useRecap(tanggal)
  const tgl = parseISO(tanggal)
  const prev = isoTanggal(subDays(tgl, 1))
  const next = isoTanggal(addDays(tgl, 1))
  const bisaMaju = next <= isoTanggal(new Date())

  const nav = (
    <div className="no-print flex items-center gap-2">
      <Button asChild variant="outline" size="icon" aria-label="Hari sebelumnya"><Link to={`/pemilik/rekap/${prev}`}><ChevronLeft /></Link></Button>
      {bisaMaju ? (
        <Button asChild variant="outline" size="icon" aria-label="Hari berikutnya"><Link to={`/pemilik/rekap/${next}`}><ChevronRight /></Link></Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Hari berikutnya"><ChevronRight /></Button>
      )}
      <Button variant="outline" onClick={() => window.print()} disabled={!r}><Printer />Cetak</Button>
    </div>
  )

  if (error && toApiError(error).status === 404)
    return (
      <>
        <PageHeader title="Rekap harian" description={tanggalPanjang(tanggal)} actions={nav} />
        <EmptyState title="Belum ada data untuk tanggal ini">Tidak ada shift yang dibuka pada {tanggalPanjang(tanggal)}.</EmptyState>
      </>
    )
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isLoading || !r) return <PageSkeleton />

  return (
    <div className="print-full">
      <PageHeader
        title={`Rekap ${tanggalPanjang(r.tanggal)}`}
        description={r.status === "lengkap" ? "Rekap final, semua shift sudah ditutup." : "Sementara, belum semua shift ditutup."}
        actions={nav}
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kotak label="Omzet" nilai={rupiah(r.omzet)} besar />
        <Kotak label="Pesanan" nilai={angka(r.jumlahPesanan)} />
        <Kotak label="Toko" nilai={rupiah(r.omzetPerKanal.toko)} />
        <Kotak label="Shopee Food" nilai={rupiah(r.omzetPerKanal.shopee_food)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Per shift" bodyClassName="p-0">
          <ResponsiveTable
            flush
            dense
            caption="Rekap per shift"
            rows={r.perShift}
            rowKey={(s) => s.shiftId}
            columns={[
              { key: "nama", header: "Shift", mobile: "title", cell: (s) => <Link to={`/shift/${s.shiftId}/rekap`} className="font-semibold text-teh hover:underline">{namaShiftLabel[s.nama]}</Link> },
              { key: "status", header: "Status", mobile: "aside", cell: (s) => (s.status === "ditutup" ? <Pill tone="ok">Ditutup</Pill> : <Pill tone="warn">Berjalan</Pill>) },
              { key: "oleh", header: "Karyawan", cell: (s) => `${s.dibukaOleh}, ${jam(s.dibukaPada)}` },
              { key: "pesanan", header: "Pesanan", align: "right", cell: (s) => <span className="num">{s.jumlahPesanan}</span> },
              { key: "omzet", header: "Omzet", align: "right", cell: (s) => <span className="num font-semibold">{rupiah(s.omzet)}</span> },
            ]}
          />
        </Panel>
        <Panel title="Menu terjual" bodyClassName="p-0">
          <ResponsiveTable
            flush
            dense
            caption="Menu terjual"
            rows={r.menuTerjual}
            rowKey={(m) => m.menuId}
            columns={[
              { key: "nama", header: "Menu", mobile: "title", cell: (m) => m.namaMenu },
              { key: "jumlah", header: "Porsi", align: "right", mobile: "aside", cell: (m) => <span className="num font-semibold">{m.jumlah}</span> },
              { key: "omzet", header: "Omzet", align: "right", cell: (m) => <span className="num">{rupiah(m.omzet)}</span> },
            ]}
          />
        </Panel>
      </div>

      <Panel title="Stok harian" className="mt-4" bodyClassName="p-0">
        <ResponsiveTable
          flush
          dense
          caption="Stok harian per bahan"
          rows={r.stokHarian}
          rowKey={(s) => s.bahanId}
          rowClassName={(s) => (s.melewatiToleransi ? "bg-bahaya-muda/40" : undefined)}
          columns={[
            { key: "nama", header: "Bahan", mobile: "title", cell: (s) => <span className="font-semibold">{s.namaBahan}</span> },
            { key: "selisih", header: "Total selisih", align: "right", mobile: "aside", cell: (s) => <span className={cn("num font-bold", s.melewatiToleransi ? "text-bahaya" : s.totalSelisih ? "text-warn" : "text-ok")}>{bertanda(s.totalSelisih, 2)} {s.satuan}</span> },
            { key: "awal", header: "Awal hari", align: "right", cell: (s) => <span className="num">{angka(s.awalHari, s.presisi)}</span> },
            { key: "masuk", header: "Masuk", align: "right", cell: (s) => <span className="num">{s.masuk ? `+${angka(s.masuk, s.presisi)}` : "0"}</span> },
            { key: "pakai", header: "Terpakai", align: "right", cell: (s) => <span className="num">{angka(s.terpakai, 2)}</span> },
            { key: "akhir", header: "Fisik akhir", align: "right", cell: (s) => <span className="num font-semibold">{s.fisikAkhir !== null ? angka(s.fisikAkhir, s.presisi) : "-"} <span className="font-normal text-muted-foreground">{s.satuan}</span></span> },
          ]}
        />
      </Panel>

      {r.perShift.some((s) => s.catatanShift || s.stok.some((x) => x.catatan)) && (
        <Panel title="Catatan dari shift" className="mt-4">
          <ul className="grid gap-3 text-sm">
            {r.perShift.map((s) => {
              const cat = s.stok.filter((x) => x.catatan)
              if (!s.catatanShift && !cat.length) return null
              return (
                <li key={s.shiftId}>
                  <p className="font-semibold">Shift {namaShiftLabel[s.nama]}</p>
                  {s.catatanShift && <p className="text-muted-foreground">{s.catatanShift}</p>}
                  {cat.map((x) => <p key={x.bahanId} className="text-muted-foreground">{x.namaBahan}: {x.catatan}</p>)}
                </li>
              )
            })}
          </ul>
        </Panel>
      )}
    </div>
  )
}

function Kotak({ label, nilai, besar }: { label: string; nilai: string; besar?: boolean }) {
  return (
    <div className={cn("rounded-xl border bg-card px-4 py-3", besar && "border-teh/30 bg-teh-muda/40")}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("num mt-0.5 font-bold", besar ? "text-2xl" : "text-lg")}>{nilai}</p>
    </div>
  )
}
