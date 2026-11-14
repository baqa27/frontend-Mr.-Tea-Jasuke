import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"

const rupiahFmt = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

/** Rp36.000, tanpa spasi setelah Rp seperti kebiasaan nota di Indonesia */
export function rupiah(n: number): string {
  return rupiahFmt.format(Math.round(n)).replace(/\s/g, "")
}

export function angka(n: number, presisi = 0): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: presisi,
  }).format(n)
}

export function jumlahSatuan(n: number, satuan: string, presisi = 0): string {
  return `${angka(n, presisi)} ${satuan}`
}

/** Selisih bertanda: +20, -150, 0 */
export function bertanda(n: number, presisi = 0): string {
  if (n === 0) return "0"
  return `${n > 0 ? "+" : "−"}${angka(Math.abs(n), presisi)}`
}

const toDate = (v: string | Date) => (typeof v === "string" ? parseISO(v) : v)

/** Kamis, 12 November 2026 */
export const tanggalPanjang = (v: string | Date) => format(toDate(v), "EEEE, d MMMM yyyy", { locale: id })
/** 12 Nov 2026 */
export const tanggalPendek = (v: string | Date) => format(toDate(v), "d MMM yyyy", { locale: id })
/** Kam, 12 Nov */
export const tanggalRingkas = (v: string | Date) => format(toDate(v), "EEE, d MMM", { locale: id })
/** 07.02 */
export const jam = (v: string | Date) => format(toDate(v), "HH.mm")
/** YYYY-MM-DD dari Date lokal */
export const isoTanggal = (d: Date) => format(d, "yyyy-MM-dd")

export const namaShiftLabel: Record<string, string> = { pagi: "Pagi", siang: "Siang", malam: "Malam" }
export const kanalLabel: Record<string, string> = { toko: "Toko", shopee_food: "Shopee Food" }
export const kategoriLabel: Record<string, string> = { teh: "Teh", jasuke: "Jasuke", lainnya: "Paket" }

const POLA_RIBUAN = /^\d{1,3}(\.\d{3})+$/

/**
 * Baca angka ketikan pengguna dengan aturan Indonesia: koma desimal, titik pemisah ribuan.
 * - presisi 0 (harga, pcs, gram): titik hanya sah sebagai ribuan. "15.000" menjadi 15000, "2.5" tidak sah.
 * - presisi > 0 (kg, liter): bila ada koma, koma adalah desimal. Tanpa koma, pola 1.500 atau 1.500.000
 *   dianggap ribuan, sedangkan satu titik dengan jumlah digit selain 3 ("2.5", "0.12") dianggap desimal.
 * Teks kosong atau tidak sah menjadi NaN. Awalan "Rp" diabaikan.
 */
export function parseAngka(v: string, { presisi }: { presisi: number }): number {
  let s = v.trim().replace(/\s/g, "").replace(/^rp/i, "")
  if (!s) return Number.NaN
  const negatif = s.startsWith("-")
  if (negatif) s = s.slice(1)
  if (!/^[\d.,]+$/.test(s) || (s.match(/,/g)?.length ?? 0) > 1) return Number.NaN

  const [bulat, desimal] = s.split(",")
  let intPart: string
  if (!bulat.includes(".")) intPart = bulat
  else if (POLA_RIBUAN.test(bulat)) intPart = bulat.replace(/\./g, "")
  else if (presisi > 0 && desimal === undefined && /^\d*\.\d+$/.test(bulat)) {
    const n = Number(bulat)
    return negatif ? -n : n
  } else return Number.NaN

  if (intPart === "" && desimal === undefined) return Number.NaN
  if (desimal !== undefined && !/^\d+$/.test(desimal)) return Number.NaN
  const n = Number(`${intPart || "0"}${desimal !== undefined ? `.${desimal}` : ""}`)
  return negatif ? -n : n
}

/** Teks pratinjau hasil baca untuk ditampilkan di bawah input angka, misalnya "Terbaca: Rp15.000" */
export function terbaca(teks: string, opts: { presisi: number; satuan?: string; rupiah?: boolean }): string | null {
  if (!teks.trim()) return null
  const n = parseAngka(teks, { presisi: opts.presisi })
  if (!Number.isFinite(n)) return "Angka belum terbaca. Pakai koma untuk desimal, contoh 2,5."
  if (opts.rupiah) return `Terbaca: ${rupiah(n)}`
  return `Terbaca: ${angka(n, Math.max(opts.presisi, 2))}${opts.satuan ? ` ${opts.satuan}` : ""}`
}

export function durasi(detik: number): string {
  const m = Math.floor(detik / 60)
  const d = Math.round(detik % 60)
  return m ? `${m} menit ${d} detik` : `${d} detik`
}
