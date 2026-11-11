import { useEffect, useMemo, useRef, useState } from "react"
import Markdown from "react-markdown"
import { BookOpen, Info, RotateCcw, SendHorizontal, SquarePen } from "lucide-react"
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

const CONTOH = ["Bagaimana cara menutup shift?", "Berapa sisa stok gula pasir?", "Omzet hari ini berapa?", "Cara mencatat pesanan Shopee Food?"]
const MAKS = 500

interface Lokal {
  id: string
  isi: string
  status: "kirim" | "gagal"
  galat?: string
}

export default function AssistantPage() {
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
          const galat = err.status === 429 ? "Terlalu banyak pertanyaan, coba lagi sebentar lagi." : err.isAiUnavailable || err.code === "TIMEOUT" ? "Asisten sedang tidak tersedia. Fitur lain tetap bisa dipakai." : err.message
          setLokal((l) => l.map((x) => (x.id === id ? { ...x, status: "gagal", galat } : x)))
        },
      },
    )
  }

  const baru = () => {
    setSesiId(undefined)
    setLokal([])
    localStorage.removeItem(kunciSesi)
    area.current?.focus()
  }

  const kosong = pesan.length === 0 && lokal.length === 0

  return (
    <div className="mx-auto flex max-w-3xl flex-col lg:min-h-[calc(100dvh-8.5rem)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asisten Toko</h1>
          <p className="text-sm text-muted-foreground">Tanya SOP, sisa stok, atau penjualan hari ini.</p>
        </div>
        {!kosong && <Button variant="outline" size="sm" onClick={baru}><SquarePen />Percakapan baru</Button>}
      </div>

      <div className="flex-1" aria-live="polite">
        {riwayat.isLoading && sesiId ? (
          <div className="grid gap-3"><Skeleton className="ml-auto h-12 w-2/3" /><Skeleton className="h-24 w-4/5" /></div>
        ) : riwayat.isError && sesiId ? (
          <AiUnavailableCard title="Riwayat percakapan belum bisa dimuat" onRetry={() => riwayat.refetch()} />
        ) : kosong ? (
          <div className="rounded-xl border bg-card p-5">
            <p className="font-semibold">Halo{pengguna ? `, ${pengguna.nama}` : ""}.</p>
            <p className="mt-1 text-sm text-muted-foreground">Saya menjawab pertanyaan seputar SOP, stok, dan penjualan toko. Jawaban SOP disertai sumber dokumennya.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CONTOH.map((c) => (
                <button key={c} type="button" onClick={() => kirimPesan(c)} className="rounded-full border bg-background px-3.5 py-2 text-left text-sm font-medium hover:border-teh/40 hover:bg-teh-muda/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="grid gap-4">
            {pesan.map((m) => <Gelembung key={m.id} m={m} />)}
            {lokal.map((l) => (
              <li key={l.id} className="grid gap-2">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-teh px-4 py-2.5 text-primary-foreground">{l.isi}</div>
                {l.status === "kirim" ? (
                  <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border bg-card px-4 py-3" aria-label="Asisten sedang mengetik">
                    {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 140}ms` }} />)}
                  </div>
                ) : (
                  <div role="alert" className="max-w-[85%] rounded-2xl rounded-bl-md border border-warn/30 bg-warn-muda px-4 py-3 text-sm">
                    <p className="text-warn">{l.galat}</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-card" onClick={() => kirimPesan(l.isi, l.id)}><RotateCcw />Kirim ulang</Button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={akhir} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          kirimPesan(teks)
        }}
        className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-4 lg:bottom-4"
      >
        <div className="rounded-2xl border bg-card p-2 shadow-lg shadow-tinta/5 focus-within:border-teh/50 focus-within:ring-2 focus-within:ring-teh/15">
          <label htmlFor="tanya" className="sr-only">Pertanyaan</label>
          <textarea
            id="tanya"
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
            placeholder="Tulis pertanyaan"
            className="block max-h-40 w-full resize-none bg-transparent px-2 py-2 text-base outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 px-1">
            <span className={cn("num text-xs", teks.length >= MAKS ? "text-bahaya" : "text-muted-foreground")}>{teks.length}/{MAKS}</span>
            <Button type="submit" size="icon" className="size-10 rounded-xl" disabled={!valid || kirim.isPending} aria-label="Kirim pertanyaan">
              <SendHorizontal />
            </Button>
          </div>
        </div>
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
      <div className={cn("rounded-2xl rounded-bl-md border bg-card px-4 py-3", m.ditolak && "bg-muted/60")}>
        {m.ditolak && <Info className="mb-1 size-4 text-info" aria-label="Di luar cakupan" />}
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
          <ul className="mt-3 flex flex-wrap gap-1.5 border-t pt-3" aria-label="Sumber">
            {m.sumber.map((s, i) => (
              <li key={i} className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80">
                <BookOpen className="size-3.5 text-teh" aria-hidden />
                {s.judul}{s.bagian ? `, ${s.bagian}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
        <span className="num">{jam(m.waktu)}</span>
        {m.model && m.model !== "gemini" && <span className="font-medium text-warn">Dijawab oleh model cadangan</span>}
        {!isProduction && m.intent && <span className="num">intent: {m.intent}{m.latensiMs ? `, ${m.latensiMs} ms` : ""}</span>}
      </p>
    </li>
  )
}
