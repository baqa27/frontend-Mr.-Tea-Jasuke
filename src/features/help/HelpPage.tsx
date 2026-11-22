import { Download, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { PageHeader, Panel } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { useSession } from "@/features/auth/session"
import { startTour } from "@/features/onboarding/tour"
import { env } from "@/lib/env"
import { PilihTema } from "@/components/PilihTema"

const PANDUAN = [
  {
    judul: "Buka shift",
    langkah: ["Buka halaman Shift.", "Pilih nama shift. Aplikasi mengusulkan shift berikutnya sesuai urutan hari ini.", "Cocokkan stok awal di layar dengan isi rak.", "Centang konfirmasi, lalu tekan Buka Shift."],
  },
  {
    judul: "Catat pesanan",
    langkah: ["Pilih kanal Toko atau Shopee Food. Harga menyesuaikan kanal.", "Ketuk kartu menu. Setiap ketukan menambah satu porsi.", "Ubah jumlah di nota bila perlu.", "Tekan Simpan Pesanan. Stok bahan terpotong otomatis."],
  },
  {
    judul: "Catat barang masuk",
    langkah: ["Buka Stok, lalu Catat barang masuk.", "Pilih bahan dan isi jumlah yang dibeli.", "Tambah baris untuk bahan lain bila perlu.", "Tekan Simpan Barang Masuk."],
  },
  {
    judul: "Tutup shift",
    langkah: ["Pastikan semua pesanan sudah tercatat.", "Buka Shift, lalu Tutup shift. Periksa ringkasannya.", "Hitung isi rak dan tulis hasilnya untuk setiap bahan.", "Beri catatan untuk bahan yang selisihnya melewati toleransi.", "Tekan Tutup Shift dan konfirmasi."],
  },
]

const FAQ = [
  { t: "Saya salah memasukkan pesanan. Bagaimana memperbaikinya?", j: "Pesanan yang sudah disimpan belum bisa dibatalkan dari aplikasi. Tulis kejadiannya di catatan shift saat tutup shift agar pemilik bisa menyesuaikan." },
  { t: "Kenapa menu tampil redup dengan tulisan Bahan kurang?", j: "Stok salah satu bahan di takaran menu tidak cukup untuk satu porsi. Catat barang masuk bila bahan sudah dibeli." },
  { t: "Kenapa ada tulisan server sedang dinyalakan?", j: "Server gratis tertidur bila lama tidak dipakai. Tunggu hingga satu menit, data tidak hilang." },
  { t: "Apakah keluar dari aplikasi menutup shift?", j: "Tidak. Shift tetap berjalan sampai ditutup lewat halaman Tutup Shift." },
  { t: "Apa arti label Asumsi pada menu?", j: "Takaran menu tersebut belum dikonfirmasi pemilik dan masih memakai perkiraan tim." },
]

export default function HelpPage() {
  const { pengguna } = useSession()
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Bantuan"
        description="Panduan singkat setiap alur kerja."
        actions={
          <>
            {pengguna && <Button variant="outline" onClick={() => startTour(pengguna.peran, pengguna.id, true)}><RotateCcw />Ulangi tur</Button>}
            {env.userManualUrl && <Button asChild><a href={env.userManualUrl} target="_blank" rel="noreferrer"><Download />Buku Panduan (PDF)</a></Button>}
          </>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {PANDUAN.map((p) => (
          <Panel key={p.judul} title={p.judul}>
            <ol className="grid list-decimal gap-1.5 pl-5 text-sm marker:font-semibold marker:text-teh">
              {p.langkah.map((l) => <li key={l}>{l}</li>)}
            </ol>
          </Panel>
        ))}
      </div>
      <h2 className="mt-8 mb-3 text-lg font-bold">Pertanyaan yang sering muncul</h2>
      <div className="divide-y rounded-xl border bg-card">
        {FAQ.map((f) => (
          <details key={f.t} className="group px-4 py-3">
            <summary className="cursor-pointer list-none font-medium marker:hidden focus-visible:outline-none group-open:text-teh [&::-webkit-details-marker]:hidden">{f.t}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{f.j}</p>
          </details>
        ))}
      </div>
      <section className="mt-8" aria-labelledby="tampilan-judul">
        <h3 id="tampilan-judul" className="mb-3 text-lg font-bold">Tampilan</h3>
        <p className="text-sm text-muted-foreground">Pilih tema warna aplikasi.</p>
        <PilihTema />
      </section>
      {/* Pengecekan statis agar modul mock tidak ikut ke dist/ produksi */}
      {import.meta.env.VITE_USE_MOCK === "true" && (
        <div className="mt-8 rounded-xl border border-dashed p-4">
          <p className="font-semibold">Mode demo</p>
          <p className="mt-1 text-sm text-muted-foreground">Aplikasi memakai data tiruan di peramban ini. Atur ulang untuk kembali ke data awal.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={async () => {
              const { resetDb } = await import("@/mocks/db")
              resetDb()
              toast.success("Data demo diatur ulang")
              setTimeout(() => window.location.reload(), 600)
            }}
          >
            Atur ulang data demo
          </Button>
        </div>
      )}
    </div>
  )
}
