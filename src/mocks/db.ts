/**
 * Basis data tiruan di memori, disimpan ke localStorage agar demo bertahan saat dimuat ulang.
 * Seluruh angka bersifat CONTOH. Ganti fixture dengan dataset bersih dari tim DS (W11) bila sudah tersedia.
 */
import { format, setHours, setMinutes, subDays } from "date-fns"
import type { Kanal, KategoriMenu, NamaShift, Peran, Satuan, TingkatGula } from "@/types/domain"

export interface DbUser { id: string; nama: string; username: string; password: string; peran: Peran }
export interface DbBahan {
  id: string; nama: string; satuan: Satuan; presisi: 0 | 1 | 2
  stokSaatIni: number; stokMinimum: number; toleransiSelisih: number; aktif: boolean
}
export interface DbMenu {
  id: string; nama: string; kategori: KategoriMenu
  harga: { toko: number; shopee_food: number | null }
  aktif: boolean; sumberTakaran: "pic" | "asumsi"
  takaran: { bahanId: string; jumlahPerPorsi: number }[]
  bisaAturGula: boolean; fotoUrl?: string
}
export interface DbOrder {
  id: string; nomor: string; shiftId: string; kanal: Kanal
  items: { menuId: string; namaMenu: string; jumlah: number; hargaSatuan: number; subtotal: number; tingkatGula?: TingkatGula }[]
  total: number; dibuatOleh: string; dibuatPada: string; clientRequestId?: string
}
export interface DbMutasi {
  id: string; bahanId: string; jenis: "masuk" | "terpakai" | "penyesuaian"; jumlah: number
  shiftId: string; waktu: string; referensi?: { tipe: "pesanan" | "shift" | "barang_masuk"; id: string; label: string }
  catatan?: string; clientRequestId?: string
}
export interface DbShift {
  id: string; tanggal: string; nama: NamaShift; status: "aktif" | "ditutup"
  dibukaOleh: string; dibukaPada: string; ditutupOleh?: string; ditutupPada?: string
  stokAwal: Record<string, number>
  stokFisik?: Record<string, number>
  catatanBahan?: Record<string, string>
  catatanShift?: string; durasiTutupDetik?: number
}
export interface DbChat {
  id: string; userId: string; sesiId: string; peran: "pengguna" | "asisten"; isi: string; waktu: string
  intent?: string; sumber?: { judul: string; bagian?: string }[]; model?: "gemini" | "lokal" | "template"
  ditolak?: boolean; latensiMs?: number
}
export interface Db {
  versi: number
  users: DbUser[]
  bahan: DbBahan[]
  menus: DbMenu[]
  orders: DbOrder[]
  mutasi: DbMutasi[]
  shifts: DbShift[]
  chats: DbChat[]
  seq: number
}

const KUNCI = "mrtea-mock-db"
const VERSI = 6

// ---------- RNG deterministik (mulberry32) ----------
function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const BAHAN: DbBahan[] = [
  { id: "b-teh", nama: "Teh bubuk melati", satuan: "gram", presisi: 0, stokSaatIni: 1800, stokMinimum: 300, toleransiSelisih: 20, aktif: true },
  { id: "b-gula", nama: "Gula pasir", satuan: "gram", presisi: 0, stokSaatIni: 7000, stokMinimum: 1500, toleransiSelisih: 100, aktif: true },
  { id: "b-cup16", nama: "Gelas plastik 16 oz", satuan: "pcs", presisi: 0, stokSaatIni: 320, stokMinimum: 60, toleransiSelisih: 2, aktif: true },
  { id: "b-cup22", nama: "Gelas plastik 22 oz", satuan: "pcs", presisi: 0, stokSaatIni: 110, stokMinimum: 40, toleransiSelisih: 2, aktif: true },
  { id: "b-lemon", nama: "Sirup lemon", satuan: "ml", presisi: 0, stokSaatIni: 1500, stokMinimum: 300, toleransiSelisih: 30, aktif: true },
  { id: "b-leci", nama: "Sirup leci", satuan: "ml", presisi: 0, stokSaatIni: 1200, stokMinimum: 300, toleransiSelisih: 30, aktif: true },
  { id: "b-skm", nama: "Susu kental manis", satuan: "ml", presisi: 0, stokSaatIni: 3000, stokMinimum: 600, toleransiSelisih: 50, aktif: true },
  { id: "b-thai", nama: "Bubuk thai tea", satuan: "gram", presisi: 0, stokSaatIni: 600, stokMinimum: 200, toleransiSelisih: 15, aktif: true },
  { id: "b-jagung", nama: "Jagung pipil", satuan: "kg", presisi: 2, stokSaatIni: 9, stokMinimum: 2, toleransiSelisih: 0.2, aktif: true },
  { id: "b-keju", nama: "Keju parut", satuan: "gram", presisi: 0, stokSaatIni: 1600, stokMinimum: 300, toleransiSelisih: 30, aktif: true },
  { id: "b-margarin", nama: "Margarin", satuan: "gram", presisi: 0, stokSaatIni: 1000, stokMinimum: 200, toleransiSelisih: 20, aktif: true },
  { id: "b-cupjasuke", nama: "Cup jasuke 12 oz", satuan: "pcs", presisi: 0, stokSaatIni: 260, stokMinimum: 50, toleransiSelisih: 2, aktif: true },
  { id: "b-meses", nama: "Meses cokelat", satuan: "gram", presisi: 0, stokSaatIni: 600, stokMinimum: 150, toleransiSelisih: 15, aktif: true },
  { id: "b-balado", nama: "Bumbu balado", satuan: "gram", presisi: 0, stokSaatIni: 320, stokMinimum: 80, toleransiSelisih: 10, aktif: true },
]

