export type PilihanTema = "terang" | "gelap" | "sistem"
export type TemaTerurai = Exclude<PilihanTema, "sistem">

const WARNA_META: Record<TemaTerurai, string> = { terang: "#f6f7f4", gelap: "#141a17" }
let hentikanListener: (() => void) | undefined

export function resolusiTema(pilihan: PilihanTema, osGelap: boolean): TemaTerurai {
  return pilihan === "sistem" ? (osGelap ? "gelap" : "terang") : pilihan
}

export function terapkanTema(pilihan: PilihanTema): TemaTerurai | undefined {
  if (typeof window === "undefined" || typeof document === "undefined") return undefined
  const osGelap = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
  const tema = resolusiTema(pilihan, osGelap)
  document.documentElement.classList.toggle("dark", tema === "gelap")
  document.documentElement.style.colorScheme = tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", WARNA_META[tema])
  return tema
}

export function dengarkanTemaSistem(pilihan: PilihanTema, saatBerubah: () => void = () => terapkanTema(pilihan)) {
  hentikanListener?.()
  hentikanListener = undefined
  if (pilihan !== "sistem" || typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {}

  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const listener = () => saatBerubah()
  media.addEventListener("change", listener)
  hentikanListener = () => {
    media.removeEventListener("change", listener)
    hentikanListener = undefined
  }
  return hentikanListener
}
