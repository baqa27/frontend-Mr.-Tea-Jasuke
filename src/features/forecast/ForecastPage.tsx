import { useMemo, useState } from "react"
import { parseISO } from "date-fns"
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useForecast, useForecastHistory, useForecastMetrics } from "@/api/insights"
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary"
import { AiUnavailableCard, ListSkeleton } from "@/components/feedback/states"
import { HelpTooltip, ISTILAH } from "@/components/shared/HelpTooltip"
import { PageHeader, Panel } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { SimulasiBanner } from "@/components/shared/SimulasiBanner"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import { saranBeli } from "@/lib/calc"
import { angka, jam, tanggalPanjang, tanggalRingkas } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Perkiraan } from "@/types/domain"

const labelFitur: Record<string, string> = { lag: "Lag (pemakaian hari sebelumnya)", hari_dalam_minggu: "Hari dalam minggu", kanal: "Kanal penjualan" }

export default function ForecastPage() {
  const { data, isLoading, error, refetch, isFetching } = useForecast()
  return (
    <>
      <PageHeader
        title="Perkiraan belanja"
        description={data ? `Perkiraan kebutuhan bahan untuk ${tanggalPanjang(data.untukTanggal)}` : "Perkiraan kebutuhan bahan untuk besok"}
      />
      {error ? (
        <AiUnavailableCard title="Perkiraan belum bisa dimuat" onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <ListSkeleton rows={6} />
      ) : (
        <div className="grid gap-4">
          {data.sumberData !== "asli" && <SimulasiBanner>Perkiraan ini dilatih memakai data simulasi. Gunakan sebagai gambaran, bukan patokan pasti.</SimulasiBanner>}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-start">
            <TabelPerkiraan data={data} redup={isFetching} />
            <ErrorBoundary><GrafikPemakaian data={data} /></ErrorBoundary>
          </div>
          <ErrorBoundary><EvaluasiModel /></ErrorBoundary>
        </div>
      )}
    </>
  )
}

function TabelPerkiraan({ data, redup }: { data: Perkiraan; redup: boolean }) {
  const rows = useMemo(
    () =>
      data.items
        .map((i) => ({ ...i, saran: i.saranBeli ?? saranBeli(i.perkiraanKebutuhan, i.stokSaatIni) }))
        .sort((a, b) => b.saran / Math.max(1, b.perkiraanKebutuhan) - a.saran / Math.max(1, a.perkiraanKebutuhan) || a.namaBahan.localeCompare(b.namaBahan, "id")),
    [data],
  )
  const perluBeli = rows.filter((r) => r.saran > 0).length
  return (
    <Panel
      title={perluBeli ? `${perluBeli} bahan perlu dibeli` : "Stok cukup untuk besok"}
      action={<span className="text-xs text-muted-foreground">Model {data.versiModel}, {jam(data.dibuatPada)}</span>}
      bodyClassName={cn("p-0", redup && "opacity-70")}
    >
      <ResponsiveTable
        flush
        dense
        caption="Perkiraan kebutuhan bahan"
        rows={rows}
        rowKey={(r) => r.bahanId}
        rowClassName={(r) => (r.saran > 0 ? "bg-jagung-muda/40" : undefined)}
        columns={[
          { key: "nama", header: "Bahan", mobile: "title", cell: (r) => <span className="font-semibold">{r.namaBahan}</span> },
          {
            key: "saran", header: "Saran beli", align: "right", mobile: "aside",
            cell: (r) => (r.saran > 0 ? <span className="num font-bold text-teh">{angka(r.saran, r.presisi)} {r.satuan}</span> : <span className="text-sm text-muted-foreground">Cukup</span>),
          },
          { key: "kebutuhan", header: "Perkiraan pakai", align: "right", cell: (r) => <span className="num">{angka(r.perkiraanKebutuhan, r.presisi)} {r.satuan}</span> },
          { key: "stok", header: "Stok sekarang", align: "right", cell: (r) => <span className="num text-muted-foreground">{angka(r.stokSaatIni, r.presisi)} {r.satuan}</span> },
        ]}
      />
    </Panel>
  )
}

