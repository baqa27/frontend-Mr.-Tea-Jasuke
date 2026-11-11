import { CircleHelp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/** Penjelasan istilah. Popover dipakai agar bisa dibuka dengan sentuhan di ponsel (ONB-02). */
export function HelpTooltip({ istilah, children }: { istilah: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Apa itu ${istilah}?`}
      >
        <CircleHelp className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm leading-relaxed" side="top">
        <p className="mb-1 font-semibold">{istilah}</p>
        <div className="text-muted-foreground">{children}</div>
      </PopoverContent>
    </Popover>
  )
}

export const ISTILAH = {
  takaran: "Jumlah setiap bahan yang terpakai untuk satu porsi menu. Stok terpotong otomatis sesuai takaran saat pesanan disimpan.",
  stokMinimum: "Batas bawah stok. Bahan pada atau di bawah angka ini ditandai Hampir habis.",
  stokTercatat: "Stok menurut aplikasi: stok awal ditambah barang masuk, dikurangi pemakaian dari pesanan.",
  stokFisik: "Hasil hitung langsung di rak saat tutup shift. Gelas dan cup dihitung per buah.",
  selisih: "Stok fisik dikurangi stok tercatat. Angka negatif berarti bahan berkurang lebih banyak dari catatan.",
  toleransi: "Selisih yang masih dianggap wajar untuk bahan ini. Selisih di atas toleransi wajib diberi catatan.",
  mae: "Rata-rata selisih mutlak antara perkiraan dan pemakaian sebenarnya. Semakin kecil, semakin akurat.",
  rmse: "Mirip MAE, tetapi kesalahan besar diberi bobot lebih berat. Semakin kecil, semakin akurat.",
}
