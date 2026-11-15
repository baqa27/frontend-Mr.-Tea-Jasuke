import { useEffect, useState } from "react"
import { ClipboardCheck, CupSoda, PackagePlus } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { useActiveShift, useOpenShift, useOpeningPreview, useShiftSummary } from "@/api/operations"
import { ErrorState, ListSkeleton, PageSkeleton } from "@/components/feedback/states"
import { Panel, PageHeader } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useSession } from "@/features/auth/session"
import { toApiError } from "@/lib/api-error"
import { angka, jam, namaShiftLabel, rupiah, tanggalPanjang, tanggalPendek } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { NamaShift, Shift } from "@/types/domain"

const SHIFTS: NamaShift[] = ["pagi", "siang", "malam"]

export default function ShiftPage() {
  const { data: shift, isLoading, error, refetch } = useActiveShift()
  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  return shift ? <ShiftAktif shift={shift} /> : <BukaShift />
}

function ShiftAktif({ shift }: { shift: Shift }) {
  const { pengguna } = useSession()
  const { data: s } = useShiftSummary(shift.id)
  const milikSaya = pengguna?.id === shift.dibukaOleh.id
  return (
    <>
      <PageHeader
        title={`Shift ${namaShiftLabel[shift.nama]} sedang berjalan`}
        description={`${tanggalPanjang(shift.tanggal)}. Dibuka ${milikSaya ? "oleh kamu" : `oleh ${shift.dibukaOleh.nama}`} pukul ${jam(shift.dibukaPada)}.`}
      />
      {!milikSaya && (
        <p className="mb-4 rounded-lg bg-info-muda px-3.5 py-2.5 text-sm text-info">
          Shift ini dibuka {shift.dibukaOleh.nama}. Kamu tetap bisa mencatat pesanan dan barang masuk di shift ini.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <Angka label="Pesanan" nilai={s ? angka(s.jumlahPesanan) : "..."} />
        <Angka label="Omzet sementara" nilai={s ? rupiah(s.omzet) : "..."} />
        <Angka label="Barang masuk" nilai={s ? `${s.barangMasuk.length} catatan` : "..."} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <AksiBesar to="/pos" icon={CupSoda} judul="Catat pesanan" ket="Buka PoS untuk pesanan Toko dan Shopee Food" utama />
        <AksiBesar to="/stok/barang-masuk" icon={PackagePlus} judul="Catat barang masuk" ket="Tambah stok setelah belanja bahan" />
        <AksiBesar to="/shift/tutup" icon={ClipboardCheck} judul="Tutup shift" ket="Hitung stok fisik dan lihat selisihnya" tour="tutup-shift" />
      </div>
    </>
  )
}

function Angka({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="num mt-1 text-2xl font-bold tracking-tight">{nilai}</p>
    </div>
  )
}

function AksiBesar({ to, icon: Icon, judul, ket, utama, tour }: { to: string; icon: React.ElementType; judul: string; ket: string; utama?: boolean; tour?: string }) {
  return (
    <Link
      to={to}
      data-tour={tour}
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        utama ? "border-teh bg-teh text-primary-foreground hover:bg-teh-tua" : "bg-card hover:border-teh/40 hover:bg-teh-muda/40",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", utama ? "bg-primary-foreground text-primary" : "bg-teh-muda text-teh")}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold">{judul}</span>
        <span className={cn("mt-0.5 block text-sm", utama ? "text-primary-foreground" : "text-muted-foreground")}>{ket}</span>
      </span>
    </Link>
  )
}

function BukaShift() {
  const navigate = useNavigate()
  const { data: pv, isLoading, error, refetch } = useOpeningPreview()
  const buka = useOpenShift()
  const [nama, setNama] = useState<NamaShift | null>(null)
  const [cek, setCek] = useState(false)

  useEffect(() => {
    if (pv && !nama) setNama(pv.namaShiftUsulan)
  }, [pv, nama])

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  const submit = () => {
    if (!nama || !cek) return
    const t = toast.loading("Membuka shift...")
    buka.mutate(
      { nama, konfirmasiStokAwal: true },
      {
        onSuccess: (s) => {
          toast.success(`Shift ${namaShiftLabel[s.nama]} dibuka`, { id: t, description: "Selamat bekerja. Pesanan sekarang bisa dicatat." })
          navigate("/pos")
        },
        onError: (e) => {
          const err = toApiError(e)
          toast.error("Shift belum dibuka", { id: t, description: err.message, duration: Infinity })
          refetch()
        },
      },
    )
  }

  return (
    <>
      <PageHeader title="Buka shift" description={pv ? `Untuk ${tanggalPanjang(pv.tanggal)}` : "Memuat data shift..."} />
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-5">
        <Panel
          className="lg:col-start-1 lg:row-start-1"
          title="Stok awal"
          bodyClassName="p-0 md:p-0"
          action={pv?.sumber && (
            <Link to={`/shift/${pv.sumber.shiftId}/rekap`} className="text-sm font-medium text-teh hover:underline">
              Lihat rekap shift sebelumnya
            </Link>
          )}
        >
          <p className="border-b px-4 py-3 text-sm text-muted-foreground">
            {pv?.sumber
              ? `Diambil dari penutupan Shift ${namaShiftLabel[pv.sumber.nama]}, ${tanggalPendek(pv.sumber.tanggal)}, oleh ${pv.sumber.ditutupOleh}. Cocokkan dengan isi rak sebelum mulai.`
              : "Belum ada shift sebelumnya. Stok awal diambil dari data master bahan."}
          </p>
          <div>
            {isLoading || !pv ? (
              <div className="p-4"><ListSkeleton rows={6} /></div>
            ) : (
              <ResponsiveTable
                dense
                flush
                caption="Stok awal setiap bahan"
                rows={pv.stokAwal}
                rowKey={(r) => r.bahanId}
                columns={[
                  { key: "nama", header: "Bahan", cell: (r) => r.namaBahan, mobile: "title" },
                  { key: "jumlah", header: "Stok awal", align: "right", mobile: "aside", cell: (r) => <span className="num font-semibold">{angka(r.jumlah, r.presisi)} <span className="font-normal text-muted-foreground">{r.satuan}</span></span> },
                ]}
              />
            )}
          </div>
        </Panel>

        <div className="contents lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:grid lg:gap-3">
          <fieldset className="order-first rounded-xl border bg-card p-4 lg:order-none">
            <legend className="sr-only">Shift yang dibuka</legend>
            <p className="text-sm font-semibold" aria-hidden>Shift yang dibuka</p>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Nama shift">
              {SHIFTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={nama === s}
                  onClick={() => setNama(s)}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    nama === s ? "border-teh bg-teh text-primary-foreground" : "bg-background hover:bg-accent",
                  )}
                >
                  {namaShiftLabel[s]}
                </button>
              ))}
            </div>
            {pv && nama && nama !== pv.namaShiftUsulan && (
              <p className="mt-2 text-sm text-warn">Urutan hari ini menyarankan Shift {namaShiftLabel[pv.namaShiftUsulan]}.</p>
            )}
          </fieldset>
          <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 rounded-xl border bg-card p-3 shadow-lg shadow-tinta/10 lg:static lg:p-4 lg:shadow-none">
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
              <Checkbox id="cek-stok" checked={cek} onCheckedChange={(v) => setCek(v === true)} className="mt-0.5 size-5" />
              <Label htmlFor="cek-stok" className="leading-snug font-normal">
                Saya sudah memeriksa stok awal dan isinya sesuai dengan rak.
              </Label>
            </div>
            <Button size="lg" className="mt-3 h-12 w-full text-base" disabled={!cek || !nama || buka.isPending || !pv} onClick={submit}>
              {buka.isPending && <Spinner />}
              Buka Shift
            </Button>
            {(!cek || !nama) && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Centang konfirmasi stok awal untuk membuka shift.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
