import { useEffect, useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useActiveShift, useCloseShift, useShiftSummary } from "@/api/operations"
import { ErrorState, PageSkeleton } from "@/components/feedback/states"
import { SelisihBadge } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { HelpTooltip, ISTILAH } from "@/components/shared/HelpTooltip"
import { PageHeader, Panel } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toApiError } from "@/lib/api-error"
import { kategoriSelisih, selisihBahan } from "@/lib/calc"
import { angka, bertanda, jam, namaShiftLabel, parseAngka, rupiah, terbaca } from "@/lib/format"
import { cn } from "@/lib/utils"
import { catatanShiftSchema, sesuaiPresisi, stokFisikSchema } from "@/schemas"
import { useCloseShiftDraft } from "@/stores/close-shift-store"
import { useUi } from "@/stores/ui-store"
import type { BarisStokShift, RekapShift } from "@/types/domain"
import { StepIndicator } from "./StepIndicator"

const LANGKAH = ["Ringkasan", "Hitung stok fisik", "Tinjau dan tutup"]

function cekFisik(raw: string | undefined, row: BarisStokShift): string | null {
  const n = parseAngka(raw ?? "", { presisi: row.presisi })
  const r = stokFisikSchema.safeParse(n)
  if (!r.success) return r.error.issues[0]?.message ?? "Isi hasil hitung."
  if (!sesuaiPresisi(n, row.presisi)) return row.presisi === 0 ? `Isi bilangan bulat dalam ${row.satuan}.` : `Maksimal ${row.presisi} angka di belakang koma.`
  return null
}

export default function CloseShiftPage() {
  const { data: shift } = useActiveShift()
  const { data: summary, isLoading, error, refetch } = useShiftSummary(shift?.id)
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isLoading || !summary || !shift) return <PageSkeleton />
  return <Wizard summary={summary} />
}

