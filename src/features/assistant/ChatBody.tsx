import { useEffect, useMemo, useRef, useState } from "react"
import Markdown from "react-markdown"
import { BookOpen, ChevronDown, ChevronRight, Coffee, Info, MessageSquareText, Receipt, RotateCcw, SendHorizontal, Utensils, Wheat } from "lucide-react"
import { useChatHistory, useSendChat } from "@/api/insights"
import { AiUnavailableCard } from "@/components/feedback/states"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/session"
import { toApiError } from "@/lib/api-error"
import { isProduction } from "@/lib/env"
import { jam } from "@/lib/format"
import { cn } from "@/lib/utils"
import { chatSchema } from "@/schemas"
import type { PesanChat } from "@/types/domain"

const CONTOH: { ikon: React.ComponentType<{ className?: string }>; teks: string }[] = [
  { ikon: Receipt, teks: "Bagaimana cara menutup shift?" },
  { ikon: Wheat, teks: "Berapa sisa stok gula pasir?" },
  { ikon: MessageSquareText, teks: "Omzet hari ini berapa?" },
  { ikon: Utensils, teks: "Cara mencatat pesanan Shopee Food?" },
]
const MAKS = 500

interface Lokal {
  id: string
  isi: string
  status: "kirim" | "gagal"
  galat?: string
}

function AvatarAsisten() {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-teh size-10" aria-hidden>
      <Coffee className="text-primary-foreground size-5" />
    </span>
  )
}

/**
 * Isi percakapan asisten di popup melayang. Sesi disimpan localStorage per pengguna
 * agar percakapan bertahan saat berpindah halaman.
 */
