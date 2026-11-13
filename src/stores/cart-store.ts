import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { kunciIsiPesanan } from "@/lib/calc"
import { uuid } from "@/lib/uuid"
import type { Kanal, TingkatGula } from "@/types/domain"

export interface CartItem {
  menuId: string
  jumlah: number
  tingkatGula?: TingkatGula
}

interface CartState {
  kanal: Kanal
  items: CartItem[]
  /**
   * ID untuk isi keranjang saat ini (POS-06). Isi yang persis sama selalu memakai ID yang sama,
   * sehingga mengulang simpan setelah timeout tidak membuat pesanan ganda. Isi yang berubah
   * mendapat ID lain, sehingga server tidak membalas DUPLICATE_REQUEST untuk keranjang yang berbeda.
   */
  clientRequestId: string | null
  /** Peta kunci isi keranjang ke ID yang sudah pernah dipakai di keranjang ini */
  idPerIsi: Record<string, string>
  tambah: (menuId: string, tingkatGula?: TingkatGula) => void
  setJumlah: (menuId: string, jumlah: number, tingkatGula?: TingkatGula) => void
  setGula: (menuId: string, gula?: TingkatGula) => void
  hapus: (menuId: string) => void
  setKanal: (k: Kanal) => void
  /** Buang ID untuk isi saat ini, misalnya setelah server bilang ID itu milik pesanan lain */
  idBaru: () => void
  kosongkan: () => void
}

type Isi = Pick<CartState, "kanal" | "items" | "idPerIsi">

function denganId(isi: Isi): Pick<CartState, "items" | "kanal" | "clientRequestId" | "idPerIsi"> {
  if (!isi.items.length) return { ...isi, clientRequestId: null }
  const kunci = kunciIsiPesanan(isi)
  const ada = isi.idPerIsi[kunci]
  if (ada) return { ...isi, clientRequestId: ada }
  const id = uuid()
  return { ...isi, clientRequestId: id, idPerIsi: { ...isi.idPerIsi, [kunci]: id } }
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      kanal: "toko",
      items: [],
      clientRequestId: null,
      idPerIsi: {},
      tambah: (menuId, tingkatGula) =>
        set((s) => {
          const ada = s.items.find((i) => i.menuId === menuId)
          const items = ada
            ? s.items.map((i) => (i.menuId === menuId ? { ...i, jumlah: Math.min(99, (Number.isFinite(i.jumlah) ? i.jumlah : 0) + 1), tingkatGula: tingkatGula ?? i.tingkatGula } : i))
            : [...s.items, { menuId, jumlah: 1, tingkatGula }]
          return denganId({ kanal: s.kanal, items, idPerIsi: s.idPerIsi })
        }),
      setJumlah: (menuId, jumlah, tingkatGula) =>
        set((s) => {
          const ada = s.items.find((i) => i.menuId === menuId)
          const items = ada ? s.items.map((i) => (i.menuId === menuId ? { ...i, jumlah, tingkatGula: tingkatGula ?? i.tingkatGula } : i)) : s.items
          return denganId({ kanal: s.kanal, items, idPerIsi: s.idPerIsi })
        }),
      setGula: (menuId, gula) =>
        set((s) => denganId({ kanal: s.kanal, items: s.items.map((i) => (i.menuId === menuId ? { ...i, tingkatGula: gula } : i)), idPerIsi: s.idPerIsi })),
      hapus: (menuId) => set((s) => denganId({ kanal: s.kanal, items: s.items.filter((i) => i.menuId !== menuId), idPerIsi: s.idPerIsi })),
      setKanal: (kanal) => set((s) => denganId({ kanal, items: s.items, idPerIsi: s.idPerIsi })),
      idBaru: () =>
        set((s) => {
          if (!s.items.length) return s
          const id = uuid()
          return { clientRequestId: id, idPerIsi: { ...s.idPerIsi, [kunciIsiPesanan(s)]: id } }
        }),
      kosongkan: () => set({ items: [], clientRequestId: null, kanal: "toko", idPerIsi: {} }),
    }),
    { name: "mrtea-cart", storage: createJSONStorage(() => sessionStorage) },
  ),
)
