import { useEffect } from "react"
import { useAuth } from "@/stores/auth-store"
import type { Peran } from "@/types/domain"

const kunci = (userId: string) => `mrtea-tur-v1:${userId}`

interface Langkah {
  el: string
  title: string
  description: string
}

function langkah(peran: Peran): Langkah[] {
  const m = window.matchMedia("(min-width: 1024px)").matches ? "" : "-m"
  if (peran === "pemilik")
    return [
      { el: `[data-tour="nav-beranda${m}"]`, title: "Beranda", description: "Omzet hari berjalan, shift yang sedang aktif, dan bahan yang menipis ada di sini." },
      { el: `[data-tour="nav-rekap${m}"]`, title: "Rekap harian", description: "Pilih tanggal untuk melihat omzet per kanal, rekap tiap shift, menu terjual, dan selisih stok." },
      { el: `[data-tour="nav-master"]`, title: "Menu dan takaran", description: "Atur harga dan takaran bahan per porsi. Stok terpotong otomatis sesuai takaran ini." },
      { el: `[data-tour="nav-perkiraan${m}"]`, title: "Perkiraan belanja", description: "Perkiraan kebutuhan bahan untuk besok dari riwayat penjualan, beserta saran jumlah beli." },
      { el: `[data-tour="nav-dasbor"]`, title: "Dasbor", description: "Grafik omzet, menu terlaris, dan selisih stok dengan filter tanggal dan shift." },
    ]
  return [
    { el: `[data-tour="shift-chip"]`, title: "Status shift", description: "Mulai kerja dengan membuka shift. Chip ini menunjukkan shift yang sedang aktif." },
    { el: `[data-tour="nav-pos${m}"]`, title: "Catat pesanan", description: "Pilih kanal Toko atau Shopee Food, ketuk menu untuk menambah porsi, lalu tekan Simpan Pesanan." },
    { el: `[data-tour="nav-stok${m}"]`, title: "Stok bahan", description: "Lihat sisa bahan dan catat barang masuk. Bahan yang menipis diberi tanda kuning atau merah." },
    { el: `[data-tour="nav-shift${m}"]`, title: "Tutup shift", description: "Di akhir shift, buka halaman Shift lalu Tutup Shift. Hitung stok fisik dan aplikasi menampilkan selisihnya." },
  ]
}

export async function startTour(peran: Peran, userId: string, force = false) {
  try {
    if (!force && localStorage.getItem(kunci(userId))) return
  } catch {
    // abaikan
  }
  const { driver } = await import("driver.js")
  await import("driver.js/dist/driver.css")
  const steps = langkah(peran)
    .filter((l) => document.querySelector(l.el))
    .map((l) => ({ element: l.el, popover: { title: l.title, description: l.description } }))
  if (!steps.length) return
  const d = driver({
    showProgress: true,
    progressText: "{{current}} dari {{total}}",
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    allowClose: true,
    steps,
    onDestroyed: () => {
      try {
        localStorage.setItem(kunci(userId), "selesai")
      } catch {
        // abaikan
      }
    },
  })
  d.drive()
}

/** Tur tampil sekali saat login pertama per pengguna (ONB-01) */
export function useOnboarding() {
  const pengguna = useAuth((s) => s.pengguna)
  useEffect(() => {
    if (!pengguna) return
    const t = setTimeout(() => startTour(pengguna.peran, pengguna.id), 900)
    return () => clearTimeout(t)
  }, [pengguna])
}
