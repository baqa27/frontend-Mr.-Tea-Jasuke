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

  it("memvalidasi tingkat gula pesanan sesuai aturan bisnis", () => {
    buka()
    // Tolak selain tiga nilai
    const e1 = gagal(() => run(req("POST", "/orders", { clientRequestId: "g1", kanal: "toko", items: [{ menuId: "m-teh-ori", jumlah: 1, tingkatGula: "manis_banget" }] })))
    expect((e1.body as { code: string }).code).toBe("VALIDATION_ERROR")
    expect((e1.body as { errors: { field: string }[] }).errors[0].field).toBe("items.0.tingkatGula")

    // Tolak selain normal untuk menu yang bisaAturGula=false (misal m-paket kategori lainnya)
    const e2 = gagal(() => run(req("POST", "/orders", { clientRequestId: "g2", kanal: "toko", items: [{ menuId: "m-paket", jumlah: 1, tingkatGula: "kurang" }] })))
    expect((e2.body as { code: string }).code).toBe("VALIDATION_ERROR")
    expect((e2.body as { errors: { field: string }[] }).errors[0].field).toBe("items.0.tingkatGula")

    // Terima normal untuk menu tanpa bisaAturGula. Stok diisi agar tidak bergantung fixture harian (keju sengaja ditahan).
    for (const b of getDb().bahan) b.stokSaatIni = 1e6
    const resNormal = run(req("POST", "/orders", { clientRequestId: "g3", kanal: "toko", items: [{ menuId: "m-paket", jumlah: 1, tingkatGula: "normal" }] })) as { items: { tingkatGula?: string }[] }
    expect(resNormal.items[0].tingkatGula).toBe("normal")

    // Terima tingkat gula kurang / ekstra untuk menu teh / jasuke dan simpan di ItemPesanan
    const resSukses = run(req("POST", "/orders", { clientRequestId: "g4", kanal: "toko", items: [{ menuId: "m-teh-ori", jumlah: 1, tingkatGula: "kurang" }] })) as { items: { tingkatGula?: string }[] }
    expect(resSukses.items[0].tingkatGula).toBe("kurang")
  })
})
