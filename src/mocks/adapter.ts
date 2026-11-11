import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import { MockHttpError, run } from "./handlers"
import { ambilJedaLambat } from "./scenario"

const tunda = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Adapter Axios untuk mode mock. Dipilih ketimbang service worker agar mock tetap jalan
 * di preview statis mana pun tanpa berkas mockServiceWorker.js.
 */
export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const base = (config.baseURL ?? "").replace(/\/$/, "")
  const url = new URL((config.url ?? "").startsWith("http") ? config.url! : `${base}${config.url}`, "http://mock.local")
  const path = url.pathname.replace(/^\/api\/v1/, "") || "/"
  const query = new URLSearchParams(url.search)
  for (const [k, v] of Object.entries(config.params ?? {})) if (v !== undefined && v !== null && v !== "") query.set(k, String(v))
  const body = typeof config.data === "string" && config.data ? JSON.parse(config.data) : config.data
  const auth = AxiosHeaders.from(config.headers).get("Authorization")
  const token = typeof auth === "string" ? auth.replace(/^Bearer\s+/, "") : null
  const method = (config.method ?? "get").toUpperCase()

  const jeda = ambilJedaLambat() || 180 + Math.random() * 320 + (path.startsWith("/chat") && method === "POST" ? 700 : 0)
  // Hormati config.timeout seperti adapter XHR, supaya ?mock=slow memperlihatkan timeout sungguhan (ERR-02)
  if (config.timeout && jeda > config.timeout) {
    await tunda(config.timeout)
    throw new AxiosError(`timeout of ${config.timeout}ms exceeded`, AxiosError.ECONNABORTED, config, {})
  }
  await tunda(jeda)

  const respon = (status: number, data: unknown): AxiosResponse => ({
    data, status, statusText: String(status), headers: {}, config, request: {},
  })

  try {
    const data = run({ method, path, params: {}, query, body, token })
    return respon(200, { status: "success", message: "OK", data })
  } catch (e) {
    if (e instanceof MockHttpError) {
      const res = respon(e.status, e.body)
      throw new AxiosError(String((e.body as { message?: string }).message), `ERR_${e.status}`, config, {}, res)
    }
    const res = respon(500, { status: "error", code: "INTERNAL_ERROR", message: "Galat di mock: " + String(e) })
    throw new AxiosError("mock error", "ERR_500", config, {}, res)
  }
}
