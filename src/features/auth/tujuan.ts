import type { Peran } from "@/types/domain"

/**
 * Halaman tujuan setelah login (AUTH-03). Redirect hanya diterima bila berupa path internal,
 * bukan halaman login, dan sesuai peran. Karyawan tanpa redirect diarahkan ke "/" yang memilih
 * PoS atau Buka Shift sesuai shift aktif.
 */
export function tujuanSetelahMasuk(redirect: string | null, peran: Peran | undefined): string {
  const awal = peran === "pemilik" ? "/pemilik/beranda" : "/"
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/login")) return awal
  if (peran !== "pemilik" && /^\/pemilik(\/|$|\?)/.test(redirect)) return awal
  return redirect
}
