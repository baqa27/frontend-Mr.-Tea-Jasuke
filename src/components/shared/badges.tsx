import { CircleAlert, CircleCheck, CircleSlash, FlaskConical, ShoppingBag, Store, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Kanal, RisikoStok, StatusStok } from "@/types/domain"

type Nada = "ok" | "warn" | "bahaya" | "info" | "netral"

const nada: Record<Nada, string> = {
  ok: "bg-ok-muda text-ok",
  warn: "bg-warn-muda text-warn",
  bahaya: "bg-bahaya-muda text-bahaya",
  info: "bg-info-muda text-info",
  netral: "bg-muted text-muted-foreground",
}

export function Pill({ tone = "netral", icon: Icon, children, className }: { tone?: Nada; icon?: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", nada[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}

export function StatusStokBadge({ status }: { status: StatusStok }) {
  if (status === "habis") return <Pill tone="bahaya" icon={CircleSlash}>Habis</Pill>
  if (status === "hampir_habis") return <Pill tone="warn" icon={TriangleAlert}>Hampir habis</Pill>
  return <Pill tone="ok" icon={CircleCheck}>Aman</Pill>
}

export function SelisihBadge({ kategori }: { kategori: "kosong" | "sesuai" | "selisih" | "lewat" }) {
  if (kategori === "kosong") return <Pill>Belum diisi</Pill>
  if (kategori === "sesuai") return <Pill tone="ok" icon={CircleCheck}>Sesuai</Pill>
  if (kategori === "selisih") return <Pill tone="warn" icon={CircleAlert}>Selisih</Pill>
  return <Pill tone="bahaya" icon={TriangleAlert}>Melewati toleransi</Pill>
}

export function RisikoBadge({ risiko }: { risiko: RisikoStok["risiko"] }) {
  if (risiko === "kritis") return <Pill tone="bahaya" icon={TriangleAlert}>Kritis</Pill>
  if (risiko === "waspada") return <Pill tone="warn" icon={CircleAlert}>Waspada</Pill>
  return <Pill tone="ok" icon={CircleCheck}>Aman</Pill>
}

export function KanalBadge({ kanal }: { kanal: Kanal }) {
  return kanal === "toko" ? (
    <Pill icon={Store}>Toko</Pill>
  ) : (
    <Pill className="bg-shopee-muda text-shopee" icon={ShoppingBag}>
      Shopee Food
    </Pill>
  )
}

export function AsumsiBadge() {
  return (
    <Pill tone="info" icon={FlaskConical}>
      Asumsi
    </Pill>
  )
}
