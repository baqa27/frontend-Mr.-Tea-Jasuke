import type { KategoriMenu } from "@/types/domain"

export function fotoMenu(menu: { id?: string; fotoUrl?: string; kategori: KategoriMenu }): string | null {
  if (menu.fotoUrl) return menu.fotoUrl
  if (!menu.id) return null
  return `/menu/${menu.id}.webp`
}
