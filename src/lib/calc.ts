import type { Bahan, Kanal, Menu, StatusStok } from "@/types/domain"

/** Harga satu porsi menurut kanal. Harga Shopee Food kosong memakai harga toko. */
export function hargaKanal(menu: Pick<Menu, "harga">, kanal: Kanal): number {
  if (kanal === "shopee_food") return menu.harga.shopee_food ?? menu.harga.toko
  return menu.harga.toko
}

export function totalKeranjang(
  items: { menuId: string; jumlah: number }[],
  menus: Pick<Menu, "id" | "harga">[],
  kanal: Kanal,
): number {
  const byId = new Map(menus.map((m) => [m.id, m]))
  return items.reduce((sum, it) => {
    const m = byId.get(it.menuId)
    if (!m || !Number.isFinite(it.jumlah) || it.jumlah <= 0) return sum
    return sum + hargaKanal(m, kanal) * it.jumlah
  }, 0)
}

export function statusStok(stok: number, minimum: number): StatusStok {
  if (stok <= 0) return "habis"
  if (stok <= minimum) return "hampir_habis"
  return "aman"
}

const urutanStatus: Record<StatusStok, number> = { habis: 0, hampir_habis: 1, aman: 2 }
export function urutkanMenurutStatus<T extends Pick<Bahan, "status" | "nama">>(list: T[]): T[] {
  return [...list].sort((a, b) => urutanStatus[a.status] - urutanStatus[b.status] || a.nama.localeCompare(b.nama, "id"))
}

export function bulatkan(n: number, presisi = 0): number {
  const f = 10 ** presisi
  return Math.round(n * f) / f
}

export function stokTercatat(awal: number, masuk: number, terpakai: number): number {
  return awal + masuk - terpakai
}

export function selisihStok(fisik: number, tercatat: number, presisi = 2): number {
  return bulatkan(fisik - tercatat, presisi)
}

/** Jumlah desimal untuk membulatkan selisih: max(presisi bahan, 2). Dipakai klien dan mock agar sama. */
export const presisiSelisih = (presisiBahan: number) => Math.max(presisiBahan, 2)

/** Selisih fisik dikurangi tercatat, dibulatkan agar galat floating point tidak ikut dibandingkan */
export function selisihBahan(fisik: number, tercatat: number, presisiBahan: number): number {
  return selisihStok(fisik, tercatat, presisiSelisih(presisiBahan))
}

/** Hanya selisih yang lebih besar dari toleransi yang melewati. Selisih sama persis dengan toleransi tidak. */
export function melewatiToleransi(selisih: number, toleransi: number): boolean {
  return Math.abs(selisih) > toleransi
}

/** Aturan TUT-05: catatan wajib bila selisih yang sudah dibulatkan melewati toleransi */
export function wajibCatatanSelisih(fisik: number, tercatat: number, toleransi: number, presisiBahan: number): boolean {
  return melewatiToleransi(selisihBahan(fisik, tercatat, presisiBahan), toleransi)
}

/** Dua pesanan dianggap sama bila kanal dan pasangan menu dan jumlahnya sama, tanpa melihat urutan (POS-06) */
export function samaIsiPesanan(
  a: { kanal: Kanal; items: { menuId: string; jumlah: number }[] },
  b: { kanal: Kanal; items: { menuId: string; jumlah: number }[] },
): boolean {
  return kunciIsiPesanan(a) === kunciIsiPesanan(b)
}

export function kunciIsiPesanan(p: { kanal: Kanal; items: { menuId: string; jumlah: number }[] }): string {
  const items = [...p.items].map((i) => `${i.menuId}:${i.jumlah}`).sort()
  return `${p.kanal}|${items.join(",")}`
}

export function saranBeli(kebutuhan: number, stok: number): number {
  return Math.max(0, kebutuhan - stok)
}

/** Status baris selisih untuk badge: sesuai, selisih (dalam toleransi), lewat (melewati toleransi) */
export function kategoriSelisih(selisih: number | null, toleransi: number): "kosong" | "sesuai" | "selisih" | "lewat" {
  if (selisih === null) return "kosong"
  if (selisih === 0) return "sesuai"
  return melewatiToleransi(selisih, toleransi) ? "lewat" : "selisih"
}
