import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Pengguna } from "@/types/domain"

interface AuthState {
  token: string | null
  pengguna: Pengguna | null
  masuk: (token: string, pengguna: Pengguna) => void
  setPengguna: (p: Pengguna) => void
  keluar: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      pengguna: null,
      masuk: (token, pengguna) => set({ token, pengguna }),
      setPengguna: (pengguna) => set({ pengguna }),
      keluar: () => set({ token: null, pengguna: null }),
    }),
    { name: "mrtea-auth" },
  ),
)
