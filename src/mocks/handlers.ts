import { addDays, parseISO, subDays } from "date-fns"
import type { Kanal, NamaShift } from "@/types/domain"
import { type Db, type DbMenu, getDb, nextId, nomorPesanan, simpanDb, tgl } from "./db"
import {
  daftarRekap, pemakaianHarian, perkiraanBesok, pratinjauBuka, rekapHarian, rekapShift, shiftAktif, toBahan, toMenu, toPesanan, toShift,
} from "./logic"
import { bulatkan, selisihBahan, wajibCatatanSelisih } from "@/lib/calc"
import { jawab } from "./chat-brain"
import { scenario } from "./scenario"

export class MockHttpError {
  status: number
  body: unknown
  constructor(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
    this.status = status
    this.body = { status: status >= 500 ? "error" : "fail", code, message, ...extra }
  }
}

export interface Req {
  method: string
  path: string
  params: Record<string, string>
  query: URLSearchParams
  body: any
  token: string | null
}

type Handler = (req: Req, db: Db) => unknown
const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler }[] = []

function route(method: string, path: string, handler: Handler) {
  const keys: string[] = []
  const pattern = new RegExp("^" + path.replace(/:(\w+)/g, (_m, k) => (keys.push(k), "([^/]+)")) + "$")
  routes.push({ method, pattern, keys, handler })
}

export function match(method: string, path: string) {
  for (const r of routes) {
    if (r.method !== method) continue
    const m = path.match(r.pattern)
    if (m) return { handler: r.handler, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) }
  }
  return null
}

export function run(req: Req) {
  const found = match(req.method, req.path)
  if (!found) throw new MockHttpError(404, "NOT_FOUND", `Endpoint ${req.method} ${req.path} tidak ada di mock`)
  const db = getDb()
  const out = found.handler({ ...req, params: found.params }, db)
  simpanDb()
  return out
}

// ---------- utilitas ----------
const bulat = bulatkan

function user(req: Req, db: Db) {
  const id = req.token?.replace("mock.", "")
  const u = db.users.find((x) => x.id === id)
  if (!u) throw new MockHttpError(401, "UNAUTHORIZED", "Sesi berakhir, silakan masuk lagi.")
  return u
}
function pemilik(req: Req, db: Db) {
  const u = user(req, db)
  if (u.peran !== "pemilik") throw new MockHttpError(403, "FORBIDDEN", "Hanya pemilik yang dapat mengakses data ini.")
  return u
}
function butuhShift(db: Db) {
  const s = shiftAktif(db)
  if (!s) throw new MockHttpError(409, "NO_ACTIVE_SHIFT", "Belum ada shift aktif. Buka shift terlebih dahulu.")
  return s
}
function validasi(errors: { field: string; message: string }[]) {
  if (errors.length) throw new MockHttpError(400, "VALIDATION_ERROR", errors[0].message, { errors })
}
function aiGagal() {
  if (scenario() === "ai-down") throw new MockHttpError(503, "AI_UNAVAILABLE", "Layanan AI sedang tidak tersedia.")
}
const kosong = () => scenario() === "empty"

// ---------- auth ----------
route("GET", "/health", () => ({ ok: true }))

route("POST", "/auth/login", (req, db) => {
  const { username, password } = req.body ?? {}
  const u = db.users.find((x) => x.username === String(username ?? "").trim().toLowerCase())
  if (!u || u.password !== password) throw new MockHttpError(401, "INVALID_CREDENTIALS", "Nama pengguna atau kata sandi salah.")
  return { accessToken: `mock.${u.id}`, pengguna: { id: u.id, nama: u.nama, username: u.username, peran: u.peran } }
})
route("GET", "/auth/me", (req, db) => {
  const u = user(req, db)
  return { id: u.id, nama: u.nama, username: u.username, peran: u.peran }
})
route("POST", "/auth/logout", () => null)

// ---------- menu ----------
route("GET", "/menus", (req, db) => {
  user(req, db)
  if (kosong()) return []
  const aktif = req.query.get("aktif")
  return db.menus.filter((m) => (aktif === "true" ? m.aktif : true)).map((m) => toMenu(db, m))
})