function Wizard({ summary }: { summary: RekapShift }) {
  const id = summary.shiftId
  const navigate = useNavigate()
  const draft = useCloseShiftDraft((s) => s.drafts[id])
  const { mulai, ubah, setFisik, setCatatan, buang } = useCloseShiftDraft()
  const tutup = useCloseShift()
  const online = useUi((s) => s.online)
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [tampilGalat, setTampilGalat] = useState(false)
  /** Bahan yang menurut server wajib diberi catatan, walau hitungan klien bilang tidak (TUT-05) */
  const [galatServer, setGalatServer] = useState<Record<string, string>>({})

  useEffect(() => {
    mulai(id)
  }, [id, mulai])
  const langkah = draft?.langkah ?? 0
  const fisik = useMemo(() => draft?.fisik ?? {}, [draft?.fisik])
  const catatan = useMemo(() => draft?.catatan ?? {}, [draft?.catatan])

  const rows = useMemo(
    () =>
      summary.stok.map((row) => {
        const galat = cekFisik(fisik[row.bahanId], row)
        const nilai = galat ? null : parseAngka(fisik[row.bahanId], { presisi: row.presisi })
        const selisih = nilai === null ? null : selisihBahan(nilai, row.tercatat, row.presisi)
        const kat = kategoriSelisih(selisih, row.toleransi)
        const pesanServer = galatServer[row.bahanId]
        const butuhCatatan = kat === "lewat" || !!pesanServer
        return { row, galat, nilai, selisih, kat, butuhCatatan, pesanServer, catatanKosong: butuhCatatan && !(catatan[row.bahanId] ?? "").trim() }
      }),
    [summary.stok, fisik, catatan, galatServer],
  )
  const terisi = rows.filter((r) => !r.galat).length
  const semuaTerisi = terisi === rows.length
  const catatanShiftGalat = catatanShiftSchema.safeParse(draft?.catatanShift ?? "").error?.issues[0]?.message
  const kurangCatatan = rows.filter((r) => r.catatanKosong).length

  const ke = (l: 0 | 1 | 2) => {
    ubah(id, { langkah: l })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const kirim = () => {
    const t = toast.loading("Menutup shift...")
    tutup.mutate(
      {
        id,
        data: {
          stokFisik: rows.map((r) => ({ bahanId: r.row.bahanId, jumlah: r.nilai!, catatan: (catatan[r.row.bahanId] ?? "").trim() || undefined })),
          catatanShift: (draft?.catatanShift ?? "").trim() || undefined,
          durasiTutupDetik: Math.round((Date.now() - (draft?.mulai ?? Date.now())) / 1000),
        },
      },
      {
        onSuccess: (rekap) => {
          toast.success(`Shift ${namaShiftLabel[rekap.nama]} ditutup`, { id: t, description: rekap.rekapHarianDibuat ? "Rekap harian sudah dibuat." : "Rekap shift tersimpan." })
          setKonfirmasi(false)
          buang(id)
          navigate(`/shift/${rekap.shiftId}/rekap`, { replace: true, state: { baruDitutup: true } })
        },
        onError: (e) => {
          setKonfirmasi(false)
          const err = toApiError(e)
          // Indeks field mengikuti urutan stokFisik yang dikirim, yaitu urutan rows
          const dariServer: Record<string, string> = {}
          let adaGalatJumlah = false
          for (const f of err.fieldErrors) {
            const m = /^stokFisik.(d+).(catatan|jumlah)$/.exec(f.field)
            const bahanId = m ? rows[Number(m[1])]?.row.bahanId : undefined
            if (!bahanId) continue
            if (m![2] === "catatan") dariServer[bahanId] = f.message
            else adaGalatJumlah = true
          }
          if (Object.keys(dariServer).length) setGalatServer((g) => ({ ...g, ...dariServer }))
          if (adaGalatJumlah) {
            setTampilGalat(true)
            ke(1)
          }
          toast.error("Shift belum ditutup", { id: t, description: err.message, duration: Infinity })
        },
      },
    )
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title={`Tutup Shift ${namaShiftLabel[summary.nama]}`} description={`Dibuka ${summary.dibukaOleh} pukul ${jam(summary.dibukaPada)}`} />
      <StepIndicator steps={LANGKAH} current={langkah} />

      {langkah === 0 && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Pesanan" nilai={angka(summary.jumlahPesanan)} />
            <Stat label="Omzet" nilai={rupiah(summary.omzet)} />
            <Stat label="Toko" nilai={rupiah(summary.omzetPerKanal.toko)} />
            <Stat label="Shopee Food" nilai={rupiah(summary.omzetPerKanal.shopee_food)} />
          </div>
          <Panel title="Barang masuk selama shift" bodyClassName="p-0">
            {summary.barangMasuk.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground">Tidak ada barang masuk di shift ini.</p>
            ) : (
              <ul className="divide-y">
                {summary.barangMasuk.map((b, i) => (
                  <li key={i} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
                    <span>{b.namaBahan}</span>
                    <span className="num font-semibold">+{angka(b.jumlah, 2)} {b.satuan} <span className="font-normal text-muted-foreground">pukul {jam(b.waktu)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <p className="text-sm text-muted-foreground">Pastikan semua pesanan sudah tercatat sebelum menghitung stok. Pesanan yang masuk setelah hitungan akan membuat selisih.</p>
          <div className="flex justify-end">
            <Button size="lg" className="h-12 w-full text-base sm:w-auto" onClick={() => ke(1)}>Mulai hitung stok</Button>
          </div>
        </div>
      )}

      {langkah === 1 && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1 text-sm">
              Hitung isi rak, lalu tulis hasilnya.
              <HelpTooltip istilah="Stok fisik">{ISTILAH.stokFisik} Angka sistem disembunyikan agar hitungan tidak terpengaruh.</HelpTooltip>
            </p>
            <p className="num text-sm font-semibold" aria-live="polite">{terisi} dari {rows.length} bahan terisi</p>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full rounded-full bg-teh transition-[width]" style={{ width: `${(terisi / rows.length) * 100}%` }} />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {rows.map(({ row, galat }) => {
              const tampil = tampilGalat && galat
              const ada = (fisik[row.bahanId] ?? "") !== ""
              return (
                <li key={row.bahanId} className={cn("rounded-xl border bg-card p-3", tampil && "border-bahaya/60")}>
                  <Label htmlFor={`f-${row.bahanId}`} className="text-[0.95rem] font-semibold">{row.namaBahan}</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      id={`f-${row.bahanId}`}
                      inputMode="decimal"
                      enterKeyHint="next"
                      autoComplete="off"
                      value={fisik[row.bahanId] ?? ""}
                      onChange={(e) => {
                        setFisik(id, row.bahanId, e.target.value)
                        if (galatServer[row.bahanId]) setGalatServer(({ [row.bahanId]: _lama, ...sisa }) => sisa)
                      }}
                      aria-invalid={!!tampil}
                      aria-describedby={tampil ? `fe-${row.bahanId}` : undefined}
                      className="num h-11 bg-background text-lg font-semibold"
                      placeholder="0"
                    />
                    <span className="w-12 shrink-0 text-sm text-muted-foreground">{row.satuan}</span>
                  </div>
                  {tampil ? (
                    <p id={`fe-${row.bahanId}`} className="mt-1.5 text-sm text-bahaya">{galat}</p>
                  ) : ada && galat ? (
                    <p className="mt-1.5 text-sm text-warn">{galat}</p>
                  ) : ada ? (
                    <p className="num mt-1.5 text-sm text-muted-foreground">{terbaca(fisik[row.bahanId] ?? "", { presisi: row.presisi, satuan: row.satuan })}</p>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => ke(0)}><ArrowLeft />Kembali</Button>
            <Button
              size="lg"
              className="h-12 text-base"
              onClick={() => {
                if (!semuaTerisi) {
                  setTampilGalat(true)
                  toast.error("Masih ada bahan yang belum diisi", { description: `${rows.length - terisi} bahan perlu hasil hitung yang valid.` })
                  return
                }
                ke(2)
              }}
            >
              Tinjau selisih
            </Button>
          </div>
        </div>
      )}

      {langkah === 2 && (
        <div>
          <div className="mb-3 flex items-center gap-1 text-sm">
            Selisih = stok fisik dikurangi stok tercatat.
            <HelpTooltip istilah="Toleransi">{ISTILAH.toleransi}</HelpTooltip>
          </div>
          <ul className="grid gap-2">
            {rows.map(({ row, nilai, selisih, kat, butuhCatatan, pesanServer, catatanKosong }) => (
              <li key={row.bahanId} className={cn("rounded-xl border bg-card p-3.5", kat === "lewat" && "border-bahaya/40 bg-bahaya-muda/30")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">{row.namaBahan}</p>
                  <SelisihBadge kategori={kat} />
                </div>
                <dl className="num mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="text-muted-foreground">Tercatat</dt><dd className="font-medium">{angka(row.tercatat, Math.max(row.presisi, 2))} {row.satuan}</dd></div>
                  <div><dt className="text-muted-foreground">Fisik</dt><dd className="font-medium">{nilai !== null ? angka(nilai, row.presisi) : "-"} {row.satuan}</dd></div>
                  <div>
                    <dt className="text-muted-foreground">Selisih</dt>
                    <dd className={cn("font-bold", kat === "lewat" && "text-bahaya", kat === "selisih" && "text-warn", kat === "sesuai" && "text-ok")}>{selisih !== null ? bertanda(selisih, Math.max(row.presisi, 2)) : "-"}</dd>
                  </div>
                </dl>
                {butuhCatatan && (
                  <div className="mt-3 grid gap-1.5">
                    <Label htmlFor={`c-${row.bahanId}`} className="text-sm">Catatan selisih (wajib, toleransi {angka(row.toleransi, Math.max(row.presisi, 2))} {row.satuan})</Label>
                    <Input
                      id={`c-${row.bahanId}`}
                      value={catatan[row.bahanId] ?? ""}
                      maxLength={120}
                      onChange={(e) => setCatatan(id, row.bahanId, e.target.value)}
                      placeholder="Contoh: tumpah saat isi ulang wadah"
                      aria-invalid={catatanKosong}
                      aria-describedby={pesanServer ? `cs-${row.bahanId}` : undefined}
                      className="h-10 bg-background"
                    />
                    {pesanServer && catatanKosong && <p id={`cs-${row.bahanId}`} className="text-sm text-bahaya">{pesanServer}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-1.5">
            <Label htmlFor="catatan-shift">Catatan shift <span className="font-normal text-muted-foreground">(opsional)</span></Label>
            <Textarea id="catatan-shift" value={draft?.catatanShift ?? ""} onChange={(e) => ubah(id, { catatanShift: e.target.value })} rows={3} placeholder="Contoh: mesin sealer sempat macet pukul 11.00" aria-invalid={!!catatanShiftGalat} className="bg-card" />
            <p className={cn("num text-right text-xs", catatanShiftGalat ? "text-bahaya" : "text-muted-foreground")}>{(draft?.catatanShift ?? "").length}/300</p>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={() => ke(1)}><ArrowLeft />Ubah hitungan</Button>
            <div className="flex flex-col items-stretch gap-1 sm:items-end">
              <Button size="lg" className="h-12 text-base" disabled={!semuaTerisi || kurangCatatan > 0 || !!catatanShiftGalat || !online || tutup.isPending} onClick={() => setKonfirmasi(true)}>
                Tutup Shift
              </Button>
              {kurangCatatan > 0 && <p className="text-sm text-bahaya">{kurangCatatan} bahan perlu catatan selisih.</p>}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={konfirmasi}
        onOpenChange={setKonfirmasi}
        title={`Tutup Shift ${namaShiftLabel[summary.nama]}?`}
        description="Shift yang sudah ditutup tidak dapat dibuka kembali. Stok akan disamakan dengan hasil hitung fisik."
        confirmLabel="Tutup Shift"
        onConfirm={kirim}
        pending={tutup.isPending}
      />
    </div>
  )
}

function Stat({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="rounded-xl border bg-card px-3.5 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="num mt-0.5 text-lg font-bold">{nilai}</p>
    </div>
  )
}
