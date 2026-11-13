# Rencana Redesain: Tahap 2 dan Tahap 3

Dokumen ini pelaksanaan frontend Mr. Tea & Jasuke. Disusun dari `docs/prd-frontend.md`, `docs/capstone-plan.md`, dan catatan pekerjaan Tahap 1. Frontend tetap siap disambungkan ke backend Express (Render) dan layanan ML FastAPI; frontend tidak pernah memanggil layanan FastAPI secara langsung.

## Batasan global

1. Semua perubahan di branch `redesain/tahap-2-3`, digabung lewat pull request.
2. Baseline wajib: `npm run typecheck`, `npm run test`, `npm run build`, `npm run lint`.
3. Cakupan terbatas: foto menu dan tingkat gula dikerjakan sesuai rencana ini; `src/lib/calc.ts`, `src/mocks/logic.ts`, `src/mocks/handlers.ts` hanya diubah untuk kontrak tersebut.
4. Komponen `src/components/ui` hanya diubah lewat token atau `className`.
5. Atribusi AI (Co-Authored-By, Generated with, dsb.) tidak ditulis di commit, PR, maupun kode.
6. Screenshot sebelum/sesudah disimpan di `.qa/` (ditambah `.gitignore`); bukan bagian repo.

## Tahap 2: Foto menu, tingkat gula, dan redesain PoS

### 2.1 Kontrak dan data (tipe, mock, seed foto)

- `Menu` di `src/types/domain.ts` mendapat field `fotoUrl?: string` (kosong berarti tampil ilustrasi kategori).
- Item pesanan mendapat `tingkatGula?: "kurang" | "normal" | "ekstra"`; bawaan `normal`; tidak mengubah harga; hanya relevan untuk kategori yang menyediakan tingkat gula (teh dan jasuke; ditentukan lewat field `bisaAturGula: boolean` di Menu).
- `BuatPesananInput.items` membawa `tingkatGula` per item, terlibat dalam perbandingan isi keranjang (POS-06) sehingga isi beda tingkat gula tidak dianggap duplikat.
- Mock `src/mocks/handlers.ts` dan `src/mocks/logic.ts` menerima serta menolak nilainya sesuai aturan backend.
- Seed foto: 3 sampai 5 foto contoh disimpan di `public/img/menu/`, dihasilkan/dioptimalkan memakai `sharp` (devDependency) agar bobot per foto di bawah 30 KB.
- Test: unit di `src/mocks/__tests__` untuk kontrak tingkat gula, dan skema Zod di `src/schemas/index.ts`.

### 2.2 Komponen baru

- `MenuPhoto`: tampil foto `fotoUrl` dengan rasio tetap, rasio lebar penuh di ponsel; fallback ilustrasi SVG kategori (teh, jasuke, lainnya) bila foto kosong atau gagal memuat.
- Ilustrasi kategori SVG: satu file per kategori, garis sederhana, warna token (`teh`, `jagung`, `tinta`), bukan emoji atau foto stok.
- Kontrol tingkat gula: segmented ringkas tiga pilihan (Kurang, Normal, Ekstra), target sentuh minimal 44 px, hanya muncul untuk menu dengan `bisaAturGula`.

### 2.3 PoS desktop

- Dua kolom: grid menu kiri, keranjang menempel kanan (POS-09).
- Kartu menu memuat foto, nama, harga kanal (POS-01); tetap satu ketukan untuk menambah porsi (POS-03).
- Tingkat gula diatur di baris keranjang, bukan di kartu, agar alur kasir tetap dua ketukan per pesanan tanpa gula (POS-06 tidak berubah).

### 2.4 PoS ponsel

- Bar ringkas keranjang di bawah layar, membuka bottom sheet (POS-09).
- Grid foto dua kolom; tidak ada scroll horizontal di 360 px.
- Zona sentuh dan tombol simpan mengikuti pola toast Sonner (POS-06).

### 2.5 Halaman terdampak

- Riwayat pesanan (`src/features/orders/OrdersPage.tsx`): menampilkan tingkat gula per item.
- Master menu (`src/features/master/MenuMasterPage.tsx`): unggah foto (validasi jenis dan ukuran) dan pengaturan `bisaAturGula`.
- Beranda pemilik (`src/features/owner-home/OwnerHomePage.tsx`): menyesuaikan tampilan ringkasan bila kontrak berubah, tanpa perubahan logika.

### 2.6 Pengujian Tahap 2

- Unit: skema tingkat gula, perbandingan isi keranjang, format foto.
- Komponen: MenuPhoto fallback ilustrasi, kontrol tingkat gula.
- Fungsional: alur T-03 ditambah dua pesanan dengan tingkat gula beda; T-07 stok; T-13 lebar 360/390/768/1366.

### 2.7 Tingkat gula, catatan keputusan

- Nilai terkunci: Kurang, Normal, Ekstra. Kata dan urutan tidak berubah tanpa keputusan tim.
- Tidak mengubah harga maupun stok. Pertanyaan terbuka (PRD 16.1) tetap berlaku untuk pembatalan pesanan dan penyimpanan token.
- Bila tim menolak fitur ini, komponen kontrol tinggal disembunyikan lewat `src/lib/flags.ts` tanpa menghapus kontrak.

## Tahap 3: Tema gelap

### 3.1 Token warna

- Tambah blok `.dark` di `src/styles/globals.css` untuk token `kertas`, `tinta`, `teh`, `teh-muda`, `jagung`, `ok`, `warn`, `bahaya`, `info`.
- Warna hardcode tidak ditambah. Kontras teks dan status diuji WCAG AA di kedua tema; status selalu teks dan ikon, bukan warna saja.

### 3.2 Pengalih tema

- Saklar di menu pengguna (`src/components/layout/UserMenu.tsx`), menyimpan pilihan di `src/stores/ui-store.ts`, hormati `prefers-color-scheme` saat belum ada pilihan.

### 3.3 Verifikasi tema gelap

- Screenshot `.qa/sesudah/` untuk PoS, stok, rekap, master, beranda pemilik, asisten, pada 390 px dan 1366 px.
- Keadaan kosong, memuat, galat, dan sukses diperiksa di kedua tema (ERR-01 sampai ERR-03).
- Nota PoS tetap tema terang sesuai gaya visual AGENTS.md; ornamen `nota-edge` tidak berubah.

## Urutan pengerjaan

1. Kontrak dan data (2.1) beserta test.
2. Komponen baru (MenuPhoto, ilustrasi SVG, kontrol tingkat gula).
3. PoS desktop, lalu ponsel.
4. Halaman terdampak (riwayat, master, beranda).
5. Tema gelap (Tahap 3).
6. Verifikasi akhir: typecheck, test, build, lint, screenshot sebelum/sesudah.
