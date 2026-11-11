import { AxiosError } from "axios"

export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  status: number
  code: string
  fieldErrors: FieldError[]
  requestId?: string
  data?: unknown

  constructor(opts: { status: number; code: string; message: string; fieldErrors?: FieldError[]; requestId?: string; data?: unknown }) {
    super(opts.message)
    this.name = "ApiError"
    this.status = opts.status
    this.code = opts.code
    this.fieldErrors = opts.fieldErrors ?? []
    this.requestId = opts.requestId
    this.data = opts.data
  }

  get isAiUnavailable() {
    return this.code === "AI_UNAVAILABLE" || [502, 503, 504].includes(this.status)
  }
  get isNetwork() {
    return this.status === 0
  }
}

const pesanUmum: Record<number, string> = {
  0: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.",
  401: "Sesi berakhir, silakan masuk lagi.",
  403: "Akun ini tidak punya akses ke halaman atau aksi tersebut.",
  404: "Data tidak ditemukan.",
  429: "Terlalu banyak permintaan, coba lagi sebentar lagi.",
  500: "Terjadi kesalahan pada server. Coba lagi beberapa saat lagi.",
  502: "Layanan sedang tidak tersedia. Fitur lain tetap bisa dipakai.",
  503: "Layanan sedang tidak tersedia. Fitur lain tetap bisa dipakai.",
  504: "Layanan terlalu lama merespons. Coba lagi.",
}

interface Envelope {
  status?: string
  code?: string
  message?: string
  errors?: FieldError[]
  requestId?: string
  data?: unknown
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 0
    const body = (err.response?.data ?? {}) as Envelope
    const timeout = err.code === "ECONNABORTED" || err.code === "ETIMEDOUT"
    return new ApiError({
      status,
      code: body.code ?? (timeout ? "TIMEOUT" : status === 0 ? "NETWORK_ERROR" : `HTTP_${status}`),
      message: body.message ?? (timeout ? "Server terlalu lama merespons. Coba lagi." : pesanUmum[status] ?? pesanUmum[500]),
      fieldErrors: body.errors,
      requestId: body.requestId,
      data: body.data,
    })
  }
  return new ApiError({ status: 0, code: "UNKNOWN", message: err instanceof Error ? err.message : "Terjadi kesalahan." })
}

/** Pesan untuk toast. 401 ditangani interceptor, jadi tidak perlu ditampilkan di sini. */
export function pesanGalat(err: unknown): string {
  return toApiError(err).message
}
