export type Peran = "karyawan" | "pemilik"
export type Kanal = "toko" | "shopee_food"
export type NamaShift = "pagi" | "siang" | "malam"
export type StatusStok = "aman" | "hampir_habis" | "habis"
export type KategoriMenu = "teh" | "jasuke" | "lainnya"
export type TingkatGula = "kurang" | "normal" | "ekstra"
export type Satuan = "gram" | "kg" | "ml" | "liter" | "pcs"

export interface Pengguna {
  id: string
  nama: string
  username: string
  peran: Peran
}

export interface Bahan {
  id: string
  nama: string
  satuan: Satuan
  presisi: 0 | 1 | 2
  stokSaatIni: number
  stokMinimum: number
  toleransiSelisih: number
  status: StatusStok
  aktif: boolean
}

export interface TakaranItem {
  bahanId: string
  namaBahan: string
  satuan: string
  jumlahPerPorsi: number
}

export interface Menu {
  id: string
  nama: string
  kategori: KategoriMenu
  harga: { toko: number; shopee_food: number | null }
  aktif: boolean
  sumberTakaran: "pic" | "asumsi"
  takaran: TakaranItem[]
  tersedia: boolean
  fotoUrl?: string
  bisaAturGula: boolean
}

export interface BuatPesananInput {
  clientRequestId: string
  kanal: Kanal
  items: { menuId: string; jumlah: number; tingkatGula?: TingkatGula }[]
}

export interface ItemPesanan {
  menuId: string
  namaMenu: string
  jumlah: number
  hargaSatuan: number
  subtotal: number
  tingkatGula?: TingkatGula
}

export interface Pesanan {
  id: string
  nomor: string
  shiftId: string
  kanal: Kanal
  items: ItemPesanan[]
  total: number
  dibuatOleh: { id: string; nama: string }
  dibuatPada: string
}

export interface BarangMasukInput {
  clientRequestId: string
  items: { bahanId: string; jumlah: number; catatan?: string }[]
}

export interface MutasiStok {
  id: string
  bahanId: string
  jenis: "masuk" | "terpakai" | "penyesuaian"
  jumlah: number
  referensi?: { tipe: "pesanan" | "shift" | "barang_masuk"; id: string; label: string }
  waktu: string
  shiftId?: string
}

export interface Shift {
  id: string
  tanggal: string
  nama: NamaShift
  status: "aktif" | "ditutup"
  dibukaOleh: { id: string; nama: string }
  dibukaPada: string
  ditutupPada?: string
}

export interface PratinjauBukaShift {
  tanggal: string
  namaShiftUsulan: NamaShift
  sumber: { shiftId: string; nama: NamaShift; tanggal: string; ditutupOleh: string } | null
  stokAwal: { bahanId: string; namaBahan: string; satuan: string; presisi: number; jumlah: number }[]
  shiftTerbuka: Shift | null
}

export interface TutupShiftInput {
  stokFisik: { bahanId: string; jumlah: number; catatan?: string }[]
  catatanShift?: string
  durasiTutupDetik: number
}

export interface BarisStokShift {
  bahanId: string
  namaBahan: string
  satuan: string
  presisi: number
  awal: number
  masuk: number
  terpakai: number
  tercatat: number
  fisik: number | null
  selisih: number | null
  toleransi: number
  melewatiToleransi: boolean
  catatan?: string
}

export interface RekapShift {
  shiftId: string
  nama: NamaShift
  tanggal: string
  status: "aktif" | "ditutup"
  dibukaOleh: string
  dibukaPada: string
  ditutupPada?: string
  jumlahPesanan: number
  omzet: number
  omzetPerKanal: Record<Kanal, number>
  barangMasuk: { bahanId: string; namaBahan: string; satuan: string; jumlah: number; waktu: string }[]
  stok: BarisStokShift[]
  catatanShift?: string
  durasiTutupDetik?: number
  rekapHarianDibuat: boolean
}

export interface RingkasanRekapHarian {
  tanggal: string
  status: "lengkap" | "belum_lengkap"
  omzet: number
  jumlahPesanan: number
  jumlahBahanBerselisih: number
}

export interface RekapHarian {
  tanggal: string
  status: "lengkap" | "belum_lengkap"
  omzet: number
  omzetPerKanal: Record<Kanal, number>
  jumlahPesanan: number
  perShift: RekapShift[]
  menuTerjual: { menuId: string; namaMenu: string; jumlah: number; omzet: number }[]
  stokHarian: {
    bahanId: string
    namaBahan: string
    satuan: string
    presisi: number
    awalHari: number
    masuk: number
    terpakai: number
    fisikAkhir: number | null
    totalSelisih: number
    melewatiToleransi: boolean
  }[]
}

export interface Perkiraan {
  untukTanggal: string
  versiModel: string
  dibuatPada: string
  sumberData: "asli" | "simulasi" | "campuran"
  items: {
    bahanId: string
    namaBahan: string
    satuan: string
    presisi: number
    perkiraanKebutuhan: number
    stokSaatIni: number
    saranBeli: number | null
  }[]
}

export interface MetrikModel {
  nama: string
  konfigurasi: string
  mae: number
  rmse: number
  terbaik: boolean
}

export interface DampakFitur {
  fitur: "lag" | "hari_dalam_minggu" | "kanal"
  maeTanpa: number
  maeDengan: number
  rmseTanpa: number
  rmseDengan: number
}

export interface RiwayatPemakaian {
  tanggal: string
  aktual: number
}

export interface RisikoStok {
  bahanId: string
  risiko: "aman" | "waspada" | "kritis"
  skor?: number
}

export interface PesanChat {
  id: string
  sesiId: string
  peran: "pengguna" | "asisten"
  isi: string
  waktu: string
  intent?: string
  sumber?: { judul: string; bagian?: string }[]
  model?: "gemini" | "lokal" | "template"
  ditolak?: boolean
  latensiMs?: number
}

export interface Halaman<T> {
  items: T[]
  page: number
  limit: number
  total: number
}
