import { fotoMenu } from "@/lib/foto-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { KategoriMenu } from "@/types/domain"
import KategoriIlustrasi from "./KategoriIlustrasi"

interface Props {
  id?: string
  fotoUrl?: string
  kategori: KategoriMenu
  nama: string
  className?: string
}

export function MenuPhoto({ id, fotoUrl, kategori, nama: _nama, className }: Props) {
  const [gagal, setGagal] = useState(false)
  const src = fotoMenu({ id, fotoUrl, kategori })
  const ilustrasiAi = gagal || !src || src?.startsWith("/menu/")
  const tampilIlustrasi = !src || gagal

  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-lg bg-muted", className)}>
      {src && !gagal && (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          width={640}
          height={480}
          className="size-full object-cover"
          onError={() => setGagal(true)}
        />
      )}
      {tampilIlustrasi && <KategoriIlustrasi kategori={kategori} className="size-full" />}
      {ilustrasiAi && (
        <span className="absolute bottom-2 left-2 rounded bg-kartu/85 px-2 py-1 text-xs text-muted-foreground">
          Ilustrasi AI
        </span>
      )}
    </div>
  )
}