function cekMenu(db: Db, body: any, id?: string) {
  const errors: { field: string; message: string }[] = []
  const nama = String(body?.nama ?? "").trim()
  if (!nama) errors.push({ field: "nama", message: "Nama menu wajib diisi." })
  if (db.menus.some((m) => m.id !== id && m.nama.toLowerCase() === nama.toLowerCase()))
    throw new MockHttpError(409, "NAME_TAKEN", "Nama menu sudah dipakai.", { errors: [{ field: "nama", message: "Nama menu sudah dipakai." }] })
  if (!(Number.isInteger(body?.harga?.toko) && body.harga.toko > 0)) errors.push({ field: "harga.toko", message: "Harga toko harus lebih dari 0." })
  if (!Array.isArray(body?.takaran) || body.takaran.length === 0) errors.push({ field: "takaran", message: "Takaran minimal satu bahan." })
  validasi(errors)
  return {
    nama, kategori: body.kategori, harga: { toko: body.harga.toko, shopee_food: body.harga.shopee_food ?? null },
    aktif: body.aktif ?? true, sumberTakaran: body.sumberTakaran ?? "asumsi",
    bisaAturGula: body.bisaAturGula ?? body.kategori !== "lainnya", fotoUrl: body.fotoUrl,
    takaran: body.takaran.map((t: any) => ({ bahanId: t.bahanId, jumlahPerPorsi: Number(t.jumlahPerPorsi) })), 
  } satisfies Omit<DbMenu, "id">
}
route("POST", "/menus", (req, db) => {
  pemilik(req, db)
  const m: DbMenu = { id: nextId(db, "m"), ...cekMenu(db, req.body) }
  db.menus.push(m)
  return toMenu(db, m)
})
route("PUT", "/menus/:id", (req, db) => {
  pemilik(req, db)
  const i = db.menus.findIndex((m) => m.id === req.params.id)
  if (i < 0) throw new MockHttpError(404, "NOT_FOUND", "Menu tidak ditemukan.")
  db.menus[i] = { id: db.menus[i].id, ...cekMenu(db, req.body, db.menus[i].id) }
  return toMenu(db, db.menus[i])
})
route("PATCH", "/menus/:id/status", (req, db) => {
  pemilik(req, db)
  const m = db.menus.find((x) => x.id === req.params.id)
  if (!m) throw new MockHttpError(404, "NOT_FOUND", "Menu tidak ditemukan.")
  m.aktif = !!req.body?.aktif
  return toMenu(db, m)
})

// ---------- bahan & stok ----------
route("GET", "/ingredients", (req, db) => {
  user(req, db)
  if (kosong()) return []
  const status = req.query.get("status")
  return db.bahan.map(toBahan).filter((b) => (status ? b.status === status : true))
})

