import { useEffect } from "react"
import { Loader2, WifiOff } from "lucide-react"
import { BATAS_TUNGGU_SERVER_MS } from "@/api/auth"
import { useUi } from "@/stores/ui-store"

/** Banner server lambat (ERR-02) dan luring (ERR-03) */
export function NetworkBanners() {
  const lambat = useUi((s) => s.lambat)
  const online = useUi((s) => s.online)
  const setOnline = useUi((s) => s.setOnline)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => {
      window.removeEventListener("online", on)
      window.removeEventListener("offline", off)
    }
  }, [setOnline])

  if (!online)
    return (
      <div role="alert" className="no-print flex items-center gap-2 bg-bahaya px-4 py-2 text-sm font-medium text-white">
        <WifiOff className="size-4 shrink-0" aria-hidden />
        Koneksi terputus. Data belum bisa disimpan sampai internet kembali.
      </div>
    )
  if (lambat > 0)
    return (
      <div role="status" aria-live="polite" className="no-print flex items-center gap-2 bg-jagung-muda px-4 py-2 text-sm font-medium text-tinta-tetap">
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        Server sedang dinyalakan, mohon tunggu hingga {Math.round(BATAS_TUNGGU_SERVER_MS / 1000)} detik.
      </div>
    )
  return null
}
