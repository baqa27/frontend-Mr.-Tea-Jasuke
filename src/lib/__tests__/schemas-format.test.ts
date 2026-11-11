import { describe, expect, it } from "vitest"
import { angka, bertanda, parseAngka, rupiah } from "@/lib/format"
import { chatSchema, jumlahPorsiSchema, menuSchema, sesuaiPresisi, stockInSchema, stokFisikSchema } from "@/schemas"

describe("validasi jumlah pesanan (POS-04)", () => {
  it.each([[Number.NaN], [0], [-1], [1.5], [100]])("menolak %s", (v) => {
    expect(jumlahPorsiSchema.safeParse(v).success).toBe(false)
  })
  it.each([[1], [2], [99]])("menerima %s", (v) => {
    expect(jumlahPorsiSchema.safeParse(v).success).toBe(true)
  })
})

describe("validasi barang masuk dan stok fisik", () => {
  it("menolak jumlah kosong, nol, dan negatif", () => {
    const r = stockInSchema.safeParse({ items: [{ bahanId: "x", jumlah: 0 }, { bahanId: "y", jumlah: -2 }, { bahanId: "z", jumlah: Number.NaN }] })
    expect(r.success).toBe(false)
    const paths = r.error!.issues.map((i) => i.path.join("."))
    expect(paths).toEqual(expect.arrayContaining(["items.0.jumlah", "items.1.jumlah", "items.2.jumlah"]))
  })
  it("menolak bahan ganda dalam satu form", () => {
    const r = stockInSchema.safeParse({ items: [{ bahanId: "x", jumlah: 1 }, { bahanId: "x", jumlah: 5 }] })
    expect(r.error?.issues.map((i) => i.path.join("."))).toContain("items.1.bahanId")
  })
  it("stok fisik nol diterima, negatif ditolak", () => {
    expect(stokFisikSchema.safeParse(0).success).toBe(true)
    expect(stokFisikSchema.safeParse(-1).success).toBe(false)
  })
  it("memeriksa presisi satuan", () => {
    expect(sesuaiPresisi(2.25, 2)).toBe(true)
    expect(sesuaiPresisi(2.255, 2)).toBe(false)
    expect(sesuaiPresisi(3, 0)).toBe(true)
    expect(sesuaiPresisi(3.5, 0)).toBe(false)
  })
})

describe("validasi master menu", () => {
  const dasar = { nama: "Teh", kategori: "teh" as const, hargaToko: 3000, hargaShopee: null, aktif: true, sumberTakaran: "asumsi" as const, takaran: [{ bahanId: "b1", jumlahPerPorsi: 8 }] }
  it("menerima menu valid", () => expect(menuSchema.safeParse(dasar).success).toBe(true))
  it("menolak takaran kosong dan bahan ganda", () => {
    expect(menuSchema.safeParse({ ...dasar, takaran: [] }).success).toBe(false)
    expect(menuSchema.safeParse({ ...dasar, takaran: [{ bahanId: "b1", jumlahPerPorsi: 1 }, { bahanId: "b1", jumlahPerPorsi: 2 }] }).success).toBe(false)
  })
  it("menolak harga desimal atau nol", () => {
    expect(menuSchema.safeParse({ ...dasar, hargaToko: 0 }).success).toBe(false)
    expect(menuSchema.safeParse({ ...dasar, hargaToko: 2500.5 }).success).toBe(false)
  })
})

describe("chat", () => {
  it("menolak pertanyaan kosong dan terlalu panjang", () => {
    expect(chatSchema.safeParse("   ").success).toBe(false)
    expect(chatSchema.safeParse("a".repeat(501)).success).toBe(false)
    expect(chatSchema.safeParse("Cara tutup shift?").success).toBe(true)
  })
})

describe("format", () => {
  it("Rupiah tanpa spasi dan desimal", () => {
    expect(rupiah(36000)).toBe("Rp36.000")
    expect(rupiah(0)).toBe("Rp0")
  })
  it("angka dan tanda selisih", () => {
    expect(angka(1250)).toBe("1.250")
    expect(angka(2.5, 2)).toBe("2,5")
    expect(bertanda(-30)).toBe("−30")
    expect(bertanda(12)).toBe("+12")
  })
  it("membaca angka dari keypad Indonesia", () => {
    expect(parseAngka("2,5", { presisi: 2 })).toBe(2.5)
    expect(parseAngka("2.5", { presisi: 2 })).toBe(2.5)
    expect(parseAngka("1.250,5", { presisi: 2 })).toBe(1250.5)
    expect(parseAngka("", { presisi: 2 })).toBeNaN()
    expect(parseAngka("abc", { presisi: 2 })).toBeNaN()
  })
})

describe("parseAngka format Indonesia (MST-02, MST-05, STK-05, TUT-03)", () => {
  it.each([
    ["15.000", 15000],
    ["1.500.000", 1500000],
    ["15000", 15000],
    ["Rp15.000", 15000],
    ["2,5", 2.5],
    ["0,12", 0.12],
    ["1.250,5", 1250.5],
    ["2.5", Number.NaN],
    ["12.50", Number.NaN],
    ["abc", Number.NaN],
    ["", Number.NaN],
  ])("presisi 0: %s menjadi %s", (teks, hasil) => {
    expect(parseAngka(teks as string, { presisi: 0 })).toBe(hasil)
  })
  it.each([
    ["15.000", 15000],
    ["1.500.000", 1500000],
    ["2,5", 2.5],
    ["2.5", 2.5],
    ["0,12", 0.12],
    ["0.12", 0.12],
    ["1.250,5", 1250.5],
    ["1,2,3", Number.NaN],
    ["abc", Number.NaN],
    ["", Number.NaN],
  ])("presisi 2: %s menjadi %s", (teks, hasil) => {
    expect(parseAngka(teks as string, { presisi: 2 })).toBe(hasil)
  })
})