function cekBahan(body: any, baru: boolean) {
  const errors: { field: string; message: string }[] = []
  if (!String(body?.nama ?? "").trim()) errors.push({ field: "nama", message: "Nama bahan wajib diisi." })
  if (!(Number(body?.stokMinimum) >= 0)) errors.push({ field: "stokMinimum", message: "Stok minimum tidak boleh negatif." })
  if (!(Number(body?.toleransiSelisih) >= 0)) errors.push({ field: "toleransiSelisih", message: "Toleransi tidak boleh negatif." })
  if (baru && !(Number(body?.stokAwal) >= 0)) errors.push({ field: "stokAwal", message: "Stok awal tidak boleh negatif." })
  validasi(errors)
}
route("POST", "/ingredients", (req, db) => {
  pemilik(req, db)
  cekBahan(req.body, true)
  if (db.bahan.some((b) => b.nama.toLowerCase() === String(req.body.nama).trim().toLowerCase()))
    throw new MockHttpError(409, "NAME_TAKEN", "Nama bahan sudah dipakai.", { errors: [{ field: "nama", message: "Nama bahan sudah dipakai." }] })
  const b = {
    id: nextId(db, "b"), nama: String(req.body.nama).trim(), satuan: req.body.satuan, presisi: req.body.presisi ?? 0,
    stokSaatIni: Number(req.body.stokAwal), stokMinimum: Number(req.body.stokMinimum), toleransiSelisih: Number(req.body.toleransiSelisih), aktif: true,
  }
  db.bahan.push(b)
  return toBahan(b)
})
route("PUT", "/ingredients/:id", (req, db) => {
  pemilik(req, db)
  cekBahan(req.body, false)
  const b = db.bahan.find((x) => x.id === req.params.id)
  if (!b) throw new MockHttpError(404, "NOT_FOUND", "Bahan tidak ditemukan.")
  if (db.bahan.some((x) => x.id !== b.id && x.nama.toLowerCase() === String(req.body.nama).trim().toLowerCase()))
    throw new MockHttpError(409, "NAME_TAKEN", "Nama bahan sudah dipakai.", { errors: [{ field: "nama", message: "Nama bahan sudah dipakai." }] })
  Object.assign(b, {
    nama: String(req.body.nama).trim(), satuan: req.body.satuan, presisi: req.body.presisi,
    stokMinimum: Number(req.body.stokMinimum), toleransiSelisih: Number(req.body.toleransiSelisih),
  })
  return toBahan(b)
})
route("PATCH", "/ingredients/:id/status", (req, db) => {
  pemilik(req, db)
  const b = db.bahan.find((x) => x.id === req.params.id)
  if (!b) throw new MockHttpError(404, "NOT_FOUND", "Bahan tidak ditemukan.")
  if (!req.body?.aktif) {
    const dipakai = db.menus.filter((m) => m.aktif && m.takaran.some((t) => t.bahanId === b.id))
    if (dipakai.length)
      throw new MockHttpError(409, "INGREDIENT_IN_USE", `${b.nama} masih dipakai di ${dipakai.length} menu aktif.`, { data: { menu: dipakai.map((m) => m.nama) } })
  }
  b.aktif = !!req.body?.aktif
  return toBahan(b)
})
route("GET", "/ingredients/:id/movements", (req, db) => {
  user(req, db)
  const from = req.query.get("from") ?? tgl(subDays(new Date(), 7))
  return db.mutasi
    .filter((m) => m.bahanId === req.params.id && m.waktu.slice(0, 10) >= from)
    .sort((a, b) => (a.waktu < b.waktu ? 1 : -1))
    .slice(0, 80)
    .map(({ clientRequestId: _c, catatan: _n, ...m }) => m)
})
route("GET", "/stock/risk", (req, db) => {
  user(req, db)
  aiGagal()
  return db.bahan.filter((b) => b.aktif).map((b) => {
    const rasio = b.stokSaatIni / Math.max(b.stokMinimum, 0.0001)
    return { bahanId: b.id, risiko: rasio <= 1.2 ? "kritis" : rasio <= 2 ? "waspada" : "aman", skor: bulat(Math.min(1, 1 / rasio), 2) }
  })
})
route("POST", "/stock-in", (req, db) => {
  const u = user(req, db)
  const s = butuhShift(db)
  const body = req.body ?? {}
  const dup = db.mutasi.filter((m) => m.clientRequestId && m.clientRequestId === body.clientRequestId)
  if (dup.length) throw new MockHttpError(409, "DUPLICATE_REQUEST", "Barang masuk ini sudah tercatat.", { data: dup })
  const items: any[] = Array.isArray(body.items) ? body.items : []
  const errors: { field: string; message: string }[] = []
  if (!items.length) errors.push({ field: "items", message: "Isi minimal satu bahan." })
  items.forEach((it, i) => {
    if (!db.bahan.some((b) => b.id === it.bahanId && b.aktif)) errors.push({ field: `items.${i}.bahanId`, message: "Pilih bahan." })
    if (!(Number(it.jumlah) > 0)) errors.push({ field: `items.${i}.jumlah`, message: "Jumlah harus lebih dari 0." })
  })
  validasi(errors)
  const now = new Date().toISOString()
  return items.map((it) => {
    const b = db.bahan.find((x) => x.id === it.bahanId)!
    b.stokSaatIni = bulat(b.stokSaatIni + Number(it.jumlah), Math.max(b.presisi, 2))
    const m = {
      id: nextId(db, "mv"), bahanId: b.id, jenis: "masuk" as const, jumlah: Number(it.jumlah), shiftId: s.id, waktu: now,
      referensi: { tipe: "barang_masuk" as const, id: s.id, label: it.catatan ? String(it.catatan) : `Dicatat ${u.nama}` },
      clientRequestId: body.clientRequestId,
    }
    db.mutasi.push(m)
    return m
  })
})

