import { useCallback } from "react"
import { useNavigate } from "react-router"
import { authApi } from "@/api/auth"
import { queryClient } from "@/lib/query-client"
import { useAuth } from "@/stores/auth-store"
import { useCart } from "@/stores/cart-store"

/** Bersihkan token, store, dan seluruh cache agar data peran lain tidak tertinggal (AUTH-05) */
export function bersihkanSesi() {
  useAuth.getState().keluar()
  useCart.getState().kosongkan()
  queryClient.clear()
  try {
    sessionStorage.removeItem("mrtea-tutup-shift")
  } catch {
    // abaikan
  }
}

export function useLogout() {
  const navigate = useNavigate()
  return useCallback(async () => {
    await authApi.logout()
    bersihkanSesi()
    navigate("/login", { replace: true })
  }, [navigate])
}

export function useSession() {
  const pengguna = useAuth((s) => s.pengguna)
  const token = useAuth((s) => s.token)
  return { pengguna, token, isPemilik: pengguna?.peran === "pemilik" }
}
