import { useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useIngredients, useMenuStatus, useMenus, useSaveMenu } from "@/api/catalog"
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback/states"
import { AsumsiBadge, Pill } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Field } from "@/components/shared/Field"
import { HelpTooltip, ISTILAH } from "@/components/shared/HelpTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { toApiError } from "@/lib/api-error"
import { angka, kategoriLabel, parseAngka, rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { menuSchema, type MenuValues } from "@/schemas"
import type { Menu } from "@/types/domain"

export default function MenuMasterPage() {
  const { data, isLoading, error, refetch } = useMenus()
  const status = useMenuStatus()
  const [cari, setCari] = useState("")
  const [edit, setEdit] = useState<Menu | "baru" | null>(null)
  const [nonaktif, setNonaktif] = useState<Menu | null>(null)
  const daftar = useMemo(() => (data ?? []).filter((m) => !cari.trim() || m.nama.toLowerCase().includes(cari.trim().toLowerCase())), [data, cari])

  const ubahStatus = (m: Menu, aktif: boolean) => {
    const t = toast.loading(aktif ? `Mengaktifkan ${m.nama}...` : `Menonaktifkan ${m.nama}...`)
    status.mutate(
      { id: m.id, aktif },
      {
        onSuccess: () => {
          toast.success(aktif ? `${m.nama} diaktifkan` : `${m.nama} dinonaktifkan`, { id: t, description: aktif ? "Menu kembali tampil di PoS." : "Menu tidak tampil di PoS, riwayat pesanan tetap tersimpan." })
          setNonaktif(null)
        },
        onError: (e) => {
          setNonaktif(null)
          toast.error("Status menu belum berubah", { id: t, description: toApiError(e).message, duration: Infinity })
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title="Menu dan takaran"
        description={<span className="inline-flex items-center gap-1">Harga per kanal dan bahan yang terpakai per porsi. <HelpTooltip istilah="Takaran">{ISTILAH.takaran}</HelpTooltip></span>}
        actions={<Button onClick={() => setEdit("baru")}><Plus />Tambah menu</Button>}
      />
      <div className="relative mb-4 sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari menu" aria-label="Cari menu" className="h-9 bg-card pl-9" />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListSkeleton rows={8} />
      ) : !daftar.length ? (
        <EmptyState title="Belum ada menu" action={<Button onClick={() => setEdit("baru")}><Plus />Tambah menu</Button>}>Tambahkan menu beserta takaran bahannya.</EmptyState>
      ) : (
        <ResponsiveTable
          caption="Daftar menu"
          rows={daftar}
          rowKey={(m) => m.id}
          rowClassName={(m) => (!m.aktif ? "opacity-60" : undefined)}
          columns={[
            { key: "nama", header: "Menu", mobile: "title", cell: (m) => <div><p className="font-semibold">{m.nama}</p><p className="text-xs font-normal text-muted-foreground">{kategoriLabel[m.kategori]}</p></div> },
            { key: "status", header: "Status", mobile: "aside", cell: (m) => (m.aktif ? <Pill tone="ok">Aktif</Pill> : <Pill>Nonaktif</Pill>) },
            { key: "toko", header: "Harga toko", align: "right", cell: (m) => <span className="num font-semibold">{rupiah(m.harga.toko)}</span> },
            { key: "shopee", header: "Shopee Food", align: "right", cell: (m) => <span className="num">{m.harga.shopee_food ? rupiah(m.harga.shopee_food) : <span className="text-muted-foreground">Sama dengan toko</span>}</span> },
            { key: "takaran", header: "Takaran", cell: (m) => <span className="inline-flex items-center gap-2">{m.takaran.length} bahan {m.sumberTakaran === "asumsi" && <AsumsiBadge />}</span> },
            {
              key: "aksi", label: "", header: <span className="sr-only">Aksi</span>, align: "right",
              cell: (m) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEdit(m)}><Pencil />Ubah</Button>
                  {m.aktif ? (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-bahaya" onClick={() => setNonaktif(m)}>Nonaktifkan</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => ubahStatus(m, true)}>Aktifkan</Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-lg">{edit && <MenuForm menu={edit === "baru" ? null : edit} onDone={() => setEdit(null)} />}</SheetContent>
      </Sheet>
      <ConfirmDialog
        open={!!nonaktif}
        onOpenChange={(o) => !o && setNonaktif(null)}
        title={`Nonaktifkan ${nonaktif?.nama}?`}
        description="Menu tidak tampil lagi di PoS. Pesanan lama yang memuat menu ini tetap tersimpan di riwayat."
        confirmLabel="Nonaktifkan"
        destructive
        pending={status.isPending}
        onConfirm={() => nonaktif && ubahStatus(nonaktif, false)}
      />
    </>
  )
}

/** Harga dibaca dengan presisi 0: semua titik adalah pemisah ribuan (MST-02) */
const toHarga = (v: unknown) => (typeof v === "number" ? v : parseAngka(String(v ?? ""), { presisi: 0 }))
const toHargaOrNull = (v: unknown) => (v === "" || v === null || v === undefined ? null : toHarga(v))
/** Takaran mengikuti presisi bahan. Bila bahan belum dipilih, desimal diperbolehkan. */
const toTakaran = (presisi: number) => (v: unknown) => (typeof v === "number" ? v : parseAngka(String(v ?? ""), { presisi }))
/** Di bawah nilai ini harga hampir pasti salah ketik, misalnya Rp15 padahal maksudnya Rp15.000 */
const HARGA_WAJAR_MIN = 500
const pratinjauHarga = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? `Terbaca: ${rupiah(n)}` : undefined)

function MenuForm({ menu, onDone }: { menu: Menu | null; onDone: () => void }) {
  const { data: bahan } = useIngredients()
  const simpan = useSaveMenu()
  const aktifBahan = (bahan ?? []).filter((b) => b.aktif)
  const byId = new Map((bahan ?? []).map((b) => [b.id, b]))
  const { register, control, handleSubmit, formState, setError, watch, setValue } = useForm<MenuValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: menu
      ? { nama: menu.nama, kategori: menu.kategori, hargaToko: menu.harga.toko, hargaShopee: menu.harga.shopee_food, aktif: menu.aktif, sumberTakaran: menu.sumberTakaran, takaran: menu.takaran.map((t) => ({ bahanId: t.bahanId, jumlahPerPorsi: t.jumlahPerPorsi })) }
      : { nama: "", kategori: "teh", hargaToko: Number.NaN, hargaShopee: null, aktif: true, sumberTakaran: "asumsi", takaran: [{ bahanId: "", jumlahPerPorsi: Number.NaN }] },
  })
  const takaran = useFieldArray({ control, name: "takaran" })
  const e = formState.errors
  const aktif = watch("aktif")
  const sumber = watch("sumberTakaran")
  const isiTakaran = watch("takaran")
  const hargaToko = watch("hargaToko")
  const hargaShopee = watch("hargaShopee")
  /** Harga diformat ulang saat blur, misalnya 15000 menjadi 15.000 */
  const registerHarga = (name: "hargaToko" | "hargaShopee", setValueAs: (v: unknown) => number | null) => {
    const r = register(name, { setValueAs })
    return {
      ...r,
      onBlur: (ev: React.FocusEvent<HTMLInputElement>) => {
        const n = parseAngka(ev.target.value, { presisi: 0 })
        if (Number.isFinite(n)) ev.target.value = angka(n)
        return r.onBlur(ev)
      },
    }
  }

  const [hargaJanggal, setHargaJanggal] = useState<MenuValues | null>(null)
  const kirim = (v: MenuValues) => {
    const t = toast.loading(menu ? `Menyimpan ${v.nama}...` : `Menambahkan ${v.nama}...`)
    simpan.mutate(
      { id: menu?.id, data: { nama: v.nama, kategori: v.kategori, harga: { toko: v.hargaToko, shopee_food: v.hargaShopee }, aktif: v.aktif, sumberTakaran: v.sumberTakaran, takaran: v.takaran } },
      {
        onSuccess: (m) => {
          setHargaJanggal(null)
          toast.success(menu ? `${m.nama} diperbarui` : `${m.nama} ditambahkan`, { id: t, description: "Perubahan langsung berlaku di PoS." })
          onDone()
        },
        onError: (err) => {
          setHargaJanggal(null)
          const ae = toApiError(err)
          for (const f of ae.fieldErrors) setError((f.field === "harga.toko" ? "hargaToko" : f.field) as keyof MenuValues, { message: f.message })
          toast.error("Menu belum tersimpan", { id: t, description: ae.message, duration: Infinity })
        },
      },
    )
  }
  const onSubmit = handleSubmit((v) => {
    const janggal = v.hargaToko < HARGA_WAJAR_MIN || (v.hargaShopee !== null && v.hargaShopee < HARGA_WAJAR_MIN)
    if (janggal) setHargaJanggal(v)
    else kirim(v)
  })
  const hargaKecil = hargaJanggal ? Math.min(hargaJanggal.hargaToko, hargaJanggal.hargaShopee ?? Number.POSITIVE_INFINITY) : 0

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full min-h-0 flex-col">
      <SheetHeader className="border-b">
        <SheetTitle>{menu ? `Ubah ${menu.nama}` : "Tambah menu"}</SheetTitle>
        <SheetDescription>Harga dalam Rupiah. Takaran dipakai untuk memotong stok setiap pesanan.</SheetDescription>
      </SheetHeader>
      <div className="grid flex-1 content-start gap-4 overflow-y-auto p-4">
        <Field label="Nama menu" error={e.nama?.message}>{(p) => <Input {...p} {...register("nama")} className="h-10" />}</Field>
        <Field label="Kategori" error={e.kategori?.message}>
          {(p) => (
            <NativeSelect {...p} {...register("kategori")} className="h-10">
              <NativeSelectOption value="teh">Teh</NativeSelectOption>
              <NativeSelectOption value="jasuke">Jasuke</NativeSelectOption>
              <NativeSelectOption value="lainnya">Lainnya</NativeSelectOption>
            </NativeSelect>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Harga toko" error={e.hargaToko?.message} hint={pratinjauHarga(hargaToko)}>
            {(p) => <Input {...p} inputMode="numeric" {...registerHarga("hargaToko", toHarga)} className="num h-10" placeholder="5.000" />}
          </Field>
          <Field label="Harga Shopee Food" error={e.hargaShopee?.message} hint={pratinjauHarga(hargaShopee) ?? "Kosongkan bila sama"}>
            {(p) => <Input {...p} inputMode="numeric" {...registerHarga("hargaShopee", toHargaOrNull)} className="num h-10" placeholder="Sama dengan toko" />}
          </Field>
        </div>

        <fieldset className="rounded-xl border p-3">
          <legend className="flex items-center gap-1 px-1 text-sm font-semibold">Takaran per porsi <HelpTooltip istilah="Takaran">{ISTILAH.takaran}</HelpTooltip></legend>
          {e.takaran?.message && <p className="mb-2 text-sm text-bahaya">{e.takaran.message}</p>}
          {e.takaran?.root?.message && <p className="mb-2 text-sm text-bahaya">{e.takaran.root.message}</p>}
          <ul className="grid gap-2">
            {takaran.fields.map((f, i) => {
              const b = byId.get(isiTakaran?.[i]?.bahanId ?? "")
              const fe = e.takaran?.[i]
              return (
                <li key={f.id} className="grid grid-cols-[minmax(0,1fr)_6.5rem_auto] items-start gap-2">
                  <div>
                    <Label htmlFor={`tk-b-${i}`} className="sr-only">Bahan {i + 1}</Label>
                    <NativeSelect id={`tk-b-${i}`} {...register(`takaran.${i}.bahanId`)} aria-invalid={!!fe?.bahanId} className="h-10">
                      <NativeSelectOption value="">Pilih bahan</NativeSelectOption>
                      {aktifBahan.map((x) => <NativeSelectOption key={x.id} value={x.id}>{x.nama}</NativeSelectOption>)}
                    </NativeSelect>
                    {fe?.bahanId && <p className="mt-1 text-sm text-bahaya">{fe.bahanId.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`tk-j-${i}`} className="sr-only">Jumlah per porsi</Label>
                    <div className="relative">
                      <Input id={`tk-j-${i}`} inputMode="decimal" {...register(`takaran.${i}.jumlahPerPorsi`, { setValueAs: toTakaran(b?.presisi ?? 2) })} aria-invalid={!!fe?.jumlahPerPorsi} className={cn("num h-10", b && "pr-10")} placeholder="0" />
                      {b && <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">{b.satuan}</span>}
                    </div>
                    {fe?.jumlahPerPorsi && <p className="mt-1 text-sm text-bahaya">{fe.jumlahPerPorsi.message}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-bahaya" onClick={() => takaran.remove(i)} disabled={takaran.fields.length <= 1} aria-label={`Hapus bahan ${i + 1}`}>
                    <Trash2 />
                  </Button>
                </li>
              )
            })}
          </ul>
          <Button type="button" variant="outline" size="sm" className="mt-3 border-dashed" onClick={() => takaran.append({ bahanId: "", jumlahPerPorsi: Number.NaN })}>
            <Plus />Tambah bahan
          </Button>
        </fieldset>

        <div className="grid gap-3 rounded-xl border p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor="sumber" className="font-semibold">Takaran sudah dikonfirmasi PIC</Label>
              <p className="text-sm text-muted-foreground">Bila belum, menu diberi label Asumsi.</p>
            </div>
            <Switch id="sumber" checked={sumber === "pic"} onCheckedChange={(v) => setValue("sumberTakaran", v ? "pic" : "asumsi", { shouldDirty: true })} />
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div>
              <Label htmlFor="aktif" className="font-semibold">Tampil di PoS</Label>
              <p className="text-sm text-muted-foreground">Matikan untuk menyembunyikan menu sementara.</p>
            </div>
            <Switch id="aktif" checked={aktif} onCheckedChange={(v) => setValue("aktif", v, { shouldDirty: true })} />
          </div>
        </div>
        {menu && <p className="num text-xs text-muted-foreground">Contoh pemakaian: 10 porsi memakai {menu.takaran.map((t) => `${angka(t.jumlahPerPorsi * 10, 2)} ${t.satuan} ${t.namaBahan.toLowerCase()}`).slice(0, 2).join(" dan ")}.</p>}
      </div>
      <SheetFooter className="flex-row justify-end border-t">
        <Button type="button" variant="ghost" onClick={onDone}>Batal</Button>
        <Button type="submit" disabled={simpan.isPending}>{simpan.isPending && <Spinner />}{menu ? "Simpan perubahan" : "Tambah menu"}</Button>
      </SheetFooter>
      <ConfirmDialog
        open={!!hargaJanggal}
        onOpenChange={(o) => !o && setHargaJanggal(null)}
        title={`Harga ${rupiah(hargaKecil)}, apakah maksudnya ${rupiah(hargaKecil * 1000)}?`}
        description={`Harga di bawah ${rupiah(HARGA_WAJAR_MIN)} jarang dipakai dan biasanya salah ketik. Pilih Batal untuk memperbaiki, atau simpan bila harganya memang benar.`}
        confirmLabel={`Simpan ${rupiah(hargaKecil)}`}
        onConfirm={() => hargaJanggal && kirim(hargaJanggal)}
        pending={simpan.isPending}
      />
    </form>
  )
}
