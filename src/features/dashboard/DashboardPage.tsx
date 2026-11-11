import { useEffect, useRef, useState } from "react"
import { ExternalLink, LayoutDashboard, Loader2, RotateCcw, Smartphone } from "lucide-react"
import { EmptyState } from "@/components/feedback/states"
import { PageHeader } from "@/components/shared/PageHeader"
import { SimulasiBanner } from "@/components/shared/SimulasiBanner"
import { Button } from "@/components/ui/button"
import { env } from "@/lib/env"

const BATAS_MS = 90_000

function embedUrl(base: string) {
  try {
    const u = new URL(base)
    u.searchParams.set("embed", "true")
    return u.toString()
  } catch {
    return base
  }
}

/** Dasbor Streamlit tertanam (T6). Streamlit Free bisa tertidur, jadi ada overlay cold start (DSB-02). */
export default function DashboardPage() {
  const [muat, setMuat] = useState(true)
  const [lama, setLama] = useState(false)
  const [kunci, setKunci] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setMuat(true)
    setLama(false)
    timer.current = setTimeout(() => setLama(true), BATAS_MS)
    return () => clearTimeout(timer.current)
  }, [kunci])

  if (!env.dashboardUrl)
    return (
      <>
        <PageHeader title="Dasbor" />
        <EmptyState icon={LayoutDashboard} title="Alamat dasbor belum diisi">
          Isi variabel VITE_DASHBOARD_URL dengan URL dasbor Streamlit dari tim Data Science, lalu deploy ulang.
        </EmptyState>
      </>
    )

  const src = embedUrl(env.dashboardUrl)
  return (
    <>
      <PageHeader
        title="Dasbor"
        description="Omzet, menu terlaris, dan selisih stok. Filter tanggal dan shift ada di dalam dasbor."
        actions={
          <Button asChild variant="outline">
            <a href={env.dashboardUrl} target="_blank" rel="noreferrer"><ExternalLink />Buka di tab baru</a>
          </Button>
        }
      />
      {env.dashboardSimulasi && <SimulasiBanner>Dasbor ini menampilkan data simulasi untuk demonstrasi.</SimulasiBanner>}
      <p className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground md:hidden">
        <Smartphone className="size-4 shrink-0" aria-hidden />
        Putar ponsel ke posisi mendatar atau buka di tab baru agar grafik lebih lega.
      </p>
      <div className="relative mt-4 overflow-hidden rounded-xl border bg-card">
        <iframe
          key={kunci}
          src={src}
          title="Dasbor analisis Mr. Tea & Jasuke"
          className="block h-[min(calc(100dvh-15rem),900px)] min-h-[520px] w-full"
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
