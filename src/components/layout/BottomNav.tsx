import { useState } from "react"
import { Ellipsis, LogOut } from "lucide-react"
import { NavLink, useLocation } from "react-router"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSession } from "@/features/auth/session"
import { cn } from "@/lib/utils"
import { bottomNav } from "./nav"
import { useLogoutWithGuard } from "./UserMenu"

export function BottomNav({ className }: { className?: string }) {
  const { pengguna } = useSession()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const { minta, dialog } = useLogoutWithGuard()
  if (!pengguna) return null
  const { utama, lainnya } = bottomNav(pengguna.peran)
  const lainnyaAktif = lainnya.some((i) => loc.pathname.startsWith(i.to))

  const item = "flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
  return (
    <>
      <nav
        className={cn("no-print fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur", className)}
        aria-label="Navigasi bawah"
      >
        <div className="mx-auto flex h-16 max-w-lg">
          {utama.map((it) => (
            <NavLink key={it.to} to={it.to} data-tour={it.tour ? `${it.tour}-m` : undefined} className={({ isActive }) => cn(item, isActive && "text-teh")}>
              {({ isActive }) => (
                <>
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", isActive && "bg-teh-muda")}>
                    <it.icon className="size-5" aria-hidden />
                  </span>
                  {it.short ?? it.label}
                </>
              )}
            </NavLink>
          ))}
          <button type="button" className={cn(item, lainnyaAktif && "text-teh")} onClick={() => setOpen(true)} aria-haspopup="dialog">
            <span className={cn("grid h-7 w-12 place-items-center rounded-full", lainnyaAktif && "bg-teh-muda")}>
              <Ellipsis className="size-5" aria-hidden />
            </span>
            Lainnya
          </button>
        </div>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader>
            <SheetTitle>Menu lainnya</SheetTitle>
            <SheetDescription className="sr-only">Halaman yang tidak ada di navigasi bawah</SheetDescription>
          </SheetHeader>
          <ul className="grid gap-1 px-4">
            {lainnya.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn("flex h-12 items-center gap-3 rounded-lg px-3 font-medium hover:bg-accent", isActive && "bg-teh-muda text-teh-tua")}
                >
                  <it.icon className="size-5" aria-hidden />
                  {it.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-1 border-t pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  minta()
                }}
                className="flex h-12 w-full items-center gap-3 rounded-lg px-3 font-medium text-bahaya hover:bg-bahaya-muda"
              >
                <LogOut className="size-5" aria-hidden />
                Keluar
              </button>
            </li>
          </ul>
        </SheetContent>
      </Sheet>
      {dialog}
    </>
  )
}
