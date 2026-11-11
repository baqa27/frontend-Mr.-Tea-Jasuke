import { beforeEach, describe, expect, it } from "vitest"
import { getDb, resetDb } from "@/mocks/db"
import { MockHttpError, run } from "@/mocks/handlers"

const req = (method: string, path: string, body?: unknown, token = "mock.u-rina") => ({ method, path, params: {}, query: new URLSearchParams(), body, token })
const gagal = (fn: () => unknown) => {
  try {
    fn()
  } catch (e) {
    return e as MockHttpError
  }
  throw new Error("seharusnya gagal")
}
const buka = () => {
  const pv = run(req("GET", "/shifts/opening-preview")) as { namaShiftUsulan: string }
  return run(req("POST", "/shifts/open", { nama: pv.namaShiftUsulan, konfirmasiStokAwal: true })) as { id: string }
}

describe("aturan mock meniru backend", () => {
  beforeEach(() => {
    localStorage.clear()
    resetDb()
  })

  it("menolak pesanan tanpa shift aktif", () => {
    const e = gagal(() => run(req("POST", "/orders", { clientRequestId: "x", kanal: "toko", items: [{ menuId: "m-teh-ori", jumlah: 1 }] })))
    expect((e.body as { code: string }).code).toBe("NO_ACTIVE_SHIFT")
  })

  it("menolak membuka shift kedua saat shift masih aktif", () => {
    buka()
    const e = gagal(() => run(req("POST", "/shifts/open", { nama: "malam", konfirmasiStokAwal: true }, "mock.u-dimas")))
    expect((e.body as { code: string }).code).toBe("SHIFT_STILL_OPEN")
  })

  it("pesanan memotong stok sesuai takaran dan menolak duplikat", () => {
    buka()
    const stokTeh = () => (run(req("GET", "/ingredients")) as { id: string; stokSaatIni: number }[]).find((b) => b.id === "b-teh")!.stokSaatIni
    const sebelum = stokTeh()
    run(req("POST", "/orders", { clientRequestId: "r1", kanal: "toko", items: [{ menuId: "m-teh-ori", jumlah: 2 }] }))
    expect(sebelum - stokTeh()).toBe(16)
    const e = gagal(() => run(req("POST", "/orders", { clientRequestId: "r1", kanal: "toko", items: [{ menuId: "m-teh-ori", jumlah: 2 }] })))
    expect((e.body as { code: string }).code).toBe("DUPLICATE_REQUEST")
  })

  it("karyawan tidak bisa membuka rekap harian", () => {
    expect(gagal(() => run(req("GET", "/recaps/daily"))).status).toBe(403)
  })

  it("tutup shift mewajibkan catatan untuk selisih di atas toleransi", () => {
    const s = buka()
    const sum = run(req("GET", `/shifts/${s.id}/summary`)) as { stok: { bahanId: string; tercatat: number; toleransi: number }[] }
    const fisik: { bahanId: string; jumlah: number; catatan?: string }[] = sum.stok.map((r, i) => ({ bahanId: r.bahanId, jumlah: i === 0 ? r.tercatat - r.toleransi - 5 : r.tercatat }))
    const e = gagal(() => run(req("POST", `/shifts/${s.id}/close`, { stokFisik: fisik, durasiTutupDetik: 100 })))
    expect((e.body as { code: string }).code).toBe("VALIDATION_ERROR")
    fisik[0].catatan = "Tumpah"
    const rekap = run(req("POST", `/shifts/${s.id}/close`, { stokFisik: fisik, durasiTutupDetik: 100 })) as { stok: { selisih: number }[] }
    expect(rekap.stok[0].selisih).toBeLessThan(0)
  })

  it("selisih pas di batas toleransi desimal tidak wajib catatan, di atasnya wajib (TUT-05)", () => {
    getDb().bahan.find((b) => b.id === "b-jagung")!.stokSaatIni = 4.32
    const s = buka()
    const sum = run(req("GET", `/shifts/${s.id}/summary`)) as { stok: { bahanId: string; tercatat: number }[] }
    const isi = (jagung: number) => sum.stok.map((r) => ({ bahanId: r.bahanId, jumlah: r.bahanId === "b-jagung" ? jagung : r.tercatat }))
    const e = gagal(() => run(req("POST", `/shifts/${s.id}/close`, { stokFisik: isi(4.11), durasiTutupDetik: 60 })))
    expect((e.body as { errors: { field: string }[] }).errors[0].field).toMatch(/^stokFisik\.\d+\.catatan$/)
    const rekap = run(req("POST", `/shifts/${s.id}/close`, { stokFisik: isi(4.12), durasiTutupDetik: 60 })) as { stok: { bahanId: string; selisih: number; melewatiToleransi: boolean }[] }
    const jagung = rekap.stok.find((r) => r.bahanId === "b-jagung")!
    expect(jagung.selisih).toBe(-0.2)
    expect(jagung.melewatiToleransi).toBe(false)
  })
})
