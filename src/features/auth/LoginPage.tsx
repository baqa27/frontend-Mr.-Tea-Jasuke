import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, KeyRound } from "lucide-react"
import { useSearchParams } from "react-router"
import { loginDenganUlang } from "@/api/auth"
import { Field } from "@/components/shared/Field"
import { BrandMark } from "@/components/layout/BrandMark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { NetworkBanners } from "@/components/feedback/NetworkBanners"
import { toApiError } from "@/lib/api-error"
import { env } from "@/lib/env"
import { loginSchema, type LoginValues } from "@/schemas"
import { useAuth } from "@/stores/auth-store"
import { PilihTema } from "@/components/PilihTema"

export default function LoginPage() {
  const [lihat, setLihat] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)
  const [params] = useSearchParams()
  const masuk = useAuth((s) => s.masuk)
  const alasan = params.get("alasan")
  const [lambat, setLambat] = useState(false)

  const { register, handleSubmit, setValue, getValues, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  // Bila login berjalan lebih dari 5 detik, server kemungkinan sedang bangun (ERR-02)
  useEffect(() => {
    if (!formState.isSubmitting) {
      setLambat(false)
      return
    }
    const t = setTimeout(() => setLambat(true), 5000)
    return () => clearTimeout(t)
  }, [formState.isSubmitting])

  const onSubmit = handleSubmit(async (v) => {
    setGalat(null)
    try {
      const res = await loginDenganUlang(v)
      // GuestOnly mengarahkan ke tujuan (redirect, beranda pemilik, atau PoS/Buka Shift) begitu token tersimpan.
      // Navigasi di sini dulu kalah balapan dengan GuestOnly sehingga redirect selalu diabaikan.
      masuk(res.accessToken, res.pengguna)
    } catch (e) {
      const err = toApiError(e)
      setGalat(err.status === 401 ? "Nama pengguna atau kata sandi salah." : err.message)
      setValue("password", "")
    }
  })

  return (
    <div className="flex min-h-dvh flex-col">
      <NetworkBanners />
      <div className="flex flex-1 items-center justify-center px-5 py-10 relative">
        <div className="w-full max-w-[380px]">
          <BrandMark />
          <h1 className="mt-8 text-[1.65rem] leading-tight font-bold tracking-tight">Masuk untuk mulai mencatat</h1>
          <p className="mt-2 text-muted-foreground">Karyawan mencatat pesanan dan stok per shift. Pemilik memantau rekap dan perkiraan belanja.</p>

          {alasan === "sesi" && (
            <p role="status" className="mt-5 rounded-lg bg-warn-muda px-3.5 py-2.5 text-sm text-warn">
              Sesi berakhir, silakan masuk lagi.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
            <Field label="Nama pengguna" error={formState.errors.username?.message}>
              {(p) => <Input {...p} {...register("username")} autoComplete="username" autoCapitalize="none" className="h-11 text-base" />}
            </Field>
            <Field label="Kata sandi" error={formState.errors.password?.message}>
              {(p) => (
                <div className="relative">
                  <Input {...p} {...register("password")} type={lihat ? "text" : "password"} autoComplete="current-password" className="h-11 pr-11 text-base" />
                  <button
                    type="button"
                    onClick={() => setLihat((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              )}
            </Field>
            {galat && (
              <p role="alert" className="rounded-lg bg-bahaya-muda px-3.5 py-2.5 text-sm text-bahaya">
                {galat}
              </p>
            )}
            <Button type="submit" size="lg" className="h-11 text-base" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Spinner />}
              {formState.isSubmitting ? (lambat ? "Menyalakan server..." : "Memeriksa...") : "Masuk"}
            </Button>
            {formState.isSubmitting && lambat && (
              <p role="status" className="text-center text-sm text-muted-foreground">
                Server baru dinyalakan setelah tidak dipakai. Login dicoba ulang otomatis satu kali bila belum berhasil.
              </p>
            )}
          </form>

          {env.showDemoAccounts && env.demoAccounts.length > 0 && (
            <div className="mt-8 rounded-xl border bg-card p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="size-4 text-teh" aria-hidden />
                Akun demo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Ketuk salah satu untuk mengisi form.</p>
              <ul className="mt-3 grid gap-1.5">
                {env.demoAccounts.map((a) => (
                  <li key={a.username}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("username", a.username, { shouldValidate: true })
                        setValue("password", a.password, { shouldValidate: true })
                        if (getValues("username")) setGalat(null)
                      }}
                      className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="font-medium">{a.username}</span>
                      <span className="text-muted-foreground">{a.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="absolute right-5 top-5" aria-hidden="false">
          <PilihTema ringkas />
        </div>
      </div>
    </div>
  )
}
