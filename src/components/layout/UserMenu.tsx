import { useState } from "react"
import { LogOut, RotateCcw } from "lucide-react"
import { useActiveShift } from "@/api/operations"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout, useSession } from "@/features/auth/session"
import { startTour } from "@/features/onboarding/tour"
import { cn } from "@/lib/utils"
import { PilihTema } from "@/components/PilihTema"

export function inisial(nama: string) {
  return nama.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
}

export function useLogoutWithGuard() {
  const logout = useLogout()
  const { data: shift } = useActiveShift()
  const [open, setOpen] = useState(false)
  const minta = () => (shift ? setOpen(true) : logout())
  const dialog = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="Keluar dari aplikasi?"
      description="Shift masih aktif. Keluar tidak menutup shift, jadi karyawan berikutnya tetap bisa mencatat pesanan di shift ini."
      confirmLabel="Keluar"
      onConfirm={() => {
        setOpen(false)
        logout()
      }}
    />
  )
  return { minta, dialog }
}

export function UserMenu({ className }: { className?: string }) {
  const { pengguna } = useSession()
  const { minta, dialog } = useLogoutWithGuard()
  if (!pengguna) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn("grid size-11 place-items-center rounded-full bg-teh text-sm font-bold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none", className)}
          aria-label={`Menu akun ${pengguna.nama}`}
        >
          {inisial(pengguna.nama)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="font-semibold">{pengguna.nama}</p>
            <p className="text-xs font-normal text-muted-foreground capitalize">{pengguna.peran}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => startTour(pengguna.peran, pengguna.id, true)}>
            <RotateCcw />
            Ulangi tur
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal">Tema</DropdownMenuLabel>
          <DropdownMenuItem className="p-1">
            <PilihTema />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={minta} className="text-bahaya focus:text-bahaya">
            <LogOut className="text-bahaya" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  )
}
