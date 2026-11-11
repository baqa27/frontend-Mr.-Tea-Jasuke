# Frontend Mr. Tea & Jasuke

Aplikasi web pencatatan penjualan, stok bahan baku, serah terima shift, dan rekap harian untuk UMKM Mr. Tea & Jasuke. Bagian dari Capstone Project Asah 2026 (tim A26-CS164).

Acuan kebutuhan: `docs/PRD Frontend - Mr Tea & Jasuke (A26-CS164).docx`. Setiap fitur di kode memakai ID kebutuhan dari PRD (misalnya `POS-06`, `TUT-05`) pada komentar dan judul pull request.

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

Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run build` | Build produksi ke `dist/` |
| `npm run build:preview` | Build statis dengan mock dan hash router untuk demo tanpa backend |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm run lint` | oxlint |
| `npm run test` | Unit test (Vitest) |

## Teknologi

React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), React Router, TanStack Query, Axios (satu instance terpusat), Zustand, React Hook Form, Zod, Sonner, Recharts, driver.js, react-markdown, date-fns. Font Plus Jakarta Sans.

## Struktur folder

```
src/
  app/          router, App (providers)
  api/          hook TanStack Query per domain + query-keys.ts
  lib/          axios.ts, env.ts, flags.ts, calc.ts, format.ts, api-error.ts
  types/        domain.ts (bentuk data sesuai PRD bagian 7)
  schemas/      skema Zod (meniru aturan Joi backend)
  stores/       Zustand: sesi, keranjang PoS, draf tutup shift, status jaringan
  mocks/        basis data tiruan + aturan bisnis + adapter Axios
  components/
    ui/         komponen shadcn/ui (salinan resmi, boleh diubah)
    layout/     AppShell, Sidebar, BottomNav, ShiftChip, StockBell
    guards/     RequireAuth, RequireRole, RequireActiveShift
    feedback/   EmptyState, ErrorState, AiUnavailableCard, banner jaringan
    shared/     badge, ResponsiveTable, Field, QuantityStepper, dialog
  features/     satu folder per modul halaman
docs/           PRD
```

## Mode mock dan sambung ke backend

Mock berupa adapter Axios (`src/mocks/adapter.ts`), bukan service worker, sehingga jalan di preview statis mana pun. Aktif bila `VITE_USE_MOCK=true`. Data tersimpan di `localStorage` peramban dan dapat diatur ulang dari halaman Bantuan.

Untuk memakai backend Express:

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `VITE_API_BASE_URL` dengan URL backend, termasuk `/api/v1`.
3. Set `VITE_USE_MOCK=false`.

Kontrak yang dipakai frontend ada di PRD bagian 8 dan diimplementasikan di `src/mocks/handlers.ts`. Bila OpenAPI final berbeda, ubah `src/api/*` dan `src/types/domain.ts`, lalu sesuaikan handler mock agar tetap sama dengan backend.

### Aturan yang wajib sama di backend

- **Selisih stok (TUT-05, TUT-06).** Selisih = fisik dikurangi tercatat, lalu dibulatkan ke max(presisi, 2) desimal sebelum dibandingkan dengan toleransi. Selisih yang sama persis dengan toleransi tidak wajib diberi catatan. Contoh: tercatat 4,32 kg, fisik 4,12 kg, toleransi 0,2 kg, maka selisih −0,2 dan catatan tidak wajib. Tanpa pembulatan, 4,12 − 4,32 di JavaScript bernilai −0,20000000000000018 dan salah dianggap melewati toleransi. Acuan kode: `selisihBahan` dan `wajibCatatanSelisih` di `src/lib/calc.ts`.
- **Galat tutup shift.** Field galat memakai indeks urutan `stokFisik` yang dikirim klien, misalnya `stokFisik.3.catatan`. Frontend memunculkan kolom catatan untuk bahan itu walau hitungannya sendiri bilang tidak perlu.
- **clientRequestId (POS-06, STK-06).** Isi pesanan yang persis sama memakai ID yang sama, isi yang berubah memakai ID baru. Balasan `DUPLICATE_REQUEST` wajib membawa data yang sudah tersimpan di `data` (pesanan, atau daftar mutasi untuk barang masuk) agar frontend bisa membandingkan isinya.
- **Cold start (ERR-02).** Frontend menunggu `POST /auth/login` dan `GET /health` hingga 75 detik, permintaan lain 30 detik.

### Format angka di form

Angka diketik dengan aturan Indonesia: koma untuk desimal, titik untuk ribuan (`parseAngka` di `src/lib/format.ts`).

