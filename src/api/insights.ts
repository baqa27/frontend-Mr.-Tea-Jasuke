import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { http } from "@/lib/axios"
import type { DampakFitur, MetrikModel, Perkiraan, PesanChat, RekapHarian, RingkasanRekapHarian, RiwayatPemakaian } from "@/types/domain"
import { qk } from "./query-keys"

export function useRecaps(from: string, to: string) {
  return useQuery({
    queryKey: qk.recaps(from, to),
    queryFn: () => http.get<RingkasanRekapHarian[]>("/recaps/daily", { params: { from, to } }).then((r) => r.data),
  })
}

export function useRecap(tanggal: string | undefined) {
  return useQuery({
    queryKey: qk.recap(tanggal ?? ""),
    queryFn: () => http.get<RekapHarian>(`/recaps/daily/${tanggal}`).then((r) => r.data),
    enabled: !!tanggal,
  })
}

/** Endpoint AI tidak di-retry berulang agar kartu galat cepat tampil (T4) */
export function useForecast() {
  return useQuery({
    queryKey: qk.forecast(),
    queryFn: () => http.get<Perkiraan>("/forecast").then((r) => r.data),
    retry: 1,
    staleTime: 5 * 60_000,
  })
}

export function useForecastHistory(bahanId: string | null) {
  return useQuery({
    queryKey: qk.forecastHistory(bahanId ?? ""),
    queryFn: () => http.get<RiwayatPemakaian[]>("/forecast/history", { params: { bahanId, hari: 14 } }).then((r) => r.data),
    enabled: !!bahanId,
    retry: 1,
  })
}

export function useForecastMetrics() {
  return useQuery({
    queryKey: qk.forecastMetrics,
    queryFn: () => http.get<{ model: MetrikModel[]; dampakFitur: DampakFitur[] }>("/forecast/metrics").then((r) => r.data),
    retry: 1,
    staleTime: 30 * 60_000,
  })
}

export function useChatHistory(sesiId?: string) {
  return useQuery({
    queryKey: qk.chat(sesiId),
    queryFn: () => http.get<PesanChat[]>("/chat/history", { params: { sesiId, limit: 50 } }).then((r) => r.data),
    retry: 1,
  })
}

export function useSendChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (b: { pesan: string; sesiId?: string }) => http.post<PesanChat>("/chat", b, { timeout: 30_000 }).then((r) => r.data),
    onSuccess: (msg) => qc.invalidateQueries({ queryKey: qk.chat(msg.sesiId) }),
  })
}
