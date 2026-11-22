import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { http } from "@/lib/axios"
import { flags } from "@/lib/flags"
import type { Bahan, Menu, MutasiStok, RisikoStok, Satuan } from "@/types/domain"
import { qk } from "./query-keys"

export interface MenuInput {
  nama: string
  kategori: Menu["kategori"]
  harga: { toko: number; shopee_food: number | null }
  aktif: boolean
  sumberTakaran: Menu["sumberTakaran"]
  bisaAturGula?: boolean
  fotoUrl?: string
  takaran: { bahanId: string; jumlahPerPorsi: number }[]
}
export interface BahanInput {
  nama: string
  satuan: Satuan
  presisi: 0 | 1 | 2
  stokMinimum: number
  toleransiSelisih: number
  stokAwal?: number
}

export function useMenus(opts: { aktif?: boolean } = {}) {
  return useQuery({
    queryKey: qk.menus(opts.aktif),
    queryFn: () => http.get<Menu[]>("/menus", { params: opts.aktif ? { aktif: true } : {} }).then((r) => r.data),
  })
}

export function useIngredients() {
  return useQuery({
    queryKey: qk.ingredients,
    queryFn: () => http.get<Bahan[]>("/ingredients").then((r) => r.data),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

export function useMovements(bahanId: string | null) {
  return useQuery({
    queryKey: qk.movements(bahanId ?? ""),
    queryFn: () => http.get<MutasiStok[]>(`/ingredients/${bahanId}/movements`).then((r) => r.data),
    enabled: !!bahanId,
  })
}

export function useRisk() {
  return useQuery({
    queryKey: qk.risk,
    queryFn: () => http.get<RisikoStok[]>("/stock/risk").then((r) => r.data),
    enabled: flags.riskModel,
    retry: false,
  })
}

export function useSaveMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: MenuInput }) =>
      (id ? http.put<Menu>(`/menus/${id}`, data) : http.post<Menu>("/menus", data)).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.menusAll }),
  })
}

export function useMenuStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, aktif }: { id: string; aktif: boolean }) => http.patch<Menu>(`/menus/${id}/status`, { aktif }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.menusAll }),
  })
}

export function useSaveBahan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: BahanInput }) =>
      (id ? http.put<Bahan>(`/ingredients/${id}`, data) : http.post<Bahan>("/ingredients", data)).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ingredients })
      qc.invalidateQueries({ queryKey: qk.menusAll })
    },
  })
}

export function useBahanStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, aktif }: { id: string; aktif: boolean }) => http.patch<Bahan>(`/ingredients/${id}/status`, { aktif }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ingredients })
      qc.invalidateQueries({ queryKey: qk.menusAll })
    },
  })
}