// ---------- shift ----------
route("GET", "/shifts/active", (req, db) => {
  user(req, db)
  const s = shiftAktif(db)
  return s ? toShift(db, s) : null
})
route("GET", "/shifts/opening-preview", (req, db) => {
  user(req, db)
  return pratinjauBuka(db)
})
route("POST", "/shifts/open", (req, db) => {
  const u = user(req, db)
  const aktif = shiftAktif(db)
  if (aktif) {
    throw new MockHttpError(409, "SHIFT_STILL_OPEN", `Shift ${aktif.nama} yang dibuka ${db.users.find((x) => x.id === aktif.dibukaOleh)?.nama} belum ditutup.`)
  }
  if (req.body?.konfirmasiStokAwal !== true) validasi([{ field: "konfirmasiStokAwal", message: "Konfirmasi stok awal terlebih dahulu." }])
  const nama = req.body?.nama as NamaShift
  if (!["pagi", "siang", "malam"].includes(nama)) validasi([{ field: "nama", message: "Pilih nama shift." }])
  const pv = pratinjauBuka(db)
  if (db.shifts.some((s) => s.tanggal === pv.tanggal && s.nama === nama))
    throw new MockHttpError(409, "SHIFT_EXISTS", `Shift ${nama} untuk tanggal ini sudah pernah dibuka.`)
  const s = {
    id: nextId(db, "s"), tanggal: pv.tanggal, nama, status: "aktif" as const, dibukaOleh: u.id, dibukaPada: new Date().toISOString(),
    stokAwal: Object.fromEntries(db.bahan.filter((b) => b.aktif).map((b) => [b.id, b.stokSaatIni])),
  }
  db.shifts.push(s)
  return toShift(db, s)
})
function ambilShift(db: Db, id: string) {
  const s = db.shifts.find((x) => x.id === id)
  if (!s) throw new MockHttpError(404, "NOT_FOUND", "Shift tidak ditemukan.")
  return s
}
route("GET", "/shifts/:id/summary", (req, db) => {
  user(req, db)
  return rekapShift(db, ambilShift(db, req.params.id))
})
route("GET", "/shifts/:id/recap", (req, db) => {
  user(req, db)
  return rekapShift(db, ambilShift(db, req.params.id))
})
route("POST", "/shifts/:id/close", (req, db) => {
  const u = user(req, db)
  const s = ambilShift(db, req.params.id)
  if (s.status !== "aktif") throw new MockHttpError(409, "SHIFT_CLOSED", "Shift ini sudah ditutup.")
  const body = req.body ?? {}
  const fisikList: any[] = Array.isArray(body.stokFisik) ? body.stokFisik : []
  const draft = rekapShift(db, s)
  const errors: { field: string; message: string }[] = []
  draft.stok.forEach((row) => {
    // Indeks field mengikuti urutan stokFisik yang dikirim klien, bukan urutan bahan di server
    const idx = fisikList.findIndex((x) => x.bahanId === row.bahanId)
    const f = fisikList[idx]
    const i = idx >= 0 ? idx : fisikList.length
    if (!f || f.jumlah === null || f.jumlah === "" || !(Number(f.jumlah) >= 0))
      errors.push({ field: `stokFisik.${i}.jumlah`, message: `Isi stok fisik ${row.namaBahan}.` })
    else if (wajibCatatanSelisih(Number(f.jumlah), row.tercatat, row.toleransi, row.presisi) && !String(f.catatan ?? "").trim())
      errors.push({ field: `stokFisik.${i}.catatan`, message: `Beri catatan untuk selisih ${row.namaBahan}.` })
  })
  validasi(errors)
  s.stokFisik = {}
  s.catatanBahan = {}
  const now = new Date().toISOString()
  for (const row of draft.stok) {
    const f = fisikList.find((x) => x.bahanId === row.bahanId)
    const fisik = Number(f.jumlah)
    s.stokFisik[row.bahanId] = fisik
    if (f.catatan) s.catatanBahan[row.bahanId] = String(f.catatan)
    const b = db.bahan.find((x) => x.id === row.bahanId)!
    const selisih = selisihBahan(fisik, row.tercatat, b.presisi)
    if (selisih !== 0)
      db.mutasi.push({ id: nextId(db, "mv"), bahanId: b.id, jenis: "penyesuaian", jumlah: selisih, shiftId: s.id, waktu: now, referensi: { tipe: "shift", id: s.id, label: `Tutup shift ${s.nama}` } })
    b.stokSaatIni = fisik
  }
  s.status = "ditutup"
  s.ditutupOleh = u.id
  s.ditutupPada = now
  s.catatanShift = body.catatanShift ? String(body.catatanShift).slice(0, 300) : undefined
  s.durasiTutupDetik = Number(body.durasiTutupDetik) || undefined
  return rekapShift(db, s)
})

