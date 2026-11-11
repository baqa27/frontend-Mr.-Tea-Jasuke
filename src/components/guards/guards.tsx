import { Clock } from "lucide-react"
import { Link, Navigate, Outlet, useLocation, useSearchParams } from "react-router"
import { useActiveShift } from "@/api/operations"
import { EmptyState, ErrorState, PageSkeleton } from "@/components/feedback/states"
import { Button } from "@/components/ui/button"
import { useSession } from "@/features/auth/session"
import { tujuanSetelahMasuk } from "@/features/auth/tujuan"
import { ForbiddenPage } from "@/features/misc/pages"
import type { Peran } from "@/types/domain"

export function RequireAuth() {
  const { token } = useSession()
  const loc = useLocation()
  if (!token) return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  return <Outlet />
}

/** Setelah login berhasil, guard ini yang mengarahkan ke halaman tujuan agar tidak balapan dengan navigasi lain */
export function GuestOnly() {
  const { token, pengguna } = useSession()
  const [params] = useSearchParams()
  if (token) return <Navigate to={tujuanSetelahMasuk(params.get("redirect"), pengguna?.peran)} replace />
  return <Outlet />
}

export function RequireRole({ peran }: { peran: Peran }) {
  const { pengguna } = useSession()
  if (pengguna?.peran !== peran) return <ForbiddenPage />
  return <Outlet />
}

/** Halaman yang butuh shift aktif menampilkan ajakan membuka shift, bukan pengalihan diam-diam (POS-11) */
export function RequireActiveShift() {
  const { data: shift, isLoading, error, refetch } = useActiveShift()
  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!shift)
    return (
      <EmptyState
        icon={Clock}
        title="Belum ada shift aktif"
        action={
          <Button asChild size="lg">
            <Link to="/shift">Buka Shift</Link>
          </Button>
        }
      >
        Pesanan, barang masuk, dan tutup shift dicatat di dalam shift. Buka shift dulu untuk mulai.
      </EmptyState>
    )
  return <Outlet />
}

export function RoleRedirect() {
  const { pengguna } = useSession()
  const { data: shift, isLoading } = useActiveShift()
  if (pengguna?.peran === "pemilik") return <Navigate to="/pemilik/beranda" replace />
  if (isLoading) return <PageSkeleton />
  return <Navigate to={shift ? "/pos" : "/shift"} replace />
}