function GrafikPemakaian({ data }: { data: Perkiraan }) {
  const [bahanId, setBahanId] = useState(data.items[0]?.bahanId ?? "")
  const { data: riwayat, isLoading, error, refetch } = useForecastHistory(bahanId)
  const item = data.items.find((i) => i.bahanId === bahanId)
  const series = useMemo(() => {
    if (!riwayat || !item) return []
    const base = riwayat.map((r) => ({ tanggal: r.tanggal, aktual: r.aktual, perkiraan: null as number | null }))
    if (base.length) base[base.length - 1].perkiraan = base[base.length - 1].aktual
    return [...base, { tanggal: data.untukTanggal, aktual: null as unknown as number, perkiraan: item.perkiraanKebutuhan }]
  }, [riwayat, item, data.untukTanggal])

  return (
    <Panel
      title="Pemakaian 14 hari dan perkiraan besok"
      action={
        <div className="flex items-center gap-2">
          <Label htmlFor="grafik-bahan" className="sr-only">Bahan</Label>
          <NativeSelect id="grafik-bahan" size="sm" value={bahanId} onChange={(e) => setBahanId(e.target.value)} className="w-44">
            {data.items.map((i) => <NativeSelectOption key={i.bahanId} value={i.bahanId}>{i.namaBahan}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      }
    >
      {error ? (
        <AiUnavailableCard title="Riwayat pemakaian belum bisa dimuat" onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <figure>
          <div className="h-64" role="img" aria-label={`Grafik pemakaian ${item?.namaBahan} 14 hari terakhir dan perkiraan besok ${angka(item?.perkiraanKebutuhan ?? 0, item?.presisi)} ${item?.satuan}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="tanggal" tickFormatter={(t) => tanggalRingkas(t).split(", ")[1]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval="preserveStartEnd" minTickGap={18} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => angka(v, 1)} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 13 }}
                  labelFormatter={(t) => tanggalRingkas(String(t))}
                  formatter={(v, name) => [`${angka(Number(v), item?.presisi ?? 0)} ${item?.satuan ?? ""}`, name === "aktual" ? "Pemakaian" : "Perkiraan"]}
                />
                <ReferenceLine x={data.untukTanggal} stroke="var(--jagung)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="aktual" stroke="var(--teh)" strokeWidth={2.25} dot={{ r: 2.5, fill: "var(--teh)" }} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="perkiraan" stroke="var(--teh)" strokeWidth={2.25} strokeDasharray="5 4" dot={(p) => (p.payload.tanggal === data.untukTanggal ? <circle key="f" cx={p.cx} cy={p.cy} r={5} fill="var(--jagung)" stroke="var(--teh)" strokeWidth={2} /> : <g key={p.index} />)} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-teh" aria-hidden />Pemakaian sebenarnya</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0 w-5 border-t-2 border-dashed border-teh" aria-hidden />Perkiraan {tanggalRingkas(parseISO(data.untukTanggal))}</span>
          </figcaption>
        </figure>
      )}
    </Panel>
  )
}

function EvaluasiModel() {
  const { data, isLoading, error, refetch } = useForecastMetrics()
  if (error) return <AiUnavailableCard title="Evaluasi model belum bisa dimuat" onRetry={() => refetch()} />
  return (
    <Panel
      title={
        <span className="inline-flex items-center gap-1">
          Evaluasi model
          <HelpTooltip istilah="MAE dan RMSE">{ISTILAH.mae} {ISTILAH.rmse}</HelpTooltip>
        </span>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">Semakin kecil MAE dan RMSE, semakin dekat perkiraan dengan data sebenarnya. Model dibandingkan dengan rata-rata bergerak sebagai pembanding dasar.</p>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-5 2xl:grid-cols-2">
          <ResponsiveTable
            dense
            caption="Perbandingan model"
            rows={data.model}
            rowKey={(m) => m.nama}
            rowClassName={(m) => (m.terbaik ? "bg-ok-muda/50" : undefined)}
            columns={[
              { key: "nama", header: "Model", mobile: "title", cell: (m) => <div><p className="font-semibold">{m.nama}{m.terbaik && <span className="ml-2 rounded-full bg-ok px-2 py-0.5 text-xs font-semibold text-white">Dipakai</span>}</p><p className="text-xs font-normal text-muted-foreground">{m.konfigurasi}</p></div> },
              { key: "mae", header: "MAE", align: "right", cell: (m) => <span className="num font-semibold">{angka(m.mae, 1)}</span> },
              { key: "rmse", header: "RMSE", align: "right", cell: (m) => <span className="num font-semibold">{angka(m.rmse, 1)}</span> },
            ]}
          />
          <ResponsiveTable
            dense
            caption="Dampak fitur"
            rows={data.dampakFitur}
            rowKey={(d) => d.fitur}
            columns={[
              { key: "fitur", header: "Fitur", mobile: "title", cell: (d) => <span className="font-semibold">{labelFitur[d.fitur] ?? d.fitur}</span> },
              { key: "mae", header: "MAE tanpa / dengan", align: "right", cell: (d) => <span className="num">{angka(d.maeTanpa, 1)} / <strong>{angka(d.maeDengan, 1)}</strong></span> },
              { key: "rmse", header: "RMSE tanpa / dengan", align: "right", cell: (d) => <span className="num">{angka(d.rmseTanpa, 1)} / <strong>{angka(d.rmseDengan, 1)}</strong></span> },
              { key: "turun", header: "Perbaikan MAE", align: "right", mobile: "aside", cell: (d) => <span className="num font-bold text-ok">{angka(((d.maeTanpa - d.maeDengan) / d.maeTanpa) * 100, 1)}%</span> },
            ]}
          />
        </div>
      )}
    </Panel>
  )
}
