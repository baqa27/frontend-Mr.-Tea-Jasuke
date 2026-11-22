import { create } from "zustand"

interface UiState {
  lambat: number
  online: boolean
  mulaiLambat: () => void
  selesaiLambat: () => void
  setOnline: (v: boolean) => void
}

export const useUi = create<UiState>()((set) => ({
  lambat: 0,
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  mulaiLambat: () => set((s) => ({ lambat: s.lambat + 1 })),
  selesaiLambat: () => set((s) => ({ lambat: Math.max(0, s.lambat - 1) })),
  setOnline: (online) => set({ online }),
}))
