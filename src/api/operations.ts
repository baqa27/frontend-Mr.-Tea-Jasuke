import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toApiError } from "@/lib/api-error"
import { http } from "@/lib/axios"
import type {
  BarangMasukInput, BuatPesananInput, Halaman, Kanal, MutasiStok, NamaShift, Pesanan, PratinjauBukaShift, RekapShift, Shift, TutupShiftInput,
} from "@/types/domain"
import { qk } from "./query-keys"

export function useActiveShift() {
  return useQuery({
    queryKey: qk.shiftActive,
    queryFn: () => http.get<Shift | null>("/shifts/active").then((r) => r.data),
    staleTime: 15_000,
  })
}

export function useOpeningPreview(enabled = true) {
  return useQuery({
    queryKey: qk.shiftPreview,
    queryFn: () => http.get<PratinjauBukaShift>("/shifts/opening-preview").then((r) => r.data),
    enabled,
  })
}

export function useOpenShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (b: { nama: NamaShift; konfirmasiStokAwal: true }) => http.post<Shift>("/shifts/open", b).then((r) => r.data),
    onSuccess: (shift) => {
      qc.setQueryData(qk.shiftActive, shift)
      qc.invalidateQueries({ queryKey: qk.shiftsAll })
      qc.invalidateQueries({ queryKey: qk.ordersAll })
      qc.invalidateQueries({ queryKey: qk.recapsAll })
    },
  })
}

export function useShiftSummary(id: string | undefined) {
  return useQuery({
    queryKey: qk.shiftSummary(id ?? ""),
    queryFn: () => http.get<RekapShift>(`/shifts/${id}/summary`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useShiftRecap(id: string | undefined) {
  return useQuery({
    queryKey: qk.shiftRecap(id ?? ""),
    queryFn: () => http.get<RekapShift>(`/shifts/${id}/recap`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCloseShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TutupShiftInput }) => http.post<RekapShift>(`/shifts/${id}/close`, data).then((r) => r.data),
    onSuccess: (rekap) => {
      qc.setQueryData(qk.shiftActive, null)
      qc.setQueryData(qk.shiftRecap(rekap.shiftId), rekap)
      qc.invalidateQueries({ queryKey: qk.shiftsAll })
      qc.invalidateQueries({ queryKey: qk.ingredients })
      qc.invalidateQueries({ queryKey: qk.menusAll })
      qc.invalidateQueries({ queryKey: qk.recapsAll })
    },
  })
}

export interface DaftarPesanan extends Halaman<Pesanan> {
  ringkasan?: { jumlahPesanan: number; omzet: number; omzetPerKanal: Record<Kanal, number> }
}

export function useOrders(f: { shiftId?: string; tanggal?: string; page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: qk.orders(f),
    queryFn: () => http.get<DaftarPesanan>("/orders", { params: { limit: 20, ...f } }).then((r) => r.data),
    placeholderData: keepPreviousData,
    enabled,
  })
}

function invalidasiSetelahMutasiStok(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: qk.ingredients })
  qc.invalidateQueries({ queryKey: qk.menusAll })
  qc.invalidateQueries({ queryKey: qk.shiftsAll })
  qc.invalidateQueries({ queryKey: qk.risk })
  qc.invalidateQueries({ queryKey: qk.recapsAll })
}

/** DUPLICATE_REQUEST berarti data sudah tersimpan di percobaan sebelumnya, jadi cache tetap harus diperbarui (POS-06, STK-06) */
const sudahTersimpan = (e: unknown) => toApiError(e).code === "DUPLICATE_REQUEST"

export function useCreateOrder() {
  const qc = useQueryClient()
  const segarkan = () => {
    qc.invalidateQueries({ queryKey: qk.ordersAll })
    invalidasiSetelahMutasiStok(qc)
  }
  return useMutation({
    mutationFn: (b: BuatPesananInput) => http.post<Pesanan>("/orders", b).then((r) => r.data),
    onSuccess: segarkan,
    onError: (e) => {
      if (sudahTersimpan(e)) segarkan()
    },
  })
}

export function useStockIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (b: BarangMasukInput) => http.post<MutasiStok[]>("/stock-in", b).then((r) => r.data),
    onSuccess: () => invalidasiSetelahMutasiStok(qc),
    onError: (e) => {
      if (sudahTersimpan(e)) invalidasiSetelahMutasiStok(qc)
    },
  })
}
