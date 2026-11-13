/**
 * Skema validasi klien. Aturannya meniru Joi di backend (T4) agar pengguna melihat
 * pesan perbaikan sebelum data dikirim. Server tetap memvalidasi ulang.
 */
import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Isi nama pengguna."),
  password: z.string().min(1, "Isi kata sandi."),
})
export type LoginValues = z.infer<typeof loginSchema>

export const jumlahPorsiSchema = z
  .number({ error: "Jumlah minimal 1 dan berupa bilangan bulat." })
  .int("Jumlah minimal 1 dan berupa bilangan bulat.")
  .min(1, "Jumlah minimal 1 dan berupa bilangan bulat.")
  .max(99, "Jumlah maksimal 99 per menu.")

export const orderSchema = z.object({
  clientRequestId: z.string().min(1),
  kanal: z.enum(["toko", "shopee_food"], { error: "Pilih kanal penjualan." }),
  items: z
    .array(z.object({ menuId: z.string().min(1), jumlah: jumlahPorsiSchema, tingkatGula: z.enum(["kurang", "normal", "ekstra"]).optional().describe("Tingkat gula: Kurang, Normal, atau Ekstra.") }))
    .min(1, "Keranjang masih kosong."),
})

/** Jumlah desimal tidak boleh melebihi presisi satuan bahan */
export function sesuaiPresisi(n: number, presisi: number) {
  if (!Number.isFinite(n)) return false
  const f = 10 ** presisi
  return Math.abs(Math.round(n * f) - n * f) < 1e-6
}

export const stockInSchema = z
  .object({
    items: z
      .array(
        z.object({
          bahanId: z.string().min(1, "Pilih bahan."),
          jumlah: z.number({ error: "Isi jumlah." }).positive("Jumlah harus lebih dari 0."),
          catatan: z.string().max(100, "Catatan maksimal 100 karakter.").optional(),
        }),
      )
      .min(1, "Isi minimal satu bahan."),
  })
  .superRefine((v, ctx) => {
    const seen = new Map<string, number>()
    v.items.forEach((it, i) => {
      if (!it.bahanId) return
      if (seen.has(it.bahanId)) ctx.addIssue({ code: "custom", path: ["items", i, "bahanId"], message: "Bahan ini sudah ada di baris lain." })
      else seen.set(it.bahanId, i)
    })
  })
export type StockInValues = z.infer<typeof stockInSchema>

export const stokFisikSchema = z
  .number({ error: "Isi hasil hitung." })
  .min(0, "Stok fisik tidak boleh negatif.")

export const catatanShiftSchema = z.string().max(300, "Catatan shift maksimal 300 karakter.")

export const menuSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama menu wajib diisi.").max(60, "Nama menu maksimal 60 karakter."),
    kategori: z.enum(["teh", "jasuke", "lainnya"]),
    hargaToko: z.number({ error: "Isi harga toko." }).int("Harga berupa bilangan bulat.").positive("Harga harus lebih dari 0."),
    hargaShopee: z.number().int("Harga berupa bilangan bulat.").positive("Harga harus lebih dari 0.").nullable(),
    aktif: z.boolean(),
    sumberTakaran: z.enum(["pic", "asumsi"]),
    takaran: z
      .array(
        z.object({
          bahanId: z.string().min(1, "Pilih bahan."),
          jumlahPerPorsi: z.number({ error: "Isi jumlah." }).positive("Jumlah harus lebih dari 0."),
        }),
      )
      .min(1, "Takaran minimal satu bahan."),
    bisaAturGula: z.boolean().optional(),
    fotoUrl: z.string().optional().refine((v) => !v || v.startsWith("/img/menu/") || v.startsWith("data:image/") || v.startsWith("https://"), "Foto harus diawali dengan /img/menu/ atau data:image/ atau https://"),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>()
    v.takaran.forEach((t, i) => {
      if (!t.bahanId) return
      if (seen.has(t.bahanId)) ctx.addIssue({ code: "custom", path: ["takaran", i, "bahanId"], message: "Bahan ini sudah ada di takaran." })
      seen.add(t.bahanId)
    })
  })
export type MenuValues = z.infer<typeof menuSchema>

export const bahanSchema = z.object({
  nama: z.string().trim().min(1, "Nama bahan wajib diisi.").max(60, "Nama bahan maksimal 60 karakter."),
  satuan: z.enum(["gram", "kg", "ml", "liter", "pcs"]),
  presisi: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  stokMinimum: z.number({ error: "Isi stok minimum." }).min(0, "Stok minimum tidak boleh negatif."),
  toleransiSelisih: z.number({ error: "Isi toleransi." }).min(0, "Toleransi tidak boleh negatif."),
  stokAwal: z.number({ error: "Isi stok awal." }).min(0, "Stok awal tidak boleh negatif.").optional(),
})
export type BahanValues = z.infer<typeof bahanSchema>

export const chatSchema = z
  .string()
  .refine((s) => s.trim().length > 0, "Tulis pertanyaan terlebih dahulu.")
  .refine((s) => s.length <= 500, "Pertanyaan maksimal 500 karakter.")
