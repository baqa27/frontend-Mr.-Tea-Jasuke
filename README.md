# Frontend Mr. Tea & Jasuke

Aplikasi web pencatatan penjualan, stok bahan baku, serah terima shift, dan rekap harian untuk UMKM Mr. Tea & Jasuke (Capstone Asah 2026, tim A26-CS164).

## Menjalankan

```bash
npm install
npm run dev          # mode mock, tanpa backend
```

Buka `http://localhost:5173`. Akun demo (mode mock):

| Peran | Nama pengguna | Kata sandi |
|---|---|---|
| Karyawan | `rina` | `demo123` |
| Karyawan | `dimas` | `demo123` |
| Pemilik | `pemilik` | `demo123` |

| Perintah | Fungsi |
|---|---|
| `npm run build` | Build produksi ke `dist/` |
| `npm run build:preview` | Build statis dengan mock dan hash router |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm run lint` | oxlint |
| `npm run test` | Unit test (Vitest) |

## Teknologi

React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), React Router, TanStack Query, Axios, Zustand, React Hook Form, Zod, Sonner, Recharts, driver.js, react-markdown, date-fns. Font Plus Jakarta Sans.

## Struktur folder

```
src/
  app/          router, App (providers)
  api/          hook TanStack Query per domain + query-keys.ts
  lib/          axios.ts, env.ts, flags.ts, calc.ts, format.ts, api-error.ts
  types/        domain.ts
  schemas/      skema Zod
  stores/       Zustand: sesi, keranjang PoS, draf tutup shift, jaringan
  mocks/        basis data tiruan + adapter Axios (fallback bila backend lokal mati)
  components/
    ui/         komponen shadcn/ui
    layout/     AppShell, Sidebar, BottomNav, ShiftChip, StockBell
    guards/     RequireAuth, RequireRole, RequireActiveShift
    feedback/   EmptyState, ErrorState, AiUnavailableCard, banner jaringan
    shared/     badge, ResponsiveTable, Field, QuantityStepper, dialog
  features/     satu folder per modul halaman, termasuk assistant (ChatbotPopup)
```

## Konfigurasi

Salin `.env.example` menjadi `.env.local`. Variabel `VITE_` ikut ke bundle, jangan isi secret.

| Variabel | Fungsi |
|---|---|
| `VITE_API_BASE_URL` | URL backend Express, termasuk `/api/v1` |
| `VITE_USE_MOCK` | `true` memakai mock adapter, `false` ke backend nyata |
| `VITE_APP_ENV` | `development`, `preview`, atau `production` |
| `VITE_ROUTER` | `browser` (bawaan) atau `hash` untuk hosting statis |
| `VITE_DASHBOARD_URL` | URL dasbor Streamlit |
| `VITE_DASHBOARD_SIMULASI` | Label data simulasi di halaman dasbor |
| `VITE_FLAG_DASHBOARD` | Tampilkan dasbor Streamlit di halaman pemilik |
| `VITE_FLAG_RISK_MODEL` | Tampilkan fitur risiko stok di halaman pemilik |
| `VITE_FLAG_ASSISTANT` | Tampilkan fitur asisten toko di halaman kasir |
| `VITE_SHOW_DEMO_ACCOUNTS` | Tampilkan kotak akun demo di halaman login |
| `VITE_DEMO_ACCOUNTS` | Daftar akun demo di format `label|username|password;label|username|password` |
| `VITE_USER_MANUAL_URL` | Tautan PDF panduan pengguna |

Mock aktif bila `VITE_USE_MOCK=true`. Data tersimpan di `localStorage` peramban.

## Tampilan

Aplikasi memakai dua tema penuh: Mode Terang sebagai bawaan saat pertama kali dibuka dan Mode Gelap berkontras tinggi. Toggle ada di `src/components/PilihTema.tsx`; pilihan disimpan di `localStorage` dengan kunci berversi, sehingga preferensi lama otomatis kembali ke Mode Terang. Tema tidak mengikuti `prefers-color-scheme` kecuali pengguna memilih "Sistem".

Palet poster pada Mode Terang: canvas `#F5FBF8`, kartu `#FFFFFF`, border `#DCF2E7`, teks `#111827` dan `#4B635B`, Tea Green `#56A73E`, Fresh Mint `#38D2A3`, Corn Yellow `#F4D026`, Warm Amber `#F39C12`, CTA gelap `#111827`. Mode Gelap: canvas `#0D1512`, kartu `#14201B`, border `#243830`, teks `#F3FAF6` dan `#9EB8AC`, Tea Green `#5EC444`, Fresh Mint `#38D2A3`, Corn Yellow `#FACC15`, Amber `#F59E0B`.

Rincian token, kontras, logo dua nada, skala hijau dashboard, warna shift, dan pola chatbot ada di `docs/sistem-desain.md`. Token diimplementasikan di `src/styles/globals.css` (`:root` untuk terang, `.dark` untuk gelap).

Asisten Toko tampil sebagai bubble melayang di kanan bawah, bukan halaman terpisah. Panel chat mengikuti tema aktif dan percakapan bertahan selama sesi.

## Alur branch dan PR ke repo tim

```bash
git fetch origin
git switch -c feat/frontend-rebrand-and-integration origin/main
# salin hanya file esensial ke folder frontend/ repo tim
git commit -m "feat(frontend): ..."
git push -u origin feat/frontend-rebrand-and-integration
```

Lalu buka Pull Request ke `main` lewat antarmuka GitHub. PR tidak di-merge sendiri; tunggu tinjauan pemilik repo tim.

## Sinkronisasi ke repo tim

Repo tim: `https://github.com/llailynisa/Mr-Tea-Jasuke.git`.

Saat menyalin frontend ke repo tim, hanya kirim source dan konfigurasi: `src/`, `public/`, `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `.env.example`, `.gitignore`, `.oxlintrc.json`, `.prettierrc`, `vercel.json`, `README.md`.

Folder dan file non-esensial berikut tidak ikut ke repo tim: `docs/`, `.qa/`, `.claude/`, `.skill/`, `tasks/`, `AGENTS.md`, `mrtea-tools/`, `dist/`, `src/node_modules/`, `scripts/buat-foto-menu.mjs`. `.gitignore` harus mengecualikan `node_modules/`, `src/node_modules/`, `dist/`, `.env`, `.env.local`, `.qa/`, `.claude/`, dan `.skill/`.

`src/mocks/` dipertahankan sebagai fallback; default-nya dimatikan lewat `VITE_USE_MOCK=false`. Integrasi backend nyata memakai Bearer JWT di memori, endpoint `/api/v1`, dan envelope `{ success, message, data, errors }`. Peta endpoint serta ketidaksesuaian kontrak ada di `docs/integrasi-api.md`.