// ---------- pesanan ----------
route("POST", "/orders", (req, db) => {
  const u = user(req, db)
  const s = butuhShift(db)
  const body = req.body ?? {}
  const dup = db.orders.find((o) => o.clientRequestId && o.clientRequestId === body.clientRequestId)
  if (dup) throw new MockHttpError(409, "DUPLICATE_REQUEST", "Pesanan ini sudah tersimpan.", { data: toPesanan(db, dup) })
  const kanal = body.kanal as Kanal
  const items: any[] = Array.isArray(body.items) ? body.items : []
  const errors: { field: string; message: string }[] = []
  if (!["toko", "shopee_food"].includes(kanal)) errors.push({ field: "kanal", message: "Pilih kanal penjualan." })
  if (!items.length) errors.push({ field: "items", message: "Keranjang masih kosong." })
  items.forEach((it, i) => {
    const m = db.menus.find((x) => x.id === it.menuId && x.aktif)
    if (!m) errors.push({ field: `items.${i}.menuId`, message: "Menu tidak tersedia." })
    if (!(Number.isInteger(it.jumlah) && it.jumlah >= 1 && it.jumlah <= 99)) errors.push({ field: `items.${i}.jumlah`, message: "Jumlah minimal 1 dan berupa bilangan bulat." })
    if (it.tingkatGula !== undefined) {
      if (!["kurang", "normal", "ekstra"].includes(it.tingkatGula)) {
        errors.push({ field: `items.${i}.tingkatGula`, message: "Tingkat gula harus kurang, normal, atau ekstra." })
      } else if (!m?.bisaAturGula && it.tingkatGula !== "normal") {
        errors.push({ field: `items.${i}.tingkatGula`, message: `Menu ${m?.nama ?? "ini"} tidak mendukung pengaturan tingkat gula.` })
      }
    }
  })
  validasi(errors)

  const butuh: Record<string, number> = {}
  for (const it of items) {
    const m = db.menus.find((x) => x.id === it.menuId)!
    for (const t of m.takaran) butuh[t.bahanId] = (butuh[t.bahanId] ?? 0) + t.jumlahPerPorsi * it.jumlah
  }
  const kurang = Object.entries(butuh).filter(([id, n]) => (db.bahan.find((b) => b.id === id)?.stokSaatIni ?? 0) < n - 1e-9)
  if (kurang.length) {
    const namaKurang = kurang.map(([id]) => db.bahan.find((b) => b.id === id)!.nama)
    const menuTerdampak = items.filter((it) => db.menus.find((m) => m.id === it.menuId)!.takaran.some((t) => kurang.some(([id]) => id === t.bahanId))).map((it) => it.menuId)
    throw new MockHttpError(409, "STOCK_INSUFFICIENT", `Stok ${namaKurang.join(", ")} tidak cukup.`, { data: { bahan: namaKurang, menuIds: menuTerdampak } })
  }
  for (const [id, n] of Object.entries(butuh)) {
    const b = db.bahan.find((x) => x.id === id)!
    b.stokSaatIni = bulat(b.stokSaatIni - n, 2)
  }
  const now = new Date()
  const detail = items.map((it) => {
    const m = db.menus.find((x) => x.id === it.menuId)!
    const harga = kanal === "shopee_food" ? (m.harga.shopee_food ?? m.harga.toko) : m.harga.toko
    return {
      menuId: m.id,
      namaMenu: m.nama,
      jumlah: it.jumlah,
      hargaSatuan: harga,
      subtotal: harga * it.jumlah,
      ...(it.tingkatGula ? { tingkatGula: it.tingkatGula } : {}),
    }
  })
  const order = {
    id: nextId(db, "o"), nomor: nomorPesanan(db, tgl(now)), shiftId: s.id, kanal, items: detail,
    total: detail.reduce((a, d) => a + d.subtotal, 0), dibuatOleh: u.id, dibuatPada: now.toISOString(), clientRequestId: body.clientRequestId,
  }
  db.orders.push(order)
  for (const [bahanId, jumlah] of Object.entries(butuh))
    db.mutasi.push({ id: nextId(db, "mv"), bahanId, jenis: "terpakai", jumlah: bulat(jumlah, 2), shiftId: s.id, waktu: order.dibuatPada, referensi: { tipe: "pesanan", id: order.id, label: order.nomor } })
  return toPesanan(db, order)
})
route("GET", "/orders", (req, db) => {
  const u = user(req, db)
  if (kosong()) return { items: [], page: 1, limit: 20, total: 0 }
  let shiftId = req.query.get("shiftId")
  const tanggal = req.query.get("tanggal")
  if (u.peran === "karyawan") shiftId = shiftAktif(db)?.id ?? "__none__"
  let list = db.orders
  if (shiftId) list = list.filter((o) => o.shiftId === shiftId)
  if (tanggal) {
    const ids = new Set(db.shifts.filter((s) => s.tanggal === tanggal).map((s) => s.id))
    list = list.filter((o) => ids.has(o.shiftId))
  }
  list = [...list].sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1))
  const page = Math.max(1, Number(req.query.get("page") ?? 1))
  const limit = Math.min(100, Math.max(1, Number(req.query.get("limit") ?? 20)))
  const omzetPerKanal = { toko: 0, shopee_food: 0 }
  for (const o of list) omzetPerKanal[o.kanal] += o.total
  return {
    items: list.slice((page - 1) * limit, page * limit).map((o) => toPesanan(db, o)),
    page, limit, total: list.length,
    ringkasan: { jumlahPesanan: list.length, omzet: omzetPerKanal.toko + omzetPerKanal.shopee_food, omzetPerKanal },
  }
})
route("GET", "/orders/:id", (req, db) => {
  user(req, db)
  const o = db.orders.find((x) => x.id === req.params.id)
  if (!o) throw new MockHttpError(404, "NOT_FOUND", "Pesanan tidak ditemukan.")
  return toPesanan(db, o)
})

