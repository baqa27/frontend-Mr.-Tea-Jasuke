import {
  BookOpen, ChartLine, CircleHelp, ClipboardList, Clock, CupSoda, House, LayoutDashboard, Package, Utensils, Wheat,
} from "lucide-react"
import { flags } from "@/lib/flags"
import { env } from "@/lib/env"
import type { Peran } from "@/types/domain"

export interface NavItem {
  to: string
  label: string
  /** Label pendek untuk bottom navigation */
  short?: string
  icon: React.ElementType
  tour?: string
}
export interface NavGroup {
  label: string
  items: NavItem[]
}

const operasional: NavItem[] = [
  { to: "/shift", label: "Shift", icon: Clock, tour: "nav-shift" },
  { to: "/pos", label: "PoS", icon: CupSoda, tour: "nav-pos" },
  { to: "/pesanan", label: "Pesanan", icon: ClipboardList },
  { to: "/stok", label: "Stok", icon: Package, tour: "nav-stok" },
]

const pemilik: NavItem[] = [
  { to: "/pemilik/beranda", label: "Beranda", icon: House, tour: "nav-beranda" },
  { to: "/pemilik/rekap", label: "Rekap harian", short: "Rekap", icon: BookOpen, tour: "nav-rekap" },
  { to: "/pemilik/perkiraan-belanja", label: "Perkiraan belanja", short: "Perkiraan", icon: ChartLine, tour: "nav-perkiraan" },
  ...(flags.dashboard ? [{ to: "/pemilik/dasbor", label: "Dasbor", icon: LayoutDashboard, tour: "nav-dasbor" }] : []),
]

const master: NavItem[] = [
  { to: "/pemilik/master/menu", label: "Menu dan takaran", icon: Utensils, tour: "nav-master" },
  { to: "/pemilik/master/bahan", label: "Bahan baku", icon: Wheat },
]

const bantuan: NavItem[] = [
  { to: "/bantuan", label: "Bantuan", icon: CircleHelp },
]

export function navGroups(peran: Peran): NavGroup[] {
  if (peran === "pemilik")
    return [
      { label: "Pemantauan", items: pemilik },
      { label: "Operasional", items: operasional },
      { label: "Data master", items: master },
      { label: "Bantuan", items: bantuan },
    ]
  return [
    { label: "Operasional", items: operasional },
    { label: "Bantuan", items: bantuan },
  ]
}

/** Empat item utama di bottom navigation, sisanya masuk sheet Lainnya (NAV-01) */
export function bottomNav(peran: Peran): { utama: NavItem[]; lainnya: NavItem[] } {
  const semua = navGroups(peran).flatMap((g) => g.items)
  const utamaPaths = peran === "pemilik" ? ["/pemilik/beranda", "/pemilik/rekap", "/stok", "/pemilik/perkiraan-belanja"] : ["/shift", "/pos", "/pesanan", "/stok"]
  return {
    utama: utamaPaths.map((p) => semua.find((i) => i.to === p)!).filter(Boolean),
    lainnya: semua.filter((i) => !utamaPaths.includes(i.to)),
  }
}

export const dashboardTersedia = flags.dashboard
export const manualUrl = env.userManualUrl
