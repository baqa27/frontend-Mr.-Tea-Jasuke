import { describe, expect, it } from "vitest"
import { tujuanSetelahMasuk } from "@/features/auth/tujuan"

describe("tujuan setelah login (AUTH-03)", () => {
  it("kembali ke halaman asal setelah sesi berakhir", () => {
    expect(tujuanSetelahMasuk("/shift/tutup", "karyawan")).toBe("/shift/tutup")
    expect(tujuanSetelahMasuk("/pemilik/rekap?x=1", "pemilik")).toBe("/pemilik/rekap?x=1")
  })
  it("karyawan tidak diarahkan ke halaman pemilik", () => {
    expect(tujuanSetelahMasuk("/pemilik/rekap", "karyawan")).toBe("/")
  })
  it("menolak redirect ke luar aplikasi atau kembali ke login", () => {
    expect(tujuanSetelahMasuk("//evil.example", "karyawan")).toBe("/")
    expect(tujuanSetelahMasuk("https://evil.example", "pemilik")).toBe("/pemilik/beranda")
    expect(tujuanSetelahMasuk("/login", "karyawan")).toBe("/")
  })
  it("tanpa redirect, pemilik ke beranda dan karyawan ke pengalih shift", () => {
    expect(tujuanSetelahMasuk(null, "pemilik")).toBe("/pemilik/beranda")
    expect(tujuanSetelahMasuk(null, "karyawan")).toBe("/")
  })
})