// ---------- rekap ----------
route("GET", "/recaps/daily", (req, db) => {
  pemilik(req, db)
  if (kosong()) return []
  const to = req.query.get("to") ?? tgl(new Date())
  const from = req.query.get("from") ?? tgl(subDays(parseISO(to), 29))
  return daftarRekap(db, from, to)
})
route("GET", "/recaps/daily/:tanggal", (req, db) => {
  pemilik(req, db)
  const r = kosong() ? null : rekapHarian(db, req.params.tanggal)
  if (!r) throw new MockHttpError(404, "NOT_FOUND", "Belum ada data untuk tanggal ini.")
  return r
})

// ---------- perkiraan (diteruskan backend ke FastAPI) ----------
route("GET", "/forecast", (req, db) => {
  pemilik(req, db)
  aiGagal()
  const untuk = req.query.get("tanggal") ? parseISO(req.query.get("tanggal")!) : addDays(new Date(), 1)
  return {
    untukTanggal: tgl(untuk), versiModel: "ridge-lag7-dow v1.2 (contoh)", dibuatPada: new Date().toISOString(), sumberData: "simulasi",
    items: db.bahan.filter((b) => b.aktif).map((b) => {
      const k = bulat(perkiraanBesok(db, b.id, untuk), b.presisi === 0 ? 0 : 2)
      return {
        bahanId: b.id, namaBahan: b.nama, satuan: b.satuan, presisi: b.presisi, perkiraanKebutuhan: k, stokSaatIni: b.stokSaatIni,
        saranBeli: bulat(Math.max(0, k - b.stokSaatIni), b.presisi === 0 ? 0 : 2),
      }
    }),
  }
})
route("GET", "/forecast/history", (req, db) => {
  pemilik(req, db)
  aiGagal()
  return pemakaianHarian(db, req.query.get("bahanId") ?? "b-teh", Number(req.query.get("hari") ?? 14))
})
route("GET", "/forecast/metrics", (req, db) => {
  pemilik(req, db)
  aiGagal()
  return {
    model: [
      { nama: "Moving average 7 hari", konfigurasi: "Baseline", mae: 41.8, rmse: 55.2, terbaik: false },
      { nama: "Regresi Ridge", konfigurasi: "lag 1, 7 + hari dalam minggu", mae: 29.4, rmse: 38.9, terbaik: true },
      { nama: "Random Forest", konfigurasi: "lag 1, 7 + hari dalam minggu + kanal", mae: 31.1, rmse: 40.6, terbaik: false },
    ],
    dampakFitur: [
      { fitur: "lag", maeTanpa: 38.7, maeDengan: 29.4, rmseTanpa: 50.1, rmseDengan: 38.9 },
      { fitur: "hari_dalam_minggu", maeTanpa: 33.9, maeDengan: 29.4, rmseTanpa: 44.8, rmseDengan: 38.9 },
      { fitur: "kanal", maeTanpa: 29.8, maeDengan: 29.4, rmseTanpa: 39.5, rmseDengan: 38.9 },
    ],
  }
})

