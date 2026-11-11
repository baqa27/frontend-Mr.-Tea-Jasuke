/** Aturan bisnis tiruan. Meniru perilaku yang diharapkan dari backend Express, bukan pengganti. */
import { addDays, parseISO, subDays } from "date-fns"
import { bulatkan, melewatiToleransi, presisiSelisih, selisihBahan, statusStok, stokTercatat } from "@/lib/calc"
import type {
  Bahan, Kanal, Menu, Pesanan, PratinjauBukaShift, RekapHarian, RekapShift, RingkasanRekapHarian, Shift, NamaShift,
} from "@/types/domain"
import { type Db, type DbBahan, type DbMenu, type DbOrder, type DbShift, tgl } from "./db"

const bulat = bulatkan
const URUTAN: NamaShift[] = ["pagi", "siang", "malam"]

export function toBahan(b: DbBahan): Bahan {
  return { ...b, status: statusStok(b.stokSaatIni, b.stokMinimum) }
}

export function toMenu(db: Db, m: DbMenu): Menu {
  const takaran = m.takaran.map((t) => {
    const b = db.bahan.find((x) => x.id === t.bahanId)
    return { bahanId: t.bahanId, namaBahan: b?.nama ?? "(bahan dihapus)", satuan: b?.satuan ?? "", jumlahPerPorsi: t.jumlahPerPorsi }
  })
  const tersedia = m.takaran.every((t) => {
    const b = db.bahan.find((x) => x.id === t.bahanId)
    return !!b && b.aktif && b.stokSaatIni >= t.jumlahPerPorsi
  })
  return { ...m, takaran, tersedia }
}

const namaUser = (db: Db, id: string) => db.users.find((u) => u.id === id)?.nama ?? "Tidak dikenal"

export function toPesanan(db: Db, o: DbOrder): Pesanan {
  return { ...o, dibuatOleh: { id: o.dibuatOleh, nama: namaUser(db, o.dibuatOleh) } }
}

export function toShift(db: Db, s: DbShift): Shift {
  return {
    id: s.id, tanggal: s.tanggal, nama: s.nama, status: s.status,
    dibukaOleh: { id: s.dibukaOleh, nama: namaUser(db, s.dibukaOleh) },
    dibukaPada: s.dibukaPada, ditutupPada: s.ditutupPada,
  }
}

export const shiftAktif = (db: Db) => db.shifts.find((s) => s.status === "aktif") ?? null

export function pratinjauBuka(db: Db): PratinjauBukaShift {
  const terakhir = [...db.shifts].filter((s) => s.status === "ditutup").sort((a, b) => (a.ditutupPada! < b.ditutupPada! ? 1 : -1))[0]
  const hariIni = tgl(new Date())
  let tanggal = hariIni
  let usulan: NamaShift = "pagi"
  if (terakhir) {
    if (terakhir.tanggal === hariIni) {
      const i = URUTAN.indexOf(terakhir.nama)
      if (i < 2) usulan = URUTAN[i + 1]
      else tanggal = tgl(addDays(parseISO(hariIni), 1))
    }
  }
  return {
    tanggal,
    namaShiftUsulan: usulan,
    sumber: terakhir
      ? { shiftId: terakhir.id, nama: terakhir.nama, tanggal: terakhir.tanggal, ditutupOleh: namaUser(db, terakhir.ditutupOleh ?? terakhir.dibukaOleh) }
      : null,
    stokAwal: db.bahan.filter((b) => b.aktif).map((b) => ({ bahanId: b.id, namaBahan: b.nama, satuan: b.satuan, presisi: b.presisi, jumlah: b.stokSaatIni })),
    shiftTerbuka: shiftAktif(db) ? toShift(db, shiftAktif(db)!) : null,
  }
}

export function rekapShift(db: Db, s: DbShift): RekapShift {
  const orders = db.orders.filter((o) => o.shiftId === s.id)
  const omzetPerKanal: Record<Kanal, number> = { toko: 0, shopee_food: 0 }
  for (const o of orders) omzetPerKanal[o.kanal] += o.total
  const mutasi = db.mutasi.filter((m) => m.shiftId === s.id)
  const stok = db.bahan
    .filter((b) => b.aktif || s.stokAwal[b.id] !== undefined)
    .map((b) => {
      const awal = s.stokAwal[b.id] ?? 0
      const masuk = bulat(mutasi.filter((m) => m.bahanId === b.id && m.jenis === "masuk").reduce((a, m) => a + m.jumlah, 0), b.presisi)
      const terpakai = bulat(mutasi.filter((m) => m.bahanId === b.id && m.jenis === "terpakai").reduce((a, m) => a + m.jumlah, 0), 2)
      const tercatat = bulat(stokTercatat(awal, masuk, terpakai), presisiSelisih(b.presisi))
      const fisik = s.stokFisik?.[b.id] ?? null
      const selisih = fisik === null ? null : selisihBahan(fisik, tercatat, b.presisi)
      return {
        bahanId: b.id, namaBahan: b.nama, satuan: b.satuan, presisi: b.presisi,
        awal, masuk, terpakai, tercatat, fisik, selisih, toleransi: b.toleransiSelisih,
        melewatiToleransi: selisih !== null && melewatiToleransi(selisih, b.toleransiSelisih),
        catatan: s.catatanBahan?.[b.id],
      }
    })
  const barangMasuk = mutasi
    .filter((m) => m.jenis === "masuk")
    .map((m) => {
      const b = db.bahan.find((x) => x.id === m.bahanId)
      return { bahanId: m.bahanId, namaBahan: b?.nama ?? "", satuan: b?.satuan ?? "", jumlah: m.jumlah, waktu: m.waktu }
    })
  return {
    shiftId: s.id, nama: s.nama, tanggal: s.tanggal, status: s.status,
    dibukaOleh: namaUser(db, s.dibukaOleh), dibukaPada: s.dibukaPada, ditutupPada: s.ditutupPada,
    jumlahPesanan: orders.length, omzet: omzetPerKanal.toko + omzetPerKanal.shopee_food, omzetPerKanal,
    barangMasuk, stok, catatanShift: s.catatanShift, durasiTutupDetik: s.durasiTutupDetik,
    rekapHarianDibuat: s.nama === "malam" && s.status === "ditutup",
  }
}

