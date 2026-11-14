import { twMerge } from "tailwind-merge"

const TERANG = [
  "kertas", "kartu", "tinta", "abu", "garis", "muted",
  "teh", "teh-tua", "teh-muda", "jagung", "jagung-muda",
  "ok", "ok-muda", "ok-teks", "bahaya", "bahaya-muda",
  "warn", "warn-muda", "info", "info-muda",
  "shopee", "shopee-muda", "kat-teh", "kat-teh-muda",
  "kat-jasuke", "kat-jasuke-muda", "kat-paket", "kat-paket-muda",
] as const

const GELAP: [string, string][] = [
  ["kertas", "#141a17"], ["kartu", "#1c2420"], ["tinta", "#eef1ec"], ["abu", "#a9b3ad"], ["garis", "#2e3833"], ["muted", "#252f2a"],
  ["teh", "#e9a06f"], ["teh-tua", "#f3c3a1"], ["teh-muda", "#3a2418"], ["jagung", "#f2b705"], ["jagung-muda", "#3a3006"],
  ["ok", "#4cc38a"], ["ok-muda", "#123826"], ["ok-teks", "#bdeed3"], ["bahaya", "#ff8a7a"], ["bahaya-muda", "#3d1712"],
  ["warn", "#f0b35a"], ["warn-muda", "#3a2a0c"], ["info", "#8fb3ff"], ["info-muda", "#172645"],
  ["shopee", "#ff9a66"], ["shopee-muda", "#3a1d10"], ["kat-teh", "#e9a06f"], ["kat-teh-muda", "#3a2418"],
  ["kat-jasuke", "#e9c25a"], ["kat-jasuke-muda", "#3a3006"], ["kat-paket", "#8fb7e0"], ["kat-paket-muda", "#172b40"],
]

const SKALA = [
  ["12", "text-xs"], ["14", "text-sm"], ["16", "text-base"],
  ["18", "text-lg"], ["22", "text-[22px]"], ["28", "text-[28px]"],
  ["36", "text-[36px]"], ["44", "text-[44px]"],
] as const

const RADIUS = [
  ["6", "rounded-[6px]"], ["8", "rounded-[8px]"], ["10", "rounded-[10px]"],
  ["12", "rounded-[12px]"], ["16", "rounded-[16px]"],
] as const

function Panel({ label, tokens, dark }: { label: string; tokens: readonly [string, string][]; dark: boolean }) {
  return (
    <div className={dark ? "dark" : undefined}>
      <div className="rounded-xl border p-4" style={{ background: "var(--kertas)", color: "var(--tinta)", borderColor: "var(--garis)" }}>
        <p className="mb-3 text-sm font-bold">{label}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tokens.map(([nama, hex]) => (
            <div key={nama} className="flex items-center gap-2">
              <span className="size-8 shrink-0 rounded border" style={{ background: hex, borderColor: "var(--garis)" }} />
              <span className="min-w-0 truncate text-xs">
                {nama}
                <span className="block text-muted-foreground">{hex}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          {SKALA.map(([px, kelas]) => (
            <p key={px} className={twMerge(kelas, "leading-tight")}>
              Teh tarik gula aren, Rp 12.000 · {px}px
            </p>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          {RADIUS.map(([px, kelas]) => (
            <div key={px} className={`size-12 border-2 bg-teh/10 border-teh ${kelas}`} />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Tombol Utama
          </button>
          <button
            className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground opacity-50 cursor-not-allowed"
            disabled
          >
            Tombol Nonaktif
          </button>
        </div>
      </div>
    </div>
  )
}

export function DevTokens() {
  const terang: [string, string][] = TERANG.map((nama) => {
    const styles = getComputedStyle(document.documentElement)
    const hex = styles.getPropertyValue(`--${nama}`).trim()
    return [nama, hex]
  })
  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <h1 className="text-2xl font-bold">Token Desain (hanya DEV)</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel label="Tema Terang (:root)" tokens={terang} dark={false} />
        <Panel label="Tema Gelap (.dark)" tokens={GELAP} dark />
      </div>
    </div>
  )
}

export default DevTokens
