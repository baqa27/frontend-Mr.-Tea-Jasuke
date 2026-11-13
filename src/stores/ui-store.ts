import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Tema = "terang" | "gelap" | "sistem"

/** Hasil akhir tema: "sistem" mengikuti pengaturan OS. */
export function resolusiTema(tema: Tema, osGelap: boolean): "terang" | "gelap" {
  return tema === "sistem" ? (osGelap ? "gelap" : "terang") : tema
}

const WARNA_META = { terang: "#F6F7F4", gelap: "#1A1D1B" }
const kueriGelap = () => window.matchMedia("(prefers-color-scheme: dark)")

function terapkanTema(tema: Tema) {
  const hasil = resolusiTema(tema, kueriGelap().matches)
  document.documentElement.classList.toggle("dark", hasil === "gelap")
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", WARNA_META[hasil])
}

interface UiState {
  lambat: number
  online: boolean
  tema: Tema
  mulaiLambat: () => void
  selesaiLambat: () => void
  setOnline: (v: boolean) => void
  setTema: (t: Tema) => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      lambat: 0,
      online: typeof navigator === "undefined" ? true : navigator.onLine,
      tema: "sistem",
      mulaiLambat: () => set((s) => ({ lambat: s.lambat + 1 })),
      selesaiLambat: () => set((s) => ({ lambat: Math.max(0, s.lambat - 1) })),
      setOnline: (online) => set({ online }),
      setTema: (tema) => set({ tema }),
    }),
    { name: "ui-store", partialize: (s) => ({ tema: s.tema }) },
  ),
)

// Terapkan ke <html> saat tema berubah dan saat OS berubah (hanya berpengaruh bila "sistem").
if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  terapkanTema(useUi.getState().tema)
  useUi.subscribe((s, prev) => s.tema !== prev.tema && terapkanTema(s.tema))
  kueriGelap().addEventListener("change", () => terapkanTema(useUi.getState().tema))
}
