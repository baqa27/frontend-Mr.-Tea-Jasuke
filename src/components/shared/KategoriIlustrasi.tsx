import { cn } from "@/lib/utils"
import type { KategoriMenu } from "@/types/domain"

interface Props {
  kategori: KategoriMenu
  className?: string
}

const garis = {
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export default function KategoriIlustrasi({ kategori, className }: Props) {
  const warna = kategori === "teh" ? "text-teh" : kategori === "jasuke" ? "text-jagung" : "text-tinta"

  return (
    <svg
      className={cn("size-full", warna, className)}
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {kategori === "teh" && (
        <>
          <path d="M7 7H17L15.5 20H8.5L7 7Z" {...garis} />
          <path d="M6 7H18" {...garis} />
          <path d="M13 3L11 7" {...garis} />
          <path d="M10 11H15" {...garis} />
          <path d="M9.5 14H14.5" {...garis} />
        </>
      )}
      {kategori === "jasuke" && (
        <>
          <path d="M6 7H18L16.5 20H7.5L6 7Z" {...garis} />
          <path d="M5 7H19" {...garis} />
          <path d="M9 4C10 2.5 14 2.5 15 4" {...garis} />
          <circle cx="9.5" cy="11" r="1" {...garis} />
          <circle cx="14.5" cy="11" r="1" {...garis} />
          <circle cx="12" cy="15" r="1" {...garis} />
        </>
      )}
      {kategori === "lainnya" && (
        <>
          <path d="M7 8H17V20H7V8Z" {...garis} />
          <path d="M6 8L8 4H16L18 8" {...garis} />
          <path d="M10 12H14" {...garis} />
          <path d="M10 15H14" {...garis} />
        </>
      )}
    </svg>
  )
}