const JASUKE_DASAR = [
  { bahanId: "b-jagung", jumlahPerPorsi: 0.12 },
  { bahanId: "b-skm", jumlahPerPorsi: 20 },
  { bahanId: "b-margarin", jumlahPerPorsi: 10 },
  { bahanId: "b-cupjasuke", jumlahPerPorsi: 1 },
]

const MENUS_DASAR: Omit<DbMenu, "bisaAturGula" | "fotoUrl">[] = [
  { id: "m-teh-ori", nama: "Teh Original", kategori: "teh", harga: { toko: 3000, shopee_food: 4000 }, aktif: true, sumberTakaran: "pic",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 8 }, { bahanId: "b-gula", jumlahPerPorsi: 20 }, { bahanId: "b-cup16", jumlahPerPorsi: 1 }] },
  { id: "m-teh-jumbo", nama: "Teh Jumbo", kategori: "teh", harga: { toko: 5000, shopee_food: 6500 }, aktif: true, sumberTakaran: "pic",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 12 }, { bahanId: "b-gula", jumlahPerPorsi: 30 }, { bahanId: "b-cup22", jumlahPerPorsi: 1 }] },
  { id: "m-teh-lemon", nama: "Teh Lemon", kategori: "teh", harga: { toko: 5000, shopee_food: 6500 }, aktif: true, sumberTakaran: "pic",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 8 }, { bahanId: "b-gula", jumlahPerPorsi: 15 }, { bahanId: "b-lemon", jumlahPerPorsi: 25 }, { bahanId: "b-cup16", jumlahPerPorsi: 1 }] },
  { id: "m-teh-leci", nama: "Teh Leci", kategori: "teh", harga: { toko: 5000, shopee_food: 6500 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 8 }, { bahanId: "b-gula", jumlahPerPorsi: 15 }, { bahanId: "b-leci", jumlahPerPorsi: 25 }, { bahanId: "b-cup16", jumlahPerPorsi: 1 }] },
  { id: "m-teh-susu", nama: "Teh Susu", kategori: "teh", harga: { toko: 6000, shopee_food: 7500 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 8 }, { bahanId: "b-gula", jumlahPerPorsi: 10 }, { bahanId: "b-skm", jumlahPerPorsi: 30 }, { bahanId: "b-cup16", jumlahPerPorsi: 1 }] },
  { id: "m-thai", nama: "Thai Tea", kategori: "teh", harga: { toko: 8000, shopee_food: 10000 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [{ bahanId: "b-thai", jumlahPerPorsi: 15 }, { bahanId: "b-skm", jumlahPerPorsi: 30 }, { bahanId: "b-gula", jumlahPerPorsi: 10 }, { bahanId: "b-cup16", jumlahPerPorsi: 1 }] },
  { id: "m-teh-lemon-jumbo", nama: "Teh Lemon Jumbo", kategori: "teh", harga: { toko: 7000, shopee_food: 9000 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 12 }, { bahanId: "b-gula", jumlahPerPorsi: 20 }, { bahanId: "b-lemon", jumlahPerPorsi: 35 }, { bahanId: "b-cup22", jumlahPerPorsi: 1 }] },
  { id: "m-jasuke-ori", nama: "Jasuke Original", kategori: "jasuke", harga: { toko: 8000, shopee_food: 10000 }, aktif: true, sumberTakaran: "pic",
    takaran: [...JASUKE_DASAR, { bahanId: "b-keju", jumlahPerPorsi: 15 }] },
  { id: "m-jasuke-keju", nama: "Jasuke Keju Double", kategori: "jasuke", harga: { toko: 11000, shopee_food: 13500 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [...JASUKE_DASAR, { bahanId: "b-keju", jumlahPerPorsi: 35 }] },
  { id: "m-jasuke-coklat", nama: "Jasuke Cokelat Keju", kategori: "jasuke", harga: { toko: 10000, shopee_food: 12500 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [...JASUKE_DASAR, { bahanId: "b-keju", jumlahPerPorsi: 15 }, { bahanId: "b-meses", jumlahPerPorsi: 10 }] },
  { id: "m-jasuke-balado", nama: "Jasuke Balado", kategori: "jasuke", harga: { toko: 9000, shopee_food: 11000 }, aktif: true, sumberTakaran: "asumsi",
    takaran: [{ bahanId: "b-jagung", jumlahPerPorsi: 0.12 }, { bahanId: "b-margarin", jumlahPerPorsi: 10 }, { bahanId: "b-balado", jumlahPerPorsi: 8 }, { bahanId: "b-keju", jumlahPerPorsi: 10 }, { bahanId: "b-cupjasuke", jumlahPerPorsi: 1 }] },
  { id: "m-paket", nama: "Paket Teh + Jasuke", kategori: "lainnya", harga: { toko: 10000, shopee_food: null }, aktif: true, sumberTakaran: "asumsi",
    takaran: [{ bahanId: "b-teh", jumlahPerPorsi: 8 }, { bahanId: "b-gula", jumlahPerPorsi: 20 }, { bahanId: "b-cup16", jumlahPerPorsi: 1 }, ...JASUKE_DASAR, { bahanId: "b-keju", jumlahPerPorsi: 15 }] },
]

/** Foto seed dibuat oleh scripts/buat-foto-menu.mjs. Menu tanpa foto memakai ilustrasi kategori. */
const FOTO: Record<string, string> = {
  "m-teh-ori": "/img/menu/teh.webp",
  "m-teh-susu": "/img/menu/teh.webp",
  "m-teh-lemon": "/img/menu/es-teh.webp",
  "m-teh-leci": "/img/menu/es-teh.webp",
  "m-teh-jumbo": "/img/menu/es-teh.webp",
  "m-thai": "/img/menu/minuman.webp",
  "m-jasuke-ori": "/img/menu/jasuke.webp",
  "m-jasuke-keju": "/img/menu/jasuke.webp",
  "m-jasuke-coklat": "/img/menu/jasuke.webp",
  "m-jasuke-balado": "/img/menu/jasuke.webp",
}

const MENUS: DbMenu[] = MENUS_DASAR.map((m) => ({
  ...m,
  bisaAturGula: m.kategori !== "lainnya",
  ...(FOTO[m.id] ? { fotoUrl: FOTO[m.id] } : {}),
}))

const USERS: DbUser[] = [
  { id: "u-rina", nama: "Rina", username: "rina", password: "demo123", peran: "karyawan" },
  { id: "u-dimas", nama: "Dimas", username: "dimas", password: "demo123", peran: "karyawan" },
  { id: "u-pemilik", nama: "Sari", username: "pemilik", password: "demo123", peran: "pemilik" },
]

const JAM_SHIFT: Record<NamaShift, [number, number]> = { pagi: [7, 13], siang: [13, 18], malam: [18, 22] }
const POLA: Record<NamaShift, number> = { pagi: 9, siang: 15, malam: 13 }
const BOBOT_MENU = [14, 9, 10, 6, 7, 6, 4, 10, 5, 5, 3, 4]

export const pad = (n: number, w = 3) => String(n).padStart(w, "0")
export const tgl = (d: Date) => format(d, "yyyy-MM-dd")

export function nextId(db: Db, prefix: string) {
  db.seq += 1
  return `${prefix}-${db.seq.toString(36)}`
}

export function nomorPesanan(db: Db, tanggal: string) {
  const jumlahHariIni = db.orders.filter((o) => o.dibuatPada.slice(0, 10) === tanggal).length
  return `MT-${tanggal.slice(2).replaceAll("-", "")}-${pad(jumlahHariIni + 1)}`
}

function pilihBerbobot(r: () => number, bobot: number[]) {
  const total = bobot.reduce((a, b) => a + b, 0)
  let x = r() * total
  for (let i = 0; i < bobot.length; i++) {
    x -= bobot[i]
    if (x <= 0) return i
  }
  return bobot.length - 1
}

const bulat = (n: number, p: number) => Math.round(n * 10 ** p) / 10 ** p

function seed(): Db {
  const r = rng(20261120)
  const db: Db = {
    versi: VERSI,
    users: structuredClone(USERS),
    bahan: structuredClone(BAHAN),
    menus: structuredClone(MENUS),
    orders: [], mutasi: [], shifts: [], chats: [], seq: 100,
  }
  const restock: Record<string, number> = Object.fromEntries(BAHAN.map((b) => [b.id, b.stokSaatIni]))
  const karyawan = ["u-rina", "u-dimas"]
  const hariIni = new Date()
  const HARI = 21

  for (let h = HARI; h >= 0; h--) {
    const hari = subDays(hariIni, h)
    const tanggal = tgl(hari)
    const akhirPekan = [0, 6].includes(hari.getDay())
    // Hari ini: shift pagi sudah selesai hanya bila jam sekarang lewat 13.00, agar tidak ada waktu di masa depan
    const daftarShift: NamaShift[] = h === 0 ? (hariIni.getHours() >= 13 ? ["pagi"] : []) : ["pagi", "siang", "malam"]

    for (const nama of daftarShift) {
      const [mulai, selesai] = JAM_SHIFT[nama]
      const pembuka = karyawan[(h + daftarShift.indexOf(nama)) % 2]
      const dibuka = setMinutes(setHours(hari, mulai), Math.floor(r() * 8))
      const shift: DbShift = {
        id: nextId(db, "s"), tanggal, nama, status: "aktif", dibukaOleh: pembuka,
        dibukaPada: dibuka.toISOString(),
        stokAwal: Object.fromEntries(db.bahan.map((b) => [b.id, b.stokSaatIni])),
      }
      db.shifts.push(shift)

      // Barang masuk di awal shift pagi bila stok menipis
      if (nama === "pagi") {
        for (const b of db.bahan) {
          // Dua hari terakhir sebagian bahan sengaja tidak dibeli agar demo menampilkan stok menipis
          const tahan: Record<string, number> = { "b-leci": 6, "b-thai": 4, "b-cup22": 5, "b-keju": 2 }
          if (h <= (tahan[b.id] ?? -1)) continue
          if (b.stokSaatIni < b.stokMinimum * 2.2) {
            const jumlah = bulat(restock[b.id] - b.stokSaatIni, b.presisi)
            b.stokSaatIni = bulat(b.stokSaatIni + jumlah, b.presisi)
            db.mutasi.push({
              id: nextId(db, "mv"), bahanId: b.id, jenis: "masuk", jumlah, shiftId: shift.id,
              waktu: new Date(dibuka.getTime() + 5 * 60_000).toISOString(),
              referensi: { tipe: "barang_masuk", id: shift.id, label: "Belanja pagi" },
            })
          }
        }
      }

      // Pesanan
      const n = Math.round(POLA[nama] * (akhirPekan ? 1.3 : 1) * (0.75 + r() * 0.5))
      for (let i = 0; i < n; i++) {
        const menitKe = Math.floor(((selesai - mulai) * 60 - 15) * ((i + r() * 0.8) / n)) + 10
        const waktu = new Date(dibuka.getTime() + menitKe * 60_000)
        const kanal: Kanal = r() < 0.72 ? "toko" : "shopee_food"
        const jumlahJenis = r() < 0.75 ? 1 : 2
        const items: DbOrder["items"] = []
        for (let j = 0; j < jumlahJenis; j++) {
          const m = db.menus[pilihBerbobot(r, BOBOT_MENU)]
          if (kanal === "shopee_food" && m.harga.shopee_food === null) continue
          if (items.some((x) => x.menuId === m.id)) continue
          const jumlah = r() < 0.7 ? 1 : r() < 0.8 ? 2 : 3
          const harga = kanal === "shopee_food" ? (m.harga.shopee_food ?? m.harga.toko) : m.harga.toko
          // Lewati item bila stok tidak cukup, meniru penolakan di kasir
          const cukup = m.takaran.every((t) => (db.bahan.find((b) => b.id === t.bahanId)?.stokSaatIni ?? 0) >= t.jumlahPerPorsi * jumlah)
          if (!cukup) continue
          for (const t of m.takaran) {
            const b = db.bahan.find((x) => x.id === t.bahanId)!
            b.stokSaatIni = bulat(b.stokSaatIni - t.jumlahPerPorsi * jumlah, 2)
          }
          items.push({ menuId: m.id, namaMenu: m.nama, jumlah, hargaSatuan: harga, subtotal: harga * jumlah })
        }
        if (!items.length) continue
        const order: DbOrder = {
          id: nextId(db, "o"), nomor: "", shiftId: shift.id, kanal, items,
          total: items.reduce((a, b) => a + b.subtotal, 0),
          dibuatOleh: pembuka, dibuatPada: waktu.toISOString(),
        }
        order.nomor = nomorPesanan(db, tanggal)
        db.orders.push(order)
        const pakai: Record<string, number> = {}
        for (const it of items) {
          const m = db.menus.find((x) => x.id === it.menuId)!
          for (const t of m.takaran) pakai[t.bahanId] = (pakai[t.bahanId] ?? 0) + t.jumlahPerPorsi * it.jumlah
        }
        for (const [bahanId, jumlah] of Object.entries(pakai)) {
          db.mutasi.push({
            id: nextId(db, "mv"), bahanId, jenis: "terpakai", jumlah: bulat(jumlah, 2), shiftId: shift.id,
            waktu: order.dibuatPada, referensi: { tipe: "pesanan", id: order.id, label: order.nomor },
          })
        }
      }

      // Tutup shift: stok fisik dengan sedikit selisih acak
      const fisik: Record<string, number> = {}
      const catatanBahan: Record<string, string> = {}
      for (const b of db.bahan) {
        let s = b.stokSaatIni
        const acak = r()
        if (acak < 0.12) s = s - b.toleransiSelisih * (1 + r() * 2)
        else if (acak < 0.3) s = s + (r() - 0.5) * b.toleransiSelisih
        s = Math.max(0, bulat(s, b.presisi))
        fisik[b.id] = s
        const selisih = bulat(s - b.stokSaatIni, b.presisi)
        if (Math.abs(selisih) > b.toleransiSelisih) catatanBahan[b.id] = "Tumpah saat isi ulang wadah"
        if (selisih !== 0) {
          db.mutasi.push({
            id: nextId(db, "mv"), bahanId: b.id, jenis: "penyesuaian", jumlah: selisih, shiftId: shift.id,
            waktu: setMinutes(setHours(hari, selesai), 0).toISOString(),
            referensi: { tipe: "shift", id: shift.id, label: `Tutup shift ${nama}` },
          })
        }
        b.stokSaatIni = s
      }
      shift.status = "ditutup"
      shift.stokFisik = fisik
      shift.catatanBahan = catatanBahan
      shift.ditutupOleh = pembuka
      shift.ditutupPada = setMinutes(setHours(hari, selesai), Math.floor(r() * 10)).toISOString()
      shift.durasiTutupDetik = 180 + Math.floor(r() * 240)
      if (r() < 0.2) shift.catatanShift = "Antrean ramai menjelang akhir shift."
    }
  }
  return db
}

let cache: Db | null = null

export function getDb(): Db {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KUNCI)
    if (raw) {
      const parsed = JSON.parse(raw) as Db
      if (parsed.versi === VERSI) {
        cache = parsed
        return cache
      }
    }
  } catch {
    // localStorage tidak tersedia, pakai data baru
  }
  cache = seed()
  simpanDb()
  return cache
}

export function simpanDb() {
  if (!cache) return
  try {
    localStorage.setItem(KUNCI, JSON.stringify(cache))
  } catch {
    // abaikan: kuota penuh atau mode privat
  }
}

export function resetDb() {
  try {
    localStorage.removeItem(KUNCI)
  } catch {
    // abaikan
  }
  cache = null
  return getDb()
}
