import { cn } from "@/lib/utils"
import { useState } from "react"
import type { KategoriMenu } from "@/types/domain"
import KategoriIlustrasi from "./KategoriIlustrasi"

interface Props {
  fotoUrl?: string
  kategori: KategoriMenu
  nama: string
  className?: string
}

export function MenuPhoto({ fotoUrl, kategori, nama, className }: Props) {
  const [gagal, setGagal] = useState(false)

  return (
    <div className={cn("aspect-[4/3] overflow-hidden rounded-lg bg-muted", className)}>
      {fotoUrl && !gagal ? (
        <img
          src={fotoUrl}
          alt={nama}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setGagal(true)}
        />
      ) : (
        <KategoriIlustrasi kategori={kategori} className="size-full" />
      )}
    </div>
  )
}