# AGENTS.md

Panduan untuk AI agent (OpenCode dan sejenisnya) yang melanjutkan repo ini. Baca seluruh berkas sebelum mengubah kode.

## Konteks

Frontend aplikasi rekap penjualan dan stok UMKM Mr. Tea & Jasuke (Capstone Asah 2026, tim A26-CS164). Acuan kebutuhan: `docs/PRD Frontend - Mr Tea & Jasuke (A26-CS164).docx`. ID kebutuhan (AUTH, NAV, BRD, SHF, POS, ORD, STK, TUT, RKP, MST, FC, DSB, AST, ONB, ERR) wajib disebut di judul commit atau PR.

Pengguna: karyawan shift (kebanyakan memakai ponsel di kasir) dan pemilik (kebanyakan desktop). Seluruh teks antarmuka berbahasa Indonesia.

## Perintah

```bash
npm run dev         # mode mock
npm run typecheck
npm run lint
npm run test
npm run build
```

Jalankan `typecheck`, `test`, dan `build` sebelum menyatakan pekerjaan selesai.

## Aturan arsitektur

- Semua HTTP lewat `src/lib/axios.ts` (`http`). Jangan membuat instance Axios atau `fetch` baru.
- Data server hanya lewat hook di `src/api/*` dengan kunci dari `src/api/query-keys.ts`. Mutasi wajib menginvalidasi query terkait (lihat `invalidasiSetelahMutasiStok` di `src/api/operations.ts`).
- Bentuk data di `src/types/domain.ts`. Bila kontrak berubah, ubah tipe, hook API, dan handler mock bersamaan.
- Validasi form di `src/schemas/index.ts` (Zod). Pesan galat menyebut apa yang salah dan cara memperbaikinya.
- Logika hitung (total, selisih, toleransi, status stok) hanya di `src/lib/calc.ts` dan wajib punya unit test.
- Format angka, Rupiah, dan tanggal hanya lewat `src/lib/format.ts`. Pakai kelas `num` untuk angka agar tabular.
- Fitur AI (perkiraan, chat, risiko) tidak boleh menjatuhkan halaman lain. Pakai `AiUnavailableCard` dan `ErrorBoundary`.
- Frontend tidak pernah memanggil layanan FastAPI langsung. Semua lewat backend Express.
- Jangan menaruh secret di variabel `VITE_`.
- Mock (`src/mocks`) meniru aturan backend. Setiap aturan bisnis baru di backend juga ditambahkan ke mock dan diuji di `src/mocks/__tests__`.

## Aturan antarmuka

- Komponen dasar dari `src/components/ui` (shadcn/ui). Komponen bersama di `src/components/shared`.
- Tabel memakai `ResponsiveTable` agar otomatis menjadi kartu di bawah 768 px. Tidak boleh ada scroll horizontal di lebar 360 px.
- Setiap halaman punya keadaan memuat (skeleton), kosong (`EmptyState`), galat (`ErrorState`), dan berhasil.
- Aksi permanen (tutup shift, nonaktifkan) memakai `ConfirmDialog`. Aksi cepat kasir (tambah menu, simpan pesanan) tidak memakai dialog.
- Notifikasi memakai `toast` dari Sonner dengan pola: `toast.loading` lalu `toast.success` atau `toast.error` dengan `id` yang sama. Toast galat memakai `duration: Infinity`.
- Target sentuh minimal 44 px di ponsel. Fokus keyboard harus terlihat.

## Gaya visual (jangan diubah tanpa alasan)

- Token warna di `src/styles/globals.css`: `kertas`, `tinta`, `teh`, `teh-muda`, `jagung`, `ok`, `warn`, `bahaya`, `info`.
- Primer `teh`. Aksen `jagung` hanya untuk nota PoS dan chip shift aktif.
- Satu-satunya ornamen adalah nota PoS (`nota-edge`). Jangan menambah gradien, bayangan kartu, glassmorphism, atau animasi masuk per bagian.
- Status selalu teks + ikon, bukan warna saja.
- Hindari label huruf kapital semua, pemisah titik tengah, dan panah di teks tombol.

## Gaya penulisan teks

- Bahasa Indonesia baku yang lugas, kalimat aktif, sentence case.
- Tombol memakai kata kerja yang menjelaskan akibat: "Simpan Pesanan", "Buka Shift", "Tutup Shift".
- Jangan memakai em dash. Ganti dengan koma atau titik.
- Pesan galat tidak meminta maaf dan tidak samar.

## Status pekerjaan

Sudah selesai dengan mock: seluruh kebutuhan PRD bagian 5 kecuali yang menunggu keputusan tim (PRD 16.1). Sisa pekerjaan:

1. Sambungkan ke backend sungguhan per modul setelah OpenAPI final (PRD tahap 12).
2. Ganti fixture mock dengan dataset DS.
3. Uji end-to-end dengan Playwright (PRD 13.3) belum dibuat.
4. Putuskan pembatalan pesanan (Q-03) dan penyimpanan token (Q-10).