export function rekapHarian(db: Db, tanggal: string): RekapHarian | null {
  const shifts = db.shifts.filter((s) => s.tanggal === tanggal).sort((a, b) => URUTAN.indexOf(a.nama) - URUTAN.indexOf(b.nama))
  if (!shifts.length) return null
  const perShift = shifts.map((s) => rekapShift(db, s))
  const ids = new Set(shifts.map((s) => s.id))
  const orders = db.orders.filter((o) => ids.has(o.shiftId))
  const omzetPerKanal: Record<Kanal, number> = { toko: 0, shopee_food: 0 }
  for (const o of orders) omzetPerKanal[o.kanal] += o.total
  const menuMap = new Map<string, { menuId: string; namaMenu: string; jumlah: number; omzet: number }>()
  for (const o of orders)
    for (const it of o.items) {
      const cur = menuMap.get(it.menuId) ?? { menuId: it.menuId, namaMenu: it.namaMenu, jumlah: 0, omzet: 0 }
      cur.jumlah += it.jumlah
      cur.omzet += it.subtotal
      menuMap.set(it.menuId, cur)
    }
  const lengkap = shifts.some((s) => s.nama === "malam" && s.status === "ditutup")
  const terakhirTutup = [...perShift].reverse().find((r) => r.status === "ditutup")
  const stokHarian = perShift[0].stok.map((row) => {
    const rows = perShift.map((r) => r.stok.find((x) => x.bahanId === row.bahanId)!).filter(Boolean)
    const totalSelisih = bulat(rows.reduce((a, r) => a + (r.selisih ?? 0), 0), Math.max(row.presisi, 2))
    return {
      bahanId: row.bahanId, namaBahan: row.namaBahan, satuan: row.satuan, presisi: row.presisi,
      awalHari: row.awal,
      masuk: bulat(rows.reduce((a, r) => a + r.masuk, 0), row.presisi),
      terpakai: bulat(rows.reduce((a, r) => a + r.terpakai, 0), 2),
      fisikAkhir: terakhirTutup?.stok.find((x) => x.bahanId === row.bahanId)?.fisik ?? null,
      totalSelisih,
      melewatiToleransi: rows.some((r) => r.melewatiToleransi),
    }
  })
  return {
    tanggal, status: lengkap ? "lengkap" : "belum_lengkap",
    omzet: omzetPerKanal.toko + omzetPerKanal.shopee_food, omzetPerKanal, jumlahPesanan: orders.length,
    perShift,
    menuTerjual: [...menuMap.values()].sort((a, b) => b.jumlah - a.jumlah),
    stokHarian,
  }
}

export function daftarRekap(db: Db, from: string, to: string): RingkasanRekapHarian[] {
  const tanggalSet = [...new Set(db.shifts.map((s) => s.tanggal))].filter((t) => t >= from && t <= to).sort().reverse()
  return tanggalSet.map((t) => {
    const r = rekapHarian(db, t)!
    return {
      tanggal: t, status: r.status, omzet: r.omzet, jumlahPesanan: r.jumlahPesanan,
      jumlahBahanBerselisih: r.stokHarian.filter((s) => s.totalSelisih !== 0).length,
    }
  })
}

/** Pemakaian harian per bahan, dasar grafik dan perkiraan tiruan */
export function pemakaianHarian(db: Db, bahanId: string, hari: number) {
  const hariIni = new Date()
  const out: { tanggal: string; aktual: number }[] = []
  const b = db.bahan.find((x) => x.id === bahanId)
  for (let i = hari; i >= 1; i--) {
    const t = tgl(subDays(hariIni, i))
    const ids = new Set(db.shifts.filter((s) => s.tanggal === t).map((s) => s.id))
    const total = db.mutasi.filter((m) => m.bahanId === bahanId && m.jenis === "terpakai" && ids.has(m.shiftId)).reduce((a, m) => a + m.jumlah, 0)
    out.push({ tanggal: t, aktual: bulat(total, Math.max(b?.presisi ?? 0, 2)) })
  }
  return out
}

export function perkiraanBesok(db: Db, bahanId: string, untuk: Date) {
  const riwayat = pemakaianHarian(db, bahanId, 14)
  const tujuh = riwayat.slice(-7)
  const rata = tujuh.reduce((a, r) => a + r.aktual, 0) / Math.max(1, tujuh.length)
  const akhirPekan = [0, 6].includes(untuk.getDay())
  return rata * (akhirPekan ? 1.22 : 0.94)
}
