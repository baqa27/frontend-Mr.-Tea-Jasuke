import { useState } from "react"
import { CheckCircle2, ClipboardList } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { useActiveShift, useOrders } from "@/api/operations"
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback/states"
import { KanalBadge } from "@/components/shared/badges"
import { PageHeader } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSession } from "@/features/auth/session"
import { isoTanggal, jam, kanalLabel, namaShiftLabel, rupiah, tanggalPanjang } from "@/lib/format"
import type { Pesanan, TingkatGula } from "@/types/domain"

const gulaLabel: Record<TingkatGula, string> = { kurang: "Kurang", normal: "Normal", ekstra: "Ekstra" }

export default function OrdersPage() {
  const { isPemilik } = useSession()
  const { data: shift } = useActiveShift()
  const [params, setParams] = useSearchParams()
  const tanggal = params.get("tanggal") ?? isoTanggal(new Date())
  const page = Number(params.get("page") ?? 1)
  const [detail, setDetail] = useState<Pesanan | null>(null)

  const filter = isPemilik ? { tanggal, page } : { shiftId: shift?.id, page }
  const { data, isLoading, error, refetch, isFetching } = useOrders(filter, isPemilik || !!shift)
  const totalHalaman = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v === null) next.delete(k)
    else next.set(k, v)
    if (k !== "page") next.delete("page")
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Riwayat pesanan"
        description={isPemilik ? tanggalPanjang(tanggal) : shift ? `Shift ${namaShiftLabel[shift.nama]} yang sedang berjalan` : "Belum ada shift aktif"}
        actions={
          isPemilik && (
            <div className="flex items-center gap-2">
              <Label htmlFor="tgl" className="sr-only">Tanggal</Label>
              <Input id="tgl" type="date" value={tanggal} max={isoTanggal(new Date())} onChange={(e) => e.target.value && set("tanggal", e.target.value)} className="h-9 w-auto bg-card" />
            </div>
          )
        }
      />

      {!isPemilik && !shift ? (
        <EmptyState icon={ClipboardList} title="Belum ada shift aktif" action={<Button asChild><Link to="/shift">Buka Shift</Link></Button>}>
          Riwayat menampilkan pesanan di shift yang sedang berjalan.
        </EmptyState>
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <ListSkeleton />
      ) : (
        <>
          {data.ringkasan && (
            <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Ringkas label="Pesanan" nilai={String(data.ringkasan.jumlahPesanan)} />
              <Ringkas label="Omzet" nilai={rupiah(data.ringkasan.omzet)} />
              <Ringkas label="Toko" nilai={rupiah(data.ringkasan.omzetPerKanal.toko)} />
              <Ringkas label="Shopee Food" nilai={rupiah(data.ringkasan.omzetPerKanal.shopee_food)} />
            </dl>
          )}
          {data.items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={isPemilik ? "Tidak ada pesanan di tanggal ini" : "Belum ada pesanan di shift ini"}
              action={!isPemilik && <Button asChild><Link to="/pos">Buka PoS</Link></Button>}
            >
              {isPemilik ? "Pilih tanggal lain untuk melihat riwayat." : "Pesanan yang disimpan di PoS akan langsung muncul di sini."}
            </EmptyState>
          ) : (
            <div aria-busy={isFetching}>
              <ResponsiveTable
                caption="Daftar pesanan"
                rows={data.items}
                rowKey={(r) => r.id}
                onRowClick={setDetail}
                columns={[
                  { key: "nomor", header: "Nomor", mobile: "title", cell: (r) => <span className="num font-semibold">{r.nomor}</span> },
                  { key: "jam", header: "Jam", cell: (r) => <span className="num">{jam(r.dibuatPada)}</span> },
                  { key: "kanal", header: "Kanal", cell: (r) => <KanalBadge kanal={r.kanal} /> },
                  { key: "item", header: "Item", cell: (r) => <span className="line-clamp-2 text-left text-foreground/80">{r.items.map((i) => `${i.jumlah}x ${i.namaMenu}${i.tingkatGula ? `, gula ${gulaLabel[i.tingkatGula].toLowerCase()}` : ""}`).join(", ")}</span>, className: "max-w-sm" },
                  { key: "status", header: "Status", cell: () => <span className="inline-flex items-center gap-1.5 font-medium text-ok"><CheckCircle2 className="size-4" aria-hidden />Tersimpan</span> },
                  { key: "total", header: "Total", align: "right", mobile: "aside", cell: (r) => <span className="num font-semibold">{rupiah(r.total)}</span> },
                ]}
              />
            </div>
          )}
          {totalHalaman > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Halaman {page} dari {totalHalaman}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => set("page", String(page - 1))}>Sebelumnya</Button>
                <Button variant="outline" size="sm" disabled={page >= totalHalaman} onClick={() => set("page", String(page + 1))}>Berikutnya</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="num">{detail.nomor}</SheetTitle>
                <SheetDescription>
                  {tanggalPanjang(detail.dibuatPada)}, {jam(detail.dibuatPada)}. Dicatat {detail.dibuatOleh.nama}, kanal {kanalLabel[detail.kanal]}.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <ul className="divide-y divide-dashed divide-input border-y border-dashed border-input">
                  {detail.items.map((i) => (
                    <li key={i.menuId} className="flex justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium">{i.namaMenu}</p>
                        <p className="num text-sm text-muted-foreground">{i.jumlah} x {rupiah(i.hargaSatuan)}</p>
                        {i.tingkatGula && <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Gula: {gulaLabel[i.tingkatGula]}</span>}
                      </div>
                      <p className="num font-semibold">{rupiah(i.subtotal)}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline justify-between py-4">
                  <span className="font-semibold">Total</span>
                  <span className="num text-2xl font-extrabold">{rupiah(detail.total)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function Ringkas({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="rounded-xl border bg-card px-3.5 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="num mt-0.5 text-lg font-bold">{nilai}</dd>
    </div>
  )
}
