import { describe, expect, it } from "vitest"
import { fotoMenu } from "../foto-menu"

describe("fotoMenu", () => {
  it("mengutamakan fotoUrl dari mock/backend", () => {
    expect(fotoMenu({ fotoUrl: "https://cdn.example.com/foto.jpg", kategori: "teh" })).toBe("https://cdn.example.com/foto.jpg")
    expect(fotoMenu({ id: "m-teh-ori", fotoUrl: "https://cdn.example.com/foto.jpg", kategori: "teh" })).toBe("https://cdn.example.com/foto.jpg")
  })

  it("memakai path lokal per menuId bila tanpa fotoUrl", () => {
    expect(fotoMenu({ id: "m-jasuke-keju", kategori: "jasuke" })).toBe("/menu/m-jasuke-keju.webp")
    expect(fotoMenu({ id: "m-paket", kategori: "lainnya" })).toBe("/menu/m-paket.webp")
  })

  it("null menuId tanpa fotoUrl agar ilustrasi kategori tampil", () => {
    expect(fotoMenu({ kategori: "teh" })).toBeNull()
    expect(fotoMenu({ kategori: "jasuke" })).toBeNull()
  })
})