| Ketikan | Presisi 0 (harga, gram, pcs) | Presisi 1 atau 2 (kg, liter) |
|---|---|---|
| `15.000` | 15000 | 15000 |
| `1.500.000` | 1500000 | 1500000 |
| `2,5` | 2,5 (lalu ditolak validasi presisi) | 2,5 |
| `2.5` | tidak sah | 2,5 |
| `1.250,5` | 1250,5 | 1250,5 |

Setiap input angka menampilkan pratinjau "Terbaca: ...". Harga di bawah Rp500 meminta konfirmasi sebelum disimpan.

Respons backend diharapkan memakai envelope `{ status, message, data }`. Galat memakai `{ status, code, message, errors[] }`. Kode galat yang ditangani khusus: `VALIDATION_ERROR`, `SHIFT_STILL_OPEN`, `NO_ACTIVE_SHIFT`, `STOCK_INSUFFICIENT`, `DUPLICATE_REQUEST`, `NAME_TAKEN`, `INGREDIENT_IN_USE`, `AI_UNAVAILABLE`.

### Skenario uji mock

Tambahkan query string sekali, nilainya bertahan selama tab terbuka:

| URL | Perilaku |
|---|---|
| `?mock=ai-down` | Endpoint perkiraan, chat, dan risiko membalas 503 |
| `?mock=gemini-down` | Chat dijawab model cadangan |
| `?mock=slow` | Server dianggap tidur 40 detik sejak halaman dibuka (cold start Render). Permintaan dengan batas 30 detik akan timeout lalu dicoba ulang, login (batas 75 detik) tetap berhasil |
| `?mock=empty` | Semua daftar kosong |
| `?mock=normal` | Kembali normal |

## Variabel lingkungan

Semua variabel `VITE_` ikut ke bundle dan dapat dibaca publik. Jangan isi API key atau secret.

| Variabel | Fungsi |
|---|---|
| `VITE_API_BASE_URL` | URL backend Express |
| `VITE_USE_MOCK` | Menyalakan mock |
| `VITE_APP_ENV` | `development`, `preview`, atau `production`. Label intent chat tampil di luar production |
| `VITE_ROUTER` | `browser` (bawaan) atau `hash` untuk hosting statis tanpa rewrite |
| `VITE_DASHBOARD_URL` | URL dasbor Streamlit |
| `VITE_DASHBOARD_SIMULASI` | Label data simulasi di halaman dasbor |
| `VITE_FLAG_DASHBOARD`, `VITE_FLAG_RISK_MODEL`, `VITE_FLAG_ASSISTANT` | Feature flag T6, T13, W14 |
| `VITE_SHOW_DEMO_ACCOUNTS`, `VITE_DEMO_ACCOUNTS` | Kotak akun demo di halaman login |
| `VITE_USER_MANUAL_URL` | Tautan PDF Buku Panduan Pengguna |

## Deploy ke Vercel

1. Import repositori, root directory `frontend` bila monorepo.
2. Build command `npm run build`, output `dist`.
3. Isi variabel lingkungan di dashboard Vercel.
4. `vercel.json` sudah berisi rewrite SPA.
5. Backend perlu mengizinkan origin domain Vercel (produksi dan preview) di CORS.

## Keputusan desain

- Warna: kertas `#F6F7F4`, tinta `#1B2420`, teh `#8A3B12` (primer), jagung `#F2B705` (aksen terbatas pada nota PoS dan chip shift aktif). Status memakai hijau, kuning tua, merah, dan biru, selalu disertai ikon dan teks.
- Satu elemen khas: nota pesanan bergaya struk dengan tepi bergerigi. Elemen lain sengaja datar.
- Ponsel memakai bottom navigation dan bar nota di atasnya. Desktop memakai sidebar dan nota menempel di kanan.
- Hitung stok fisik dilakukan tanpa melihat stok tercatat (PRD Q-06).
- Setiap pesanan dan barang masuk membawa `clientRequestId` untuk mencegah data ganda (PRD Q-11).

## Batasan saat ini

- Data mock berupa contoh. Ganti fixture di `src/mocks/db.ts` dengan dataset bersih dari tim DS (W11).
- Asisten Toko di mode mock memakai pencocokan kata kunci. Jawaban sungguhan datang dari layanan AI lewat backend.
- Pembatalan pesanan belum ada, menunggu keputusan PRD Q-03.
- Token disimpan di localStorage (PRD Q-10).
