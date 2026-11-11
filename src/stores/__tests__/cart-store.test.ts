import { beforeEach, describe, expect, it } from "vitest"
import { useCart } from "@/stores/cart-store"

const id = () => useCart.getState().clientRequestId

describe("clientRequestId keranjang (POS-06)", () => {
  beforeEach(() => useCart.getState().kosongkan())

  it("dibuat saat item pertama masuk dan tetap sama bila isi tidak berubah", () => {
    useCart.getState().tambah("a")
    const awal = id()
    expect(awal).toBeTruthy()
    useCart.getState().setKanal("toko")
    expect(id()).toBe(awal)
  })

  it("dibuat ulang saat jumlah, item, atau kanal berubah", () => {
    useCart.getState().tambah("a")
    const satu = id()
    useCart.getState().tambah("a")
    const dua = id()
    expect(dua).not.toBe(satu)
    useCart.getState().setKanal("shopee_food")
    const tiga = id()
    expect(tiga).not.toBe(dua)
    useCart.getState().tambah("b")
    expect(id()).not.toBe(tiga)
  })

  it("kembali ke isi yang persis sama memakai ID yang sama agar tidak tercatat ganda", () => {
    useCart.getState().tambah("a")
    const satu = id()
    useCart.getState().tambah("b")
    useCart.getState().hapus("b")
    expect(id()).toBe(satu)
  })

  it("idBaru membuat ID baru untuk isi yang sama", () => {
    useCart.getState().tambah("a")
    const satu = id()
    useCart.getState().idBaru()
    expect(id()).not.toBe(satu)
  })
})
