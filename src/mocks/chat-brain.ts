/**
 * Asisten tiruan berbasis kata kunci. Hanya untuk menguji antarmuka.
 * Layanan sungguhan memakai klasifikasi intent, RAG, dan Gemini di sisi AI (W14, T9, T10, T11).
 */
import { rupiah, angka } from "@/lib/format"
import type { PesanChat } from "@/types/domain"
import type { Db } from "./db"
import { rekapHarian } from "./logic"
import { tgl } from "./db"

type Jawaban = Pick<PesanChat, "isi" | "intent" | "sumber" | "ditolak">

const SOP: { kunci: RegExp; judul: string; bagian: string; isi: string }[] = [
  {
    kunci: /tutup shift|menutup shift|penutupan|hitung stok|stok fisik/i,
    judul: "SOP Penutupan Shift", bagian: "bagian 2",
    isi: "Saat menutup shift:\n\n1. Pastikan semua pesanan sudah tercatat di PoS.\n2. Hitung stok fisik setiap bahan, gelas dan cup dihitung per buah.\n3. Isi hasil hitung di halaman **Tutup Shift**, lalu periksa selisihnya.\n4. Beri catatan untuk bahan yang selisihnya melewati toleransi, misalnya tumpah atau rusak.\n5. Tekan **Tutup Shift** dan serahkan kunci laci ke karyawan shift berikutnya.",
  },
  {
    kunci: /buka shift|membuka shift|mulai shift|awal shift/i,
    judul: "SOP Buka Shift", bagian: "bagian 1",
    isi: "Saat membuka shift, cocokkan stok awal di layar dengan isi rak. Bila ada yang berbeda, beri tahu pemilik sebelum mulai berjualan, lalu centang konfirmasi dan tekan **Buka Shift**.",
  },
  {
    kunci: /shopee|ojol|online/i,
    judul: "SOP Pesanan Shopee Food", bagian: "bagian 1",
    isi: "Pesanan Shopee Food dicatat manual di PoS dengan memilih kanal **Shopee Food** sebelum menekan Simpan. Cocokkan nama menu dan jumlah dengan aplikasi Shopee Food Merchant agar harga yang tercatat sesuai.",
  },
  {
    kunci: /takaran teh|seduh|cara buat teh|penyajian teh/i,
    judul: "SOP Penyajian Teh", bagian: "bagian 3",
    isi: "Teh diseduh 8 gram per gelas 16 oz dengan air panas sekitar 90 derajat selama 3 menit. Gula 20 gram untuk manis normal. Tambahkan es sampai garis batas gelas, lalu segel.",
  },
  {
    kunci: /jasuke|jagung/i,
    judul: "SOP Penyajian Jasuke", bagian: "bagian 2",
    isi: "Satu porsi jasuke memakai 120 gram jagung pipil hangat, 10 gram margarin, 20 ml susu kental manis, dan 15 gram keju parut. Varian keju double memakai 35 gram keju.",
  },
  {
    kunci: /bersih|kebersihan|cuci/i,
    judul: "SOP Kebersihan Area Kasir", bagian: "bagian 1",
    isi: "Lap meja kasir setiap pergantian shift, buang sampah gelas sebelum penuh, dan cuci wadah sirup minimal sekali sehari di akhir Shift Malam.",
  },
]

const DI_LUAR = /cuaca|politik|presiden|pilkada|bola|film|lagu|pacar|coding|python|resep (?!teh|jasuke)|saham|kripto|bitcoin|berita/i

export function jawab(db: Db, pertanyaan: string): Jawaban {
  const q = pertanyaan.toLowerCase()

  if (DI_LUAR.test(q)) {
    return {
      intent: "di_luar_konteks", ditolak: true,
      isi: "Pertanyaan itu di luar cakupan Asisten Toko. Saya bisa membantu soal SOP, stok bahan, dan penjualan Mr. Tea & Jasuke.",
    }
  }

  const sop = SOP.find((s) => s.kunci.test(q))
  if (sop && !/sisa|stok (teh|gula|gelas|jagung|keju)/i.test(q)) {
    return { intent: "sop", isi: sop.isi, sumber: [{ judul: sop.judul, bagian: sop.bagian }] }
  }

  if (/stok|sisa|habis|tinggal/.test(q)) {
    const cocok = db.bahan.filter((b) => b.aktif && b.nama.toLowerCase().split(" ").some((kata) => kata.length > 3 && q.includes(kata)))
    if (cocok.length) {
      const baris = cocok.map((b) => `- ${b.nama}: **${angka(b.stokSaatIni, b.presisi)} ${b.satuan}**${b.stokSaatIni <= b.stokMinimum ? " (hampir habis)" : ""}`)
      return { intent: "cek_stok", isi: `Stok tercatat saat ini:\n\n${baris.join("\n")}`, sumber: [{ judul: "Data stok aplikasi" }] }
    }
    const menipis = db.bahan.filter((b) => b.aktif && b.stokSaatIni <= b.stokMinimum)
    return {
      intent: "cek_stok",
      isi: menipis.length
        ? `Bahan yang hampir habis:\n\n${menipis.map((b) => `- ${b.nama}: ${angka(b.stokSaatIni, b.presisi)} ${b.satuan}`).join("\n")}`
        : "Semua bahan masih di atas stok minimum.",
      sumber: [{ judul: "Data stok aplikasi" }],
    }
  }

  if (/omzet|penjualan|pendapatan|laku|terlaris/.test(q)) {
    const r = rekapHarian(db, tgl(new Date()))
    if (!r || r.jumlahPesanan === 0) return { intent: "penjualan", isi: "Belum ada penjualan yang tercatat hari ini.", sumber: [{ judul: "Data penjualan aplikasi" }] }
    const top = r.menuTerjual.slice(0, 3).map((m) => `${m.namaMenu} (${m.jumlah})`).join(", ")
    return {
      intent: "penjualan",
      isi: `Hari ini tercatat **${r.jumlahPesanan} pesanan** dengan omzet **${rupiah(r.omzet)}**. Menu terlaris: ${top}.`,
      sumber: [{ judul: "Data penjualan aplikasi" }],
    }
  }

  if (/harga|menu|berapa/.test(q)) {
    const m = db.menus.find((x) => x.aktif && q.includes(x.nama.toLowerCase()))
    if (m) {
      return {
        intent: "info_menu",
        isi: `${m.nama}: ${rupiah(m.harga.toko)} di toko${m.harga.shopee_food ? ` dan ${rupiah(m.harga.shopee_food)} di Shopee Food` : ""}.`,
        sumber: [{ judul: "Data master menu" }],
      }
    }
  }

  return {
    intent: "di_luar_konteks", ditolak: true,
    isi: "Saya belum menemukan jawaban untuk pertanyaan itu. Coba tanyakan SOP tertentu, sisa stok bahan, atau omzet hari ini.",
  }
}