// ---------- chat ----------
route("GET", "/chat/history", (req, db) => {
  const u = user(req, db)
  const sesiId = req.query.get("sesiId")
  const limit = Number(req.query.get("limit") ?? 50)
  return db.chats.filter((c) => c.userId === u.id && (!sesiId || c.sesiId === sesiId)).slice(-limit).map(({ userId: _u, ...c }) => c)
})
route("POST", "/chat", (req, db) => {
  const u = user(req, db)
  aiGagal()
  const pesan = String(req.body?.pesan ?? "").trim()
  if (!pesan) validasi([{ field: "pesan", message: "Tulis pertanyaan terlebih dahulu." }])
  if (pesan.length > 500) validasi([{ field: "pesan", message: "Pertanyaan maksimal 500 karakter." }])
  const sesiId = req.body?.sesiId || nextId(db, "sesi")
  const now = new Date()
  db.chats.push({ id: nextId(db, "c"), userId: u.id, sesiId, peran: "pengguna", isi: pesan, waktu: now.toISOString() })
  const j = jawab(db, pesan)
  const balasan = {
    id: nextId(db, "c"), userId: u.id, sesiId, peran: "asisten" as const, waktu: new Date(now.getTime() + 900).toISOString(),
    model: scenario() === "gemini-down" ? ("lokal" as const) : ("gemini" as const), latensiMs: 640 + Math.floor(Math.random() * 600), ...j,
  }
  db.chats.push(balasan)
  const { userId: _u, ...out } = balasan
  return out
})
