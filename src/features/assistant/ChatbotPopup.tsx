import { useEffect, useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { flags } from "@/lib/flags"
import { ChatBody } from "./ChatBody"

/**
 * Lacak media query.
 *
 * Kartu desktop dan bottom sheet tidak boleh di-mount bersamaan. Isi `Sheet`
 * dirender lewat portal ke `document.body`, sehingga kelas `lg:hidden` pada
 * pembungkusnya tidak berpengaruh dan sheet tetap tampil penuh di desktop.
 */
function useMediaQuery(kueri: string) {
  const [cocok, setCocok] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(kueri).matches,
  )
  useEffect(() => {
    const media = window.matchMedia(kueri)
    const ubah = () => setCocok(media.matches)
    ubah()
    media.addEventListener("change", ubah)
    return () => media.removeEventListener("change", ubah)
  }, [kueri])
  return cocok
}

export function ChatbotPopup() {
  const [terbuka, setTerbuka] = useState(false)
  const [versiSesi, setVersiSesi] = useState(0)
  const desktop = useMediaQuery("(min-width: 1024px)")
  if (!flags.assistant) return null

  const resetPercakapan = () => setVersiSesi((n) => n + 1)

  return (
    <>
      <button
        type="button"
        onClick={() => setTerbuka((o) => !o)}
        aria-label={terbuka ? "Tutup Chat" : "Buka Asisten Toko"}
        aria-expanded={terbuka}
        aria-controls="asisten-kartu"
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 inline-flex min-h-12 min-w-[175px] items-center gap-3.5 rounded-full border border-teh bg-teh px-4 py-3 text-left text-primary-foreground shadow-md shadow-black/15 transition-colors hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:right-6 lg:bottom-6 lg:px-4 motion-reduce:hover:scale-100"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15" aria-hidden>
          {terbuka ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold">Asisten Toko</span>
          <span className="text-[0.75rem] font-medium opacity-90">{terbuka ? "Tutup Chat" : "Buka Chat"}</span>
        </span>
      </button>

      {desktop
        ? terbuka && (
            /* Desktop: kartu melayang non-modal di pojok kanan bawah, tanpa backdrop. */
            <section
              id="asisten-kartu"
              aria-label="Asisten Toko"
              className="fixed right-6 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex h-[min(640px,calc(100dvh-9rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/10"
            >
              <div className="flex min-h-0 flex-1 p-4">
                <ChatBody key={versiSesi} onReset={resetPercakapan} onClose={() => setTerbuka(false)} />
              </div>
            </section>
          )
        : (
            /* Mobile: bottom sheet modal. */
            <Sheet open={terbuka} onOpenChange={setTerbuka}>
              <SheetContent
                side="bottom"
                showCloseButton={false}
                aria-describedby={undefined}
                className="h-[min(44rem,calc(100dvh-0.75rem))] gap-0 rounded-t-3xl p-0 pb-[env(safe-area-inset-bottom)]"
                aria-label="Asisten Toko"
              >
                <div className="flex min-h-0 flex-1 p-4">
                  <ChatBody key={versiSesi} onReset={resetPercakapan} onClose={() => setTerbuka(false)} />
                </div>
              </SheetContent>
            </Sheet>
          )}
    </>
  )
}
