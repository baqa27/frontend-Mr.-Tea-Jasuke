import { useEffect, useRef, useState } from "react"
import { subDays } from "date-fns"
import { Calendar, CalendarDays, ChevronDown, ChevronUp, ExternalLink, LayoutDashboard, Loader2, RotateCcw, Smartphone, X } from "lucide-react"
import { EmptyState } from "@/components/feedback/states"
import { PageHeader } from "@/components/shared/PageHeader"
import { SimulasiBanner } from "@/components/shared/SimulasiBanner"
import { Button } from "@/components/ui/button"
import { env } from "@/lib/env"
import { isoTanggal } from "@/lib/format"

const BATAS_MS = 90_000

type Preset = "1h" | "7h" | "30h" | "custom"

interface RentangWaktu {
  from: string
  to: string
}

const GRADASI_HIJAU = [
  { level: 1, warna: "#D1FAE5", label: "Level 1" },
  { level: 2, warna: "#6EE7B7", label: "Level 2" },
  { level: 3, warna: "#38D2A3", label: "Level 3" },
  { level: 4, warna: "#56A73E", label: "Level 4" },
  { level: 5, warna: "#166534", label: "Level 5" },
] as const

function hitungRentang(preset: Preset, custom?: RentangWaktu | null): RentangWaktu {
  const hariIni = new Date()
  hariIni.setHours(0, 0, 0, 0)
  const to = isoTanggal(hariIni)

  if (preset === "custom" && custom) return custom

  let from: Date
  switch (preset) {
    case "1h":
      from = hariIni
      break
    case "7h":
      from = subDays(hariIni, 6)
      break
    case "30h":
      from = subDays(hariIni, 29)
      break
    default:
      from = subDays(hariIni, 6)
  }
  return { from: isoTanggal(from), to }
}

function embedUrl(base: string, from?: string, to?: string) {
  try {
    const u = new URL(base)
    u.searchParams.set("embed", "true")
    if (from) u.searchParams.set("from", from)
    if (to) u.searchParams.set("to", to)
    return u.toString()
  } catch {
    return base
  }
}

