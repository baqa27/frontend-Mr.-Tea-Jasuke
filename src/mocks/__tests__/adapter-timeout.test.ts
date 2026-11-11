import { afterEach, describe, expect, it, vi } from "vitest"
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios"

vi.mock("@/mocks/scenario", () => ({ scenario: () => "slow", ambilJedaLambat: () => 40_000 }))

const cfg = (timeout: number): InternalAxiosRequestConfig => ({ url: "/health", method: "get", baseURL: "/api/v1", timeout, headers: new AxiosHeaders() })

describe("adapter mock menghormati timeout (ERR-02)", () => {
  afterEach(() => vi.useRealTimers())

  it("menolak dengan ECONNABORTED bila jeda lebih lama dari timeout", async () => {
    vi.useFakeTimers()
    const { mockAdapter } = await import("@/mocks/adapter")
    const p = mockAdapter(cfg(30_000)).catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(30_001)
    const e = await p
    expect(e).toBeInstanceOf(AxiosError)
    expect((e as AxiosError).code).toBe("ECONNABORTED")
  })

  it("berhasil bila timeout lebih panjang dari jeda", async () => {
    vi.useFakeTimers()
    const { mockAdapter } = await import("@/mocks/adapter")
    const p = mockAdapter(cfg(75_000))
    await vi.advanceTimersByTimeAsync(40_001)
    await expect(p).resolves.toMatchObject({ status: 200 })
  })
})
