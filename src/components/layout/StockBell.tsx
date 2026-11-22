import { Bell } from "lucide-react"
import { Link } from "react-router"
import { useIngredients } from "@/api/catalog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StatusStokBadge } from "@/components/shared/badges"
import { urutkanMenurutStatus } from "@/lib/calc"
import { jumlahSatuan } from "@/lib/format"

/** Jumlah bahan hampir habis dan habis, diperbarui tiap 60 detik (STK-04) */
export function StockBell() {
  const { data } = useIngredients()
  const menipis = urutkanMenurutStatus((data ?? []).filter((b) => b.aktif && b.status !== "aman"))
  return (
    <Popover>
      <PopoverTrigger
        className="relative grid size-11 place-items-center rounded-full text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={menipis.length ? `${menipis.length} bahan perlu diperhatikan` : "Tidak ada peringatan stok"}
      >
        <Bell className="size-[1.15rem]" />
        {menipis.length > 0 && (
          <span className="num absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-destructive font-bold text-destructive-foreground">
            {menipis.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="font-semibold">Peringatan stok</p>
          <p className="text-sm text-muted-foreground">{menipis.length ? `${menipis.length} bahan pada atau di bawah stok minimum.` : "Semua bahan di atas stok minimum."}</p>
        </div>
        {menipis.length > 0 && (
          <ul className="max-h-72 divide-y overflow-auto">
            {menipis.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.nama}</p>
                  <p className="num text-muted-foreground">{jumlahSatuan(b.stokSaatIni, b.satuan, b.presisi)}</p>
                </div>
                <StatusStokBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
        <div className="border-t p-2">
          <Link to="/stok" className="block rounded-md px-2 py-2 text-sm font-medium text-teh hover:bg-accent">
            Buka halaman stok
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
