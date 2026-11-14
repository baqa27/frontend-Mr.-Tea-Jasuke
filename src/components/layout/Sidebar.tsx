import { LogOut } from "lucide-react"
import { NavLink } from "react-router"
import { useSession } from "@/features/auth/session"
import { cn } from "@/lib/utils"
import { BrandMark } from "./BrandMark"
import { navGroups } from "./nav"
import { inisial, useLogoutWithGuard } from "./UserMenu"

export function Sidebar({ className }: { className?: string }) {
  const { pengguna } = useSession()
  const { minta, dialog } = useLogoutWithGuard()
  if (!pengguna) return null
  return (
    <aside className={cn("flex-col border-r bg-card/70", className)} aria-label="Navigasi utama">
      <div className="px-5 pt-5 pb-4">
        <BrandMark />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups(pengguna.peran).map((g) => (
          <div key={g.label} className="mt-4 first:mt-1">
            <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">{g.label}</p>
            <ul className="grid gap-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    data-tour={it.tour}
                    className={({ isActive }) =>
                      cn(
                        "relative flex h-11 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isActive && "bg-teh-muda text-teh-tua before:absolute before:top-1.5 before:bottom-1.5 before:-left-3 before:w-[3px] before:rounded-r before:bg-teh hover:bg-teh-muda",
                      )
                    }
                  >
                    <it.icon className="size-[1.05rem] shrink-0" aria-hidden />
                    {it.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-3 border-t px-4 py-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teh text-sm font-bold text-primary-foreground">{inisial(pengguna.nama)}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">{pengguna.nama}</p>
          <p className="text-xs text-muted-foreground capitalize">{pengguna.peran}</p>
        </div>
        <button
          type="button"
          onClick={minta}
          className="grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-bahaya focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Keluar"
        >
          <LogOut className="size-4" />
        </button>
      </div>
      {dialog}
    </aside>
  )
}