/** Dasbor Streamlit tertanam (T6) + filter rentang waktu frontend (DSB-02). */
export default function DashboardPage() {
  const [muat, setMuat] = useState(true)
  const [lama, setLama] = useState(false)
  const [kunci, setKunci] = useState(0)
  const [preset, setPreset] = useState<Preset>("7h")
  const [customRange, setCustomRange] = useState<RentangWaktu | null>(null)
  const [bukaCustom, setBukaCustom] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const rentang = hitungRentang(preset, customRange)
  const src = embedUrl(env.dashboardUrl ?? "", rentang.from, rentang.to)

  useEffect(() => {
    setMuat(true)
    setLama(false)
    timer.current = setTimeout(() => setLama(true), BATAS_MS)
    return () => clearTimeout(timer.current)
  }, [kunci])

  const terapkanCustom = () => {
    if (customRange?.from && customRange?.to) {
      setPreset("custom")
      setBukaCustom(false)
      setKunci((k) => k + 1)
    }
  }

  if (!env.dashboardUrl)
    return (
      <>
        <PageHeader title="Dasbor" />
        <EmptyState icon={LayoutDashboard} title="Alamat dasbor belum diisi">
          Isi variabel VITE_DASHBOARD_URL dengan URL dasbor Streamlit dari tim Data Science, lalu deploy ulang.
        </EmptyState>
      </>
    )

  return (
    <>
      <PageHeader
        title="Dasbor"
        description="Omzet, menu terlaris, dan selisih stok. Filter rentang waktu di bawah akan memuat ulang dasbor."
        actions={
          <Button asChild variant="outline">
            <a href={env.dashboardUrl} target="_blank" rel="noreferrer"><ExternalLink />Buka di tab baru</a>
          </Button>
        }
      />
      {env.dashboardSimulasi && <SimulasiBanner>Dasbor ini menampilkan data simulasi untuk demonstrasi.</SimulasiBanner>}

      {/* Filter Rentang Waktu */}
      <section className="mt-4 rounded-xl border bg-card p-4" aria-labelledby="filter-heading">
        <h2 id="filter-heading" className="sr-only">Filter rentang waktu dasbor</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Preset cepat">
            {[
              { value: "1h" as Preset, label: "1 Hari" },
              { value: "7h" as Preset, label: "7 Hari" },
              { value: "30h" as Preset, label: "30 Hari" },
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={preset === value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPreset(value)
                  setCustomRange(null)
                  setBukaCustom(false)
                  setKunci((k) => k + 1)
                }}
              >
                {label}
              </Button>
            ))}
            <Button
              variant={preset === "custom" || bukaCustom ? "default" : "outline"}
              size="sm"
              onClick={() => setBukaCustom(!bukaCustom)}
            >
              {bukaCustom || preset === "custom" ? (
                <>
                  <ChevronUp className="size-3.5 mr-1.5" aria-hidden /> Custom
                </>
              ) : (
                <>
                  <CalendarDays className="size-3.5 mr-1.5" aria-hidden />
                  <ChevronDown className="size-3.5 ml-1.5" aria-hidden />
                  Custom
                </>
              )}
            </Button>
          </div>

          {bukaCustom && (
            <div className="flex flex-wrap items-center gap-2 border-l pl-3 ml-2" role="group" aria-label="Rentang kustom">
              <label htmlFor="tgl-mulai" className="sr-only">Tanggal mulai</label>
              <input
                id="tgl-mulai"
                type="date"
                max={rentang.to}
                value={customRange?.from ?? rentang.from}
                onChange={(e) => setCustomRange({ ...customRange ?? rentang, from: e.target.value })}
                className="rounded-md border bg-background px-3 py-1.5 text-sm w-[150px]"
              />
              <span className="text-muted-foreground">s/d</span>
              <label htmlFor="tgl-akhir" className="sr-only">Tanggal akhir</label>
              <input
                id="tgl-akhir"
                type="date"
                min={customRange?.from ?? rentang.from}
                max={rentang.to}
                value={customRange?.to ?? rentang.to}
                onChange={(e) => setCustomRange({ ...customRange ?? rentang, to: e.target.value })}
                className="rounded-md border bg-background px-3 py-1.5 text-sm w-[150px]"
              />
              <Button size="sm" onClick={terapkanCustom}>Terapkan</Button>
              <Button variant="ghost" size="sm" onClick={() => { setBukaCustom(false); setCustomRange(null); setPreset("7h"); setKunci((k) => k + 1); }}><X className="size-3.5" aria-hidden /></Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
            <Calendar className="size-3.5 shrink-0" aria-hidden />
            <span>{rentang.from}</span>
            <span className="mx-1">–</span>
            <span>{rentang.to}</span>
          </div>
        </div>

        {/* Legenda Gradasi Hijau */}
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Legenda gradasi intensitas hijau">
          <span className="text-xs text-muted-foreground mr-1">Intensitas:</span>
          {GRADASI_HIJAU.map(({ level, warna, label }) => (
            <span
              key={level}
              className="relative inline-flex h-5 w-10 shrink-0 items-center justify-center rounded border text-[10px] font-medium"
              style={{ backgroundColor: warna, borderColor: warna }}
              title={`${label}: semakin pekat = nilai lebih tinggi`}
            >
              {level}
            </span>
          ))}
        </div>
      </section>

      <p className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground md:hidden">
        <Smartphone className="size-4 shrink-0" aria-hidden />
        Putar ponsel ke posisi mendatar atau buka di tab baru agar grafik lebih lega.
      </p>
      <div className="relative mt-4 overflow-hidden rounded-xl border bg-card">
        <iframe
          key={kunci}
          src={src}
          title="Dasbor analisis Mr. Tea & Jasuke"
          className="block h-[520px] w-full md:h-[560px]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          referrerPolicy="no-referrer"
          onLoad={() => {
            setMuat(false)
            clearTimeout(timer.current)
          }}
        />
        {muat && (
          <div className="absolute inset-0 grid place-items-center bg-card/95 p-6 text-center" role="status">
            <div className="max-w-sm">
              <Loader2 className="mx-auto size-6 animate-spin text-teh" aria-hidden />
              <p className="mt-3 font-semibold">Dasbor sedang dinyalakan, biasanya kurang dari 1 menit.</p>
              {lama && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => setKunci((k) => k + 1)}><RotateCcw />Muat ulang</Button>
                  <Button asChild><a href={env.dashboardUrl} target="_blank" rel="noreferrer"><ExternalLink />Buka di tab baru</a></Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
