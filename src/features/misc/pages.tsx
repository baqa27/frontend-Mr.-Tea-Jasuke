import { Lock, MapPinOff } from "lucide-react"
import { Link } from "react-router"
import { EmptyState } from "@/components/feedback/states"
import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  return (
    <EmptyState
      icon={Lock}
      title="Halaman ini khusus pemilik"
      className="mt-6"
      action={
        <Button asChild variant="outline">
          <Link to="/">Kembali ke beranda</Link>
        </Button>
      }
    >
      Akun yang sedang dipakai tidak punya akses ke halaman ini. Masuk dengan akun pemilik bila perlu.
    </EmptyState>
  )
}

export function NotFoundPage() {
  return (
    <EmptyState
      icon={MapPinOff}
      title="Halaman tidak ditemukan"
      className="mt-6"
      action={
        <Button asChild variant="outline">
          <Link to="/">Kembali ke beranda</Link>
        </Button>
      }
    >
      Alamat yang dibuka tidak ada. Periksa tautannya atau kembali ke beranda.
    </EmptyState>
  )
}
