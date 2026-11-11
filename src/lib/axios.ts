import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import { env } from "@/lib/env"
import { toApiError } from "@/lib/api-error"
import { useAuth } from "@/stores/auth-store"
import { useUi } from "@/stores/ui-store"

const AMBANG_LAMBAT_MS = 5000

type Config = InternalAxiosRequestConfig & { _timer?: ReturnType<typeof setTimeout>; _lambat?: boolean }

/** Satu-satunya instance HTTP di aplikasi (T1). Semua modul api/* memakai ini. */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
})

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

function bersihkanTimer(cfg?: Config) {
  if (!cfg) return
  if (cfg._timer) clearTimeout(cfg._timer)
  if (cfg._lambat) useUi.getState().selesaiLambat()
  cfg._lambat = false
}

http.interceptors.request.use((config: Config) => {
  const token = useAuth.getState().token
  if (token) config.headers.set("Authorization", `Bearer ${token}`)
  config._timer = setTimeout(() => {
    config._lambat = true
    useUi.getState().mulaiLambat()
  }, AMBANG_LAMBAT_MS)
  return config
})

http.interceptors.response.use(
  (res: AxiosResponse) => {
    bersihkanTimer(res.config as Config)
    // Buka envelope { status, message, data }
    const body = res.data
    if (body && typeof body === "object" && "status" in body && "data" in body) res.data = body.data
    return res
  },
  (err) => {
    bersihkanTimer(err.config as Config)
    const apiErr = toApiError(err)
    const isLogin = String(err.config?.url ?? "").includes("/auth/login")
    if (apiErr.status === 401 && !isLogin) onUnauthorized?.()
    return Promise.reject(apiErr)
  },
)

// Perbandingan statis langsung ke import.meta.env agar Vite membuang cabang ini saat VITE_USE_MOCK
// bukan "true". Dengan begitu kode mock dan akun demo tidak ikut ke dist/ produksi.
if (import.meta.env.VITE_USE_MOCK === "true") {
  const { mockAdapter } = await import("@/mocks/adapter")
  http.defaults.adapter = mockAdapter
}
