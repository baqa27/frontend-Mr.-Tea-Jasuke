import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { useBahanStatus, useIngredients, useSaveBahan } from "@/api/catalog"
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback/states"
import { Pill } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Field } from "@/components/shared/Field"
import { HelpTooltip, ISTILAH } from "@/components/shared/HelpTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { toApiError } from "@/lib/api-error"
import { angka, parseAngka } from "@/lib/format"
import { cn } from "@/lib/utils"
import { bahanSchema, type BahanValues } from "@/schemas"
import type { Bahan } from "@/types/domain"

export default function IngredientMasterPage() {
  const { data, isLoading, error, refetch } = useIngredients()
  const status = useBahanStatus()
  const [edit, setEdit] = useState<Bahan | "baru" | null>(null)
  const [nonaktif, setNonaktif] = useState<Bahan | null>(null)

  const ubahStatus = (b: Bahan, aktif: boolean) => {
    const t = toast.loading(aktif ? `Mengaktifkan ${b.nama}...` : `Menonaktifkan ${b.nama}...`)
    status.mutate(
      { id: b.id, aktif },
      {
        onSuccess: () => {
          toast.success(aktif ? `${b.nama} diaktifkan` : `${b.nama} dinonaktifkan`, { id: t })
          setNonaktif(null)
        },
        onError: (e) => {
          const err = toApiError(e)
          const menu = (err.data as { menu?: string[] } | undefined)?.menu
          toast.error(aktif ? "Bahan belum bisa diaktifkan" : "Bahan belum bisa dinonaktifkan", {
            id: t,
            description: menu?.length ? `${err.message} Lepas dulu dari: ${menu.join(", ")}.` : err.message,
            duration: Infinity,
          })
          setNonaktif(null)
        },
      },
    )
  }

  return (
    <>
      <PageHeader title="Bahan baku" description="Satuan, stok minimum, dan toleransi selisih setiap bahan." actions={<Button onClick={() => setEdit("baru")}><Plus />Tambah bahan</Button>} />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListSkeleton rows={8} />
      ) : !data?.length ? (
        <EmptyState title="Belum ada bahan" action={<Button onClick={() => setEdit("baru")}><Plus />Tambah bahan</Button>}>Tambahkan bahan sebelum menyusun takaran menu.</EmptyState>
      ) : (
        <ResponsiveTable
          caption="Daftar bahan baku"
          rows={data}
          rowKey={(b) => b.id}
          rowClassName={(b) => (!b.aktif ? "text-muted-foreground" : undefined)}
          columns={[
            { key: "nama", header: "Bahan", mobile: "title", cell: (b) => <span className="font-semibold">{b.nama}</span> },
            { key: "status", header: "Status", mobile: "aside", cell: (b) => (b.aktif ? <Pill tone="ok">Aktif</Pill> : <Pill>Nonaktif</Pill>) },
            { key: "satuan", header: "Satuan", cell: (b) => b.satuan },
            { key: "stok", header: "Stok", align: "right", cell: (b) => <span className="num">{angka(b.stokSaatIni, b.presisi)}</span> },
            { key: "min", label: "Minimum", header: <span className="inline-flex items-center gap-1">Minimum <HelpTooltip istilah="Stok minimum">{ISTILAH.stokMinimum}</HelpTooltip></span>, align: "right", cell: (b) => <span className="num">{angka(b.stokMinimum, b.presisi)}</span> },
            { key: "tol", label: "Toleransi", header: <span className="inline-flex items-center gap-1">Toleransi <HelpTooltip istilah="Toleransi selisih">{ISTILAH.toleransi}</HelpTooltip></span>, align: "right", cell: (b) => <span className="num">{angka(b.toleransiSelisih, 2)}</span> },
            {
              key: "aksi", label: "", header: <span className="sr-only">Aksi</span>, align: "right",
              headerClassName: "w-[216px]",
              className: "w-[216px]",
              cell: (b) => (
                <div className="flex justify-end items-center gap-1 whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={() => setEdit(b)}><Pencil />Ubah</Button>
                  {b.aktif ? (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-bahaya" onClick={() => setNonaktif(b)}>Nonaktifkan</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => ubahStatus(b, true)}>Aktifkan</Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-md">{edit && <BahanForm bahan={edit === "baru" ? null : edit} onDone={() => setEdit(null)} />}</SheetContent>
      </Sheet>
      <ConfirmDialog
        open={!!nonaktif}
        onOpenChange={(o) => !o && setNonaktif(null)}
        title={`Nonaktifkan ${nonaktif?.nama}?`}
        description="Bahan tidak dihitung lagi saat buka dan tutup shift. Bahan yang masih dipakai di takaran menu aktif tidak bisa dinonaktifkan."
        confirmLabel="Nonaktifkan"
        destructive
        pending={status.isPending}
        onConfirm={() => nonaktif && ubahStatus(nonaktif, false)}
      />
    </>
  )
}

/** Angka bahan dibaca sesuai presisi yang dipilih di form: gram dan pcs memakai titik sebagai ribuan */
const toAngka = (presisi: number) => (v: unknown) => (typeof v === "number" ? v : parseAngka(String(v ?? ""), { presisi }))
const pratinjau = (n: unknown, satuan: string, presisi: number) =>
  typeof n === "number" && Number.isFinite(n) ? `Terbaca: ${angka(n, Math.max(presisi, 2))} ${satuan}` : undefined

function BahanForm({ bahan, onDone }: { bahan: Bahan | null; onDone: () => void }) {
  const simpan = useSaveBahan()
  const { register, handleSubmit, formState, setError, watch } = useForm<BahanValues>({
    resolver: zodResolver(bahanSchema),
    defaultValues: bahan
      ? { nama: bahan.nama, satuan: bahan.satuan, presisi: bahan.presisi, stokMinimum: bahan.stokMinimum, toleransiSelisih: bahan.toleransiSelisih }
      : { nama: "", satuan: "gram", presisi: 0, stokMinimum: Number.NaN, toleransiSelisih: Number.NaN, stokAwal: Number.NaN },
  })
  const e = formState.errors
  const presisi = Number(watch("presisi") ?? 0)
  const satuan = watch("satuan") ?? ""
  const [stokMinimum, toleransiSelisih, stokAwal] = watch(["stokMinimum", "toleransiSelisih", "stokAwal"])
  const onSubmit = handleSubmit((v) => {
    const t = toast.loading(bahan ? `Menyimpan ${v.nama}...` : `Menambahkan ${v.nama}...`)
    simpan.mutate(
      { id: bahan?.id, data: bahan ? { ...v, stokAwal: undefined } : v },
      {
        onSuccess: (b) => {
          toast.success(bahan ? `${b.nama} diperbarui` : `${b.nama} ditambahkan`, { id: t })
          onDone()
        },
        onError: (err) => {
          const ae = toApiError(err)
          for (const f of ae.fieldErrors) setError(f.field as keyof BahanValues, { message: f.message })
          toast.error("Bahan belum tersimpan", { id: t, description: ae.message, duration: Infinity })
        },
      },
    )
  })
  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full min-h-0 flex-col">
      <SheetHeader className="border-b">
        <SheetTitle>{bahan ? `Ubah ${bahan.nama}` : "Tambah bahan"}</SheetTitle>
        <SheetDescription>{bahan ? "Stok tidak diubah di sini. Stok berubah lewat barang masuk dan tutup shift." : "Stok awal hanya diisi sekali saat bahan dibuat."}</SheetDescription>
      </SheetHeader>
      <div className="grid flex-1 content-start gap-4 overflow-y-auto p-4">
        <Field label="Nama bahan" error={e.nama?.message}>{(p) => <Input {...p} {...register("nama")} className="h-10" />}</Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Satuan" error={e.satuan?.message}>
            {(p) => (
              <NativeSelect {...p} {...register("satuan")} className="h-10">
                {["gram", "kg", "ml", "liter", "pcs"].map((s) => <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>)}
              </NativeSelect>
            )}
          </Field>
          <Field label="Angka desimal" error={e.presisi?.message} hint="Untuk kg atau liter">
            {(p) => (
              <NativeSelect {...p} {...register("presisi", { setValueAs: (v) => Number(v) })} className="h-10">
                <NativeSelectOption value={0}>Tanpa desimal</NativeSelectOption>
                <NativeSelectOption value={1}>1 angka</NativeSelectOption>
                <NativeSelectOption value={2}>2 angka</NativeSelectOption>
              </NativeSelect>
            )}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stok minimum" error={e.stokMinimum?.message} hint={pratinjau(stokMinimum, satuan, presisi)} help={<HelpTooltip istilah="Stok minimum">{ISTILAH.stokMinimum}</HelpTooltip>}>
            {(p) => <Input {...p} inputMode="decimal" {...register("stokMinimum", { setValueAs: toAngka(presisi) })} className="num h-10" placeholder="0" />}
          </Field>
          <Field label="Toleransi selisih" error={e.toleransiSelisih?.message} hint={pratinjau(toleransiSelisih, satuan, presisi)} help={<HelpTooltip istilah="Toleransi selisih">{ISTILAH.toleransi}</HelpTooltip>}>
            {(p) => <Input {...p} inputMode="decimal" {...register("toleransiSelisih", { setValueAs: toAngka(presisi) })} className="num h-10" placeholder="0" />}
          </Field>
        </div>
        {!bahan && (
          <Field label="Stok awal" error={e.stokAwal?.message} hint={pratinjau(stokAwal, satuan, presisi)}>
            {(p) => <Input {...p} inputMode="decimal" {...register("stokAwal", { setValueAs: toAngka(presisi) })} className={cn("num h-10")} placeholder="0" />}
          </Field>
        )}
      </div>
      <SheetFooter className="flex-row justify-end border-t">
        <Button type="button" variant="ghost" onClick={onDone}>Batal</Button>
        <Button type="submit" disabled={simpan.isPending}>{simpan.isPending && <Spinner />}{bahan ? "Simpan perubahan" : "Tambah bahan"}</Button>
      </SheetFooter>
    </form>
  )
}
