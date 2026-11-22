export const BATAS_UKURAN_FOTO_MENU = 5 * 1024 * 1024

export function pesanGalatFotoMenu(file: Pick<File, "size" | "type">) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return "Pilih foto berformat JPEG, PNG, atau WebP."
  if (file.size > BATAS_UKURAN_FOTO_MENU) return "Ukuran foto maksimal 5 MB. Pilih foto yang lebih kecil."
  return undefined
}
