import { toApiError } from "@/lib/api-error"
import { http } from "@/lib/axios"
import type { Pengguna } from "@/types/domain"

export interface LoginInput { username: string; password: string }
export interface LoginResult { accessToken: string; pengguna: Pengguna }

/** Batas tunggu server Render Free yang sedang bangun dari tidur (ERR-02). Dipakai login, health, dan teks banner. */
export const BATAS_TUNGGU_SERVER_MS = 75_000

export const authApi = {
  login: (b: LoginInput) => http.post<LoginResult>("/auth/login", b, { timeout: BATAS_TUNGGU_SERVER_MS }).then((r) => r.data),
  me: () => http.get<Pengguna>("/auth/me").then((r) => r.data),
  logout: () => http.post("/auth/logout").catch(() => undefined),
  health: () => http.get("/health", { timeout: BATAS_TUNGGU_SERVER_MS }).then((r) => r.data),
}

/** Login yang dicoba ulang satu kali bila gagal karena timeout atau jaringan, tidak untuk kata sandi salah */
export async function loginDenganUlang(b: LoginInput): Promise<LoginResult> {
  try {
    return await authApi.login(b)
  } catch (e) {
    if (!toApiError(e).isNetwork) throw e
    return authApi.login(b)
  }
}
