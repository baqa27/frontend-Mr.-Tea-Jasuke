import { useRef, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { useIngredients } from "@/api/catalog"
import { useStockIn } from "@/api/operations"
import { ErrorState, ListSkeleton } from "@/components/feedback/states"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { toApiError } from "@/lib/api-error"
import { angka, parseAngka, terbaca } from "@/lib/format"
import { uuid } from "@/lib/uuid"
import { cn } from "@/lib/utils"
import { sesuaiPresisi, stockInSchema } from "@/schemas"
import { useUi } from "@/stores/ui-store"

interface Baris {
  key: string
  bahanId: string
  jumlah: string
  catatan: string
}
const barisBaru = (): Baris => ({ key: uuid(), bahanId: "", jumlah: "", catatan: "" })

export default function StockInPage() {
  const navigate = useNavigate()
  const { data: bahan, isLoading, error, refetch } = useIngredients()
  const simpan = useStockIn()
  const online = useUi((s) => s.online)
  const [rows, setRows] = useState<Baris[]>([barisBaru()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  /** ID per isi form: isi yang sama memakai ID yang sama, isi yang berubah mendapat ID baru (STK-06) */
  const idPerIsi = useRef(new Map<string, string>())
  const idUntuk = (items: { bahanId: string; jumlah: number; catatan?: string }[]) => {
    const kunci = JSON.stringify([...items].map((i) => [i.bahanId, i.jumlah, i.catatan ?? ""]).sort())
    let id = idPerIsi.current.get(kunci)
    if (!id) {
      id = uuid()
      idPerIsi.current.set(kunci, id)
    }
    return { id, kunci }
  }

  const aktif = (bahan ?? []).filter((b) => b.aktif)
  const byId = new Map(aktif.map((b) => [b.id, b]))
  const ubah = (key: string, patch: Partial<Baris>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const items = rows.map((r) => ({ bahanId: r.bahanId, jumlah: parseAngka(r.jumlah, { presisi: byId.get(r.bahanId)?.presisi ?? 2 }), catatan: r.catatan.trim() || undefined }))
    const res = stockInSchema.safeParse({ items })
    const errs: Record<string, string> = {}
    if (!res.success) for (const i of res.error.issues) errs[i.path.join(".")] ??= i.message
    items.forEach((it, i) => {
      const b = byId.get(it.bahanId)
      if (b && Number.isFinite(it.jumlah) && !sesuaiPresisi(it.jumlah, b.presisi) && !errs[`items.${i}.jumlah`])
        errs[`items.${i}.jumlah`] = b.presisi === 0 ? `Jumlah ${b.satuan} berupa bilangan bulat.` : `Maksimal ${b.presisi} angka di belakang koma.`
    })
    setErrors(errs)
    if (Object.keys(errs).length) return

    const t = toast.loading("Menyimpan barang masuk...")
    const { id: requestId, kunci } = idUntuk(items)
    simpan.mutate(
      { clientRequestId: requestId, items: items as { bahanId: string; jumlah: number; catatan?: string }[] },
      {
        onSuccess: () => {
          toast.success("Barang masuk tersimpan", { id: t, description: `${items.length} bahan bertambah stoknya.` })
          navigate("/stok")
        },
        onError: (er) => {
          const err = toApiError(er)
          if (err.code === "DUPLICATE_REQUEST") {
            const lama = (Array.isArray(err.data) ? err.data : []) as { bahanId: string; jumlah: number }[]
            const sama = lama.length === items.length && items.every((it) => lama.some((m) => m.bahanId === it.bahanId && m.jumlah === it.jumlah))
            if (sama) {
              toast.success("Barang masuk sudah tersimpan", { id: t })
              navigate("/stok")
              return
            }
            idPerIsi.current.set(kunci, uuid())
            toast.error("Barang masuk ini belum disimpan", { id: t, description: "Catatan barang masuk sebelumnya sudah tersimpan. Isian ini belum disimpan. Tekan Simpan Barang Masuk lagi.", duration: Infinity })
            return
          }
          const fe: Record<string, string> = {}
          for (const f of err.fieldErrors) fe[f.field] = f.message
          setErrors(fe)
          toast.error("Barang masuk belum tersimpan", { id: t, description: err.message, duration: Infinity })
        },
      },
    )
  }

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <>
      <PageHeader title="Catat barang masuk" description="Tambahkan bahan yang baru dibeli. Stok bertambah setelah disimpan." />
      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : (
        <form onSubmit={submit} noValidate className="max-w-3xl">
          {errors.items && <p className="mb-3 text-sm text-bahaya">{errors.items}</p>}
          <ol className="grid gap-3">
            {rows.map((r, i) => {
              const b = byId.get(r.bahanId)
              const n = parseAngka(r.jumlah, { presisi: b?.presisi ?? 2 })
              const eBahan = errors[`items.${i}.bahanId`]
              const eJumlah = errors[`items.${i}.jumlah`]
              const dipakai = new Set(rows.filter((x) => x.key !== r.key).map((x) => x.bahanId))
              return (
                <li key={r.key} className="rounded-xl border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground">Bahan {i + 1}</p>
                    {rows.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} className="text-muted-foreground hover:text-bahaya">
                        <Trash2 />
                        Hapus baris
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`bahan-${r.key}`}>Bahan</Label>
                      <NativeSelect id={`bahan-${r.key}`} value={r.bahanId} onChange={(e) => ubah(r.key, { bahanId: e.target.value })} aria-invalid={!!eBahan} className="h-11 bg-background text-base">
                        <NativeSelectOption value="">Pilih bahan</NativeSelectOption>
                        {aktif.map((x) => (
                          <NativeSelectOption key={x.id} value={x.id} disabled={dipakai.has(x.id)}>
                            {x.nama} ({x.satuan})
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      {eBahan && <p className="text-sm text-bahaya">{eBahan}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`jumlah-${r.key}`}>Jumlah masuk{b ? ` (${b.satuan})` : ""}</Label>
                      <Input id={`jumlah-${r.key}`} inputMode="decimal" value={r.jumlah} onChange={(e) => ubah(r.key, { jumlah: e.target.value })} aria-invalid={!!eJumlah} className="num h-11 bg-background text-base" placeholder="0" />
                      {eJumlah ? (
                        <p className="text-sm text-bahaya">{eJumlah}</p>
                      ) : (
                        r.jumlah.trim() !== "" && <p className="num text-sm text-muted-foreground">{terbaca(r.jumlah, { presisi: b?.presisi ?? 2, satuan: b?.satuan })}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    <Label htmlFor={`catatan-${r.key}`}>Catatan <span className="font-normal text-muted-foreground">(opsional)</span></Label>
                    <Input id={`catatan-${r.key}`} value={r.catatan} maxLength={100} onChange={(e) => ubah(r.key, { catatan: e.target.value })} placeholder="Contoh: beli di Pasar Induk" className="h-10 bg-background" />
                  </div>
                  {b && (
                    <p className={cn("num mt-3 rounded-lg bg-muted/70 px-3 py-2 text-sm", Number.isFinite(n) && n > 0 ? "text-foreground" : "text-muted-foreground")}>
                      Stok sekarang {angka(b.stokSaatIni, b.presisi)} {b.satuan}
                      {Number.isFinite(n) && n > 0 && (
                        <>
                          , setelah masuk <strong>{angka(b.stokSaatIni + n, Math.max(b.presisi, 2))} {b.satuan}</strong>
                        </>
                      )}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
          <Button type="button" variant="outline" className="mt-3 w-full border-dashed sm:w-auto" onClick={() => setRows((x) => [...x, barisBaru()])} disabled={rows.length >= aktif.length}>
            <Plus />
            Tambah bahan lain
          </Button>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" asChild>
              <Link to="/stok">Batal</Link>
            </Button>
            <Button type="submit" size="lg" disabled={simpan.isPending || !online} className="h-12 text-base">
              {simpan.isPending && <Spinner />}
              Simpan Barang Masuk
            </Button>
          </div>
        </form>
      )}
    </>
  )
}
