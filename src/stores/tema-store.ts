import { create } from "zustand"
import { persist } from "zustand/middleware"
import { dengarkanTemaSistem, terapkanTema, type PilihanTema } from "@/lib/tema"

interface TemaState {
  pilihan: PilihanTema
  setPilihan: (pilihan: PilihanTema) => void
}

let hentikanListener = () => {}

function sinkronkanTema(pilihan: PilihanTema) {
  hentikanListener()
  terapkanTema(pilihan)
  hentikanListener = dengarkanTemaSistem(pilihan, () => terapkanTema("sistem"))
}

export const useTema = create<TemaState>()(
  persist(
    (set) => ({
      pilihan: "sistem",
      setPilihan: (pilihan) => set({ pilihan }),
    }),
    {
      name: "mrtea-tema",
      onRehydrateStorage: () => (state) => sinkronkanTema(state?.pilihan ?? "sistem"),
    },
  ),
)

if (typeof window !== "undefined") {
  sinkronkanTema(useTema.getState().pilihan)
  useTema.subscribe((state, previous) => {
    if (state.pilihan !== previous.pilihan) sinkronkanTema(state.pilihan)
  })
}
