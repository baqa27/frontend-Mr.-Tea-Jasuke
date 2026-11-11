import { describe, expect, it } from "vitest"
import {
  hargaKanal, kategoriSelisih, melewatiToleransi, samaIsiPesanan, saranBeli, selisihBahan, selisihStok, statusStok, stokTercatat, totalKeranjang, wajibCatatanSelisih,
} from "@/lib/calc"

const menus = [
  { id: "a", harga: { toko: 3000, shopee_food: 4000 } },
  { id: "b", harga: { toko: 10000, shopee_food: null } },
]

describe("kalkulasi PoS", () => {
  it("memakai harga kanal dan jatuh ke harga toko bila Shopee kosong", () => {
    expect(hargaKanal(menus[0], "shopee_food")).toBe(4000)
    expect(hargaKanal(menus[1], "shopee_food")).toBe(10000)
  })
  it("menghitung total keranjang dan mengabaikan jumlah tidak valid", () => {
    expect(totalKeranjang([{ menuId: "a", jumlah: 2 }, { menuId: "b", jumlah: 1 }], menus, "toko")).toBe(16000)
    expect(totalKeranjang([{ menuId: "a", jumlah: 2 }], menus, "shopee_food")).toBe(8000)
    expect(totalKeranjang([{ menuId: "a", jumlah: Number.NaN }, { menuId: "a", jumlah: -1 }], menus, "toko")).toBe(0)
  })
})

describe("kalkulasi stok", () => {
  it("status di batas minimum dianggap hampir habis", () => {
    expect(statusStok(0, 10)).toBe("habis")
    expect(statusStok(10, 10)).toBe("hampir_habis")
    expect(statusStok(10.01, 10)).toBe("aman")
  })
  it("tercatat dan selisih sesuai persamaan PRD", () => {
    const tercatat = stokTercatat(1000, 500, 320)
    expect(tercatat).toBe(1180)
    expect(selisihStok(1150, tercatat)).toBe(-30)
    expect(selisihStok(2.3, 2.42)).toBe(-0.12)
  })
  it("toleransi memakai nilai mutlak", () => {
    expect(melewatiToleransi(-21, 20)).toBe(true)
    expect(melewatiToleransi(20, 20)).toBe(false)
    expect(kategoriSelisih(null, 5)).toBe("kosong")
    expect(kategoriSelisih(0, 5)).toBe("sesuai")
    expect(kategoriSelisih(3, 5)).toBe("selisih")
    expect(kategoriSelisih(-6, 5)).toBe("lewat")
  })
  it("saran beli tidak pernah negatif", () => {
    expect(saranBeli(300, 120)).toBe(180)
    expect(saranBeli(100, 400)).toBe(0)
  })
})

describe("selisih di batas toleransi (TUT-05, TUT-06)", () => {
  it("membulatkan selisih ke max(presisi, 2) desimal sebelum dibandingkan", () => {
    expect(selisihBahan(4.12, 4.32, 2)).toBe(-0.2)
    expect(selisihBahan(1150, 1180, 0)).toBe(-30)
  })
  it("selisih yang sama persis dengan toleransi tidak wajib catatan", () => {
    expect(wajibCatatanSelisih(4.12, 4.32, 0.2, 2)).toBe(false)
    expect(wajibCatatanSelisih(2.2, 2, 0.2, 2)).toBe(false)
    expect(wajibCatatanSelisih(0.7, 0.9, 0.2, 2)).toBe(false)
  })
  it("selisih di atas toleransi wajib catatan", () => {
    expect(wajibCatatanSelisih(4.11, 4.32, 0.2, 2)).toBe(true)
    expect(wajibCatatanSelisih(1159, 1180, 20, 0)).toBe(true)
  })
})

describe("isi pesanan sama (POS-06)", () => {
  const pesanan = { kanal: "toko" as const, items: [{ menuId: "a", jumlah: 2 }, { menuId: "b", jumlah: 1 }] }
  it("urutan item tidak berpengaruh", () => {
    expect(samaIsiPesanan(pesanan, { kanal: "toko", items: [{ menuId: "b", jumlah: 1 }, { menuId: "a", jumlah: 2 }] })).toBe(true)
  })
  it("beda jumlah, item, atau kanal dianggap beda", () => {
    expect(samaIsiPesanan(pesanan, { kanal: "toko", items: [{ menuId: "a", jumlah: 3 }, { menuId: "b", jumlah: 1 }] })).toBe(false)
    expect(samaIsiPesanan(pesanan, { kanal: "toko", items: [{ menuId: "a", jumlah: 2 }] })).toBe(false)
    expect(samaIsiPesanan(pesanan, { kanal: "shopee_food", items: pesanan.items })).toBe(false)
  })
})