export function ChatBody({ onReset, onClose }: { onReset: () => void; onClose?: () => void }) {
  const { pengguna } = useSession()
  const kunciSesi = `mrtea-chat-sesi:${pengguna?.id}`
  const [sesiId, setSesiId] = useState<string | undefined>(() => localStorage.getItem(kunciSesi) ?? undefined)
  const riwayat = useChatHistory(sesiId)
  const kirim = useSendChat()
  const [teks, setTeks] = useState("")
  const [lokal, setLokal] = useState<Lokal[]>([])
  const akhir = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)

  const pesan = useMemo(() => (sesiId ? (riwayat.data ?? []) : []), [riwayat.data, sesiId])
  useEffect(() => {
    akhir.current?.scrollIntoView({ block: "end" })
  }, [pesan.length, lokal.length, kirim.isPending])
  useEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [teks])

  const valid = chatSchema.safeParse(teks).success
  const kirimPesan = (isi: string, ulangId?: string) => {
    if (!chatSchema.safeParse(isi).success || kirim.isPending) return
    const id = ulangId ?? crypto.randomUUID?.() ?? String(Date.now())
    setLokal((l) => [...l.filter((x) => x.id !== id), { id, isi, status: "kirim" }])
    setTeks("")
    kirim.mutate(
      { pesan: isi.trim(), sesiId },
      {
        onSuccess: (m) => {
          if (!sesiId) {
            setSesiId(m.sesiId)
            localStorage.setItem(kunciSesi, m.sesiId)
          }
          setLokal((l) => l.filter((x) => x.id !== id))
        },
        onError: (e) => {
          const err = toApiError(e)
          const galat =
            err.status === 429
              ? "Terlalu banyak pertanyaan, coba lagi sebentar lagi."
              : err.isAiUnavailable || err.code === "TIMEOUT"
                ? "Asisten sedang tidak tersedia. Fitur lain tetap bisa dipakai."
                : err.message
          setLokal((l) => l.map((x) => (x.id === id ? { ...x, status: "gagal", galat } : x)))
        },
      },
    )
  }

  const baru = () => {
    setSesiId(undefined)
    setLokal([])
    localStorage.removeItem(kunciSesi)
    onReset()
    area.current?.focus()
  }
  const kosong = pesan.length === 0 && lokal.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex items-center gap-2.5 border-b border-border bg-card px-3 py-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teh" aria-hidden>
          <Coffee className="size-5 text-primary-foreground" />
        </span>
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="flex items-center gap-1.5 text-sm leading-tight font-bold text-foreground">
            Asisten Toko
            <span className="size-2 shrink-0 rounded-full bg-ok" aria-hidden />
          </h2>
          <p className="truncate text-xs leading-tight text-muted-foreground">SOP, stok, dan penjualan toko</p>
        </div>
        <button
          type="button"
          onClick={baru}
          aria-label="Percakapan baru"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <RotateCcw className="size-4.5" aria-hidden />
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Chat"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <ChevronDown className="size-5" aria-hidden />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1" aria-live="polite">
        {riwayat.isLoading && sesiId ? (
          <div className="grid gap-3">
            <Skeleton className="ml-auto h-12 w-2/3" />
            <Skeleton className="h-24 w-4/5" />
          </div>
        ) : riwayat.isError && sesiId ? (
          <AiUnavailableCard title="Riwayat percakapan belum bisa dimuat" onRetry={() => riwayat.refetch()} />
        ) : kosong ? (
          /* Saluran kosong: avatar asisten di samping gelembung sapaan + 4 pil cepat vertikal penuh. */
          <div className="grid gap-4 p-4">
            <div className="flex items-start gap-2.5">
              <AvatarAsisten />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-card p-4">
                <p className="text-sm font-semibold">Halo{pengguna ? `, ${pengguna.nama}` : ""}.</p>
                <p className="mt-0.5 text-xs font-medium text-teh italic">Asisten operasional Mr. Tea &amp; Jasuke</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Saya siap membantu urusan SOP, stok, dan penjualan toko. Tanyakan apa saja, jawaban SOP menyertakan sumber dokumen.
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              {CONTOH.map((c) => (
                <button
                  key={c.teks}
                  type="button"
                  onClick={() => kirimPesan(c.teks)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-teh/40 hover:bg-teh-muda/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <c.ikon className="size-4 shrink-0 text-teh" aria-hidden />
                  <span className="min-w-0 flex-1 leading-5">{c.teks}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="grid gap-4 p-4">
            {pesan.map((m) => (
              <Gelembung key={m.id} m={m} />
            ))}
            {lokal.map((l) => (
              <li key={l.id} className="grid gap-2">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-teh px-4 py-2.5 text-primary-foreground">
                  {l.isi}
                </div>
                {l.status === "kirim" ? (
                  <div className="flex items-center gap-2" aria-label="Asisten sedang mengetik">
                    <AvatarAsisten />
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-teh/30 bg-teh-muda px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 rounded-full bg-teh motion-reduce:animate-none animate-bounce"
                          style={{ animationDelay: `${i * 140}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div role="alert" className="max-w-[85%] rounded-2xl rounded-bl-md border border-warn/30 bg-warn-muda px-4 py-3 text-sm">
                    <p className="text-warn">{l.galat}</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-card" onClick={() => kirimPesan(l.isi, l.id)}>
                      <RotateCcw />
                      Kirim ulang
                    </Button>
                  </div>
                )}
              </li>
            ))}
            <div ref={akhir} />
          </ol>
        )}
      </div>

      {/* Komposer satu bar membulat: input + ikon kirim di kanan, hitungan karakter samar di bawah. */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          kirimPesan(teks)
        }}
        className="sticky bottom-0 mt-3 bg-background pt-1"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 focus-within:border-teh/50 focus-within:ring-2 focus-within:ring-teh/15">
          <label htmlFor="tanya-asisten" className="sr-only">
            Pertanyaan
          </label>
          <textarea
            id="tanya-asisten"
            ref={area}
            value={teks}
            maxLength={MAKS}
            rows={1}
            onChange={(e) => setTeks(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                e.preventDefault()
                kirimPesan(teks)
              }
            }}
            placeholder="Tanya asisten tentang toko..."
            className="max-h-40 min-w-0 flex-1 resize-none bg-transparent px-1 py-1 text-base outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            disabled={!valid || kirim.isPending}
            aria-label="Kirim pertanyaan"
          >
            <SendHorizontal />
          </Button>
        </div>
        <p className={cn("num px-3 pt-1 text-right text-xs", teks.length >= MAKS ? "text-bahaya" : "text-muted-foreground/70")}>
          {teks.length}/{MAKS}
        </p>
      </form>
    </div>
  )
}

function Gelembung({ m }: { m: PesanChat }) {

  if (m.peran === "pengguna")
    return (
      <li className="ml-auto max-w-[85%]">
        <div className="rounded-2xl rounded-br-md bg-teh px-4 py-2.5 whitespace-pre-wrap text-primary-foreground">{m.isi}</div>
        <p className="num mt-1 text-right text-xs text-muted-foreground">{jam(m.waktu)}</p>
      </li>
    )

  return (
    <li className="max-w-[92%]">
      <div className="flex items-start gap-2.5">
        <AvatarAsisten />
        <div
          className={cn(
            "min-w-0 flex-1 rounded-2xl rounded-tl-md border border-teh/30 bg-teh-muda px-4 py-3",
            m.ditolak && "border-border bg-muted/60"
          )}
        >
          {m.ditolak && (
            <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-info">
              <Info className="size-4" aria-hidden />
              Di luar cakupan
            </span>
          )}
          <div className="prose-chat text-[0.95rem] leading-relaxed">
            <Markdown
              allowedElements={["p", "ul", "ol", "li", "strong", "em", "br", "code"]}
              unwrapDisallowed
              components={{
                ul: (p) => <ul className="my-2 list-disc pl-5" {...p} />,
                ol: (p) => <ol className="my-2 list-decimal pl-5" {...p} />,
                p: (p) => <p className="my-1.5 first:mt-0 last:mb-0" {...p} />,
              }}
            >
              {m.isi}
            </Markdown>
          </div>
          {!!m.sumber?.length && (
            <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3" aria-label="Sumber">
              {m.sumber.map((s, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80"
                >
                  <BookOpen className="size-3.5 text-muted-foreground" aria-hidden />
                  {s.judul}
                  {s.bagian ? `, ${s.bagian}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="num mt-1 flex flex-wrap gap-x-2 pl-11 text-xs text-muted-foreground">
        <span>{jam(m.waktu)}</span>
        {m.model && m.model !== "gemini" && <span className="font-medium text-warn">Dijawab oleh model cadangan</span>}
        {!isProduction && m.intent && (
          <span>
            intent: {m.intent}
            {m.latensiMs ? `, ${m.latensiMs} ms` : ""}
          </span>
        )}
      </p>
    </li>
  )
}
