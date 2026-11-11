import { afterEach, describe, expect, it, vi } from "vitest"
import { authApi, BATAS_TUNGGU_SERVER_MS, loginDenganUlang } from "@/api/auth"
import { ApiError } from "@/lib/api-error"
import { http } from "@/lib/axios"

const ok = { data: { accessToken: "t", pengguna: { id: "u", nama: "U", username: "u", peran: "karyawan" } } }

describe("login saat cold start (ERR-02)", () => {
  afterEach(() => vi.restoreAllMocks())

  it("login dan health memakai batas tunggu 75 detik", async () => {
    expect(BATAS_TUNGGU_SERVER_MS).toBe(75_000)
    const post = vi.spyOn(http, "post").mockResolvedValue(ok)
    await authApi.login({ username: "u", password: "p" })
    expect(post.mock.calls[0][2]).toMatchObject({ timeout: 75_000 })
  })

  it("mencoba ulang satu kali bila timeout atau jaringan", async () => {
    const post = vi
      .spyOn(http, "post")
      .mockRejectedValueOnce(new ApiError({ status: 0, code: "TIMEOUT", message: "lama" }))
      .mockResolvedValueOnce(ok)
    await expect(loginDenganUlang({ username: "u", password: "p" })).resolves.toMatchObject({ accessToken: "t" })
    expect(post).toHaveBeenCalledTimes(2)
  })

  it("tidak mencoba ulang bila kata sandi salah", async () => {
    const post = vi.spyOn(http, "post").mockRejectedValue(new ApiError({ status: 401, code: "INVALID_CREDENTIALS", message: "salah" }))
    await expect(loginDenganUlang({ username: "u", password: "p" })).rejects.toMatchObject({ status: 401 })
    expect(post).toHaveBeenCalledTimes(1)
  })
})
