import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface DraftTutup {
  mulai: number
  fisik: Record<string, string>
  catatan: Record<string, string>
  catatanShift: string
  langkah: 0 | 1 | 2
}

interface CloseShiftState {
  drafts: Record<string, DraftTutup>
  mulai: (shiftId: string) => void
  ubah: (shiftId: string, patch: Partial<DraftTutup>) => void
  setFisik: (shiftId: string, bahanId: string, v: string) => void
  setCatatan: (shiftId: string, bahanId: string, v: string) => void
  buang: (shiftId: string) => void
}

const kosong = (): DraftTutup => ({ mulai: Date.now(), fisik: {}, catatan: {}, catatanShift: "", langkah: 0 })

/** Isian tutup shift disimpan per shiftId di sessionStorage (TUT-04) */
export const useCloseShiftDraft = create<CloseShiftState>()(
  persist(
    (set) => ({
      drafts: {},
      mulai: (id) => set((s) => (s.drafts[id] ? s : { drafts: { ...s.drafts, [id]: kosong() } })),
      ubah: (id, patch) => set((s) => ({ drafts: { ...s.drafts, [id]: { ...(s.drafts[id] ?? kosong()), ...patch } } })),
      setFisik: (id, bahanId, v) =>
        set((s) => {
          const d = s.drafts[id] ?? kosong()
          return { drafts: { ...s.drafts, [id]: { ...d, fisik: { ...d.fisik, [bahanId]: v } } } }
        }),
      setCatatan: (id, bahanId, v) =>
        set((s) => {
          const d = s.drafts[id] ?? kosong()
          return { drafts: { ...s.drafts, [id]: { ...d, catatan: { ...d.catatan, [bahanId]: v } } } }
        }),
      buang: (id) =>
        set((s) => {
          const { [id]: _hapus, ...rest } = s.drafts
          return { drafts: rest }
        }),
    }),
    { name: "mrtea-tutup-shift", storage: createJSONStorage(() => sessionStorage) },
  ),
)
