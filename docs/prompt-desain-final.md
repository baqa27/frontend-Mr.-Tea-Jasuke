# Prompt final OpenCode: perbaikan UI, sistem tema, dan desain Mr. Tea & Jasuke

Revisi 15 Nov 2026. Sudah dicocokkan dengan Project Plan (tim A26-CS164) dan PRD Frontend.

## Kesesuaian dengan Project Plan dan PRD

| Bagian prompt | Acuan | Keputusan |
|---|---|---|
| Kategori menu | PRD POS-01: Semua, Teh, Jasuke, Lainnya | Tetap "Lainnya". Usulan ganti ke "Paket" dibatalkan |
| Navigasi desktop | PRD NAV-01: sidebar kiri di 1024 px ke atas | Tetap sidebar. Header hanya berisi chip shift, lonceng, dan avatar |
| Breakpoint | PRD 10.2: ponsel < 768, tablet 768 sampai 1023, desktop >= 1024 | Diikuti apa adanya |
| Chip shift | PRD NAV-03: "Shift Pagi aktif sejak 07.02", diketuk membuka /shift | Teks mengikuti PRD |
| Jumlah ketukan | PRD: maksimal 3 ketukan per pesanan | Batas 3, target 2 |
| Teks tombol | PRD 10.6: "Simpan Pesanan", "Buka Shift", "Tutup Shift" | Mengikuti PRD |
| Menu bahan kurang | PRD POS-07: tampil redup dengan label "Bahan kurang" | Redup lewat foto dan latar, teks tetap terbaca (WCAG AA di PRD 10.7) |
| Proses simpan | PRD POS-06 dan 10.5: tombol nonaktif dengan indikator, toast | Toast tetap ada. Tanda "Tersimpan" hanya tambahan |
| Beranda pemilik | PRD BRD-01: omzet berlabel "Sementara", jumlah pesanan, shift aktif, 5 bahan terburuk, pintasan Rekap, Perkiraan Belanja, Dasbor | Kartu "terlaris", "pesanan per jam", dan "belanja besok" dihapus karena di luar BRD-01 dan tumpang tindih dengan dasbor tim DS (T6) |
| Label status stok | PRD STK-01: Aman, Hampir habis, Habis | Label "Menipis" diganti "Hampir habis" |
| Warna status | PRD 10.3 | Tema terang memakai nilai PRD apa adanya |
| Font, warna primer, radius | PRD 10.3 menulis "nilai usulan": Inter, #7C2D12, radius 8 px | Kode sudah memakai Plus Jakarta Sans dan #8a3b12. Dicatat di docs/sistem-desain.md sebagai pengganti usulan PRD |
| Tingkat gula | Tidak ada di Project Plan maupun PRD | Tidak ditambah. Bila sudah ada di branch, disembunyikan di balik flag yang mati sampai PIC setuju |
| Foto menu | Tidak ada di PRD. Form MST-02 tidak punya field foto | Hanya tampilan dari file lokal. Tanpa unggah foto, tanpa field kontrak baru |
| Nota bergaya struk | Project Plan: printer struk fisik tidak dikerjakan | Hanya gaya visual, tanpa fitur cetak |
| Sistem tema | Tidak diatur PRD, tidak dilarang Project Plan | Ditambah sebagai preferensi tampilan, tanpa fitur baru |

## Persiapan sebelum menjalankan

1. Taruh `audit-ui-main.md` di repo frontend sebagai `docs/audit-ui-awal.md`.
2. Ekspor 12 gambar dari file Figma "Foto menu Mr. Tea & Jasuke (ilustrasi AI)" (pilih semua frame, Export, PNG 1x). Ubah namanya sesuai `menuId` di `prompt-foto-menu.md`, lalu taruh di `contoh ui/foto-menu/`.
3. Bila PIC sudah mengirim foto papan nama, gelas, atau banner, taruh di `contoh ui/brand/`.
4. Kalau frontend sudah dipindah ke monorepo, jalankan OpenCode dari dalam `apps/web`.

Tempel seluruh blok di bawah ke OpenCode.

```text
Baca AGENTS.md, README.md, docs/rencana-redesain.md, docs/audit-ui-awal.md,
src/styles/globals.css, dan gambar di "contoh ui/". Bila ada, baca juga PRD
frontend di docs/. Baca seluruh instruksi ini sampai habis sebelum mengubah file.

TUJUAN
1. Memperbaiki bug UI, terutama teks yang tidak terbaca karena pasangan warna
   yang salah di tema terang maupun gelap.
2. Merapikan sistem tema: Terang, Gelap, dan Ikuti sistem.
3. Menyempurnakan tampilan dengan arah "Kedai hangat, cepat dibaca".
Ini bukan pekerjaan fitur. Semua kebutuhan tetap mengikuti PRD frontend.

BATAS YANG TIDAK BOLEH DILANGGAR
1. Tidak ada fitur, endpoint, field kontrak, atau dependensi baru. Semua yang
   masuk "Yang tidak dikerjakan" di Project Plan tetap tidak disentuh, termasuk
   printer struk, payment gateway, self-order, loyalty, dan aplikasi native.
2. Logika di src/lib/calc.ts, src/api/*, src/types/*, dan src/mocks/* tidak
   diubah. File baru yang diizinkan hanya yang disebut di instruksi ini.
3. Teks, label, dan perilaku yang ditetapkan PRD tidak diubah: kategori Semua,
   Teh, Jasuke, Lainnya (POS-01); sidebar di desktop (NAV-01); chip "Shift Pagi
   aktif sejak 07.02" (NAV-03); label stok Aman, Hampir habis, Habis (STK-01);
   tombol "Simpan Pesanan", "Buka Shift", "Tutup Shift" (10.6); toast proses dan
   berhasil (POS-06).
4. Kerjakan di branch desain/final dari main terbaru. Satu langkah = satu commit
   berformat fix(fe): ..., feat(fe): ..., atau style(fe): .... Jangan merge
   sendiri. Tanpa Co-Authored-By dan tanpa menyebut AI di commit, PR, atau
   komentar kode.
5. Setelah setiap langkah jalankan: npm run typecheck && npm run lint &&
   npm test && npm run build. Kalau dua kali perbaikan tetap gagal, kembalikan
   perubahan langkah itu dengan git restore, lalu laporkan penyebabnya.
6. Yang wajib tetap terjaga: satu pesanan maksimal 3 ketukan (target 2: ketuk
   menu, ketuk Simpan Pesanan); target sentuh minimal 44 x 44 px; tidak ada
   scroll horizontal di 360, 390, 768, 1024, dan 1280 px; JavaScript awal di
   bawah 300 KB gzip tanpa Recharts, driver.js, dan react-markdown; semua tes
   lama lulus.
7. Aturan warna:
   a. Dilarang memudarkan TEKS dengan opacity atau alpha (opacity-*, text-*/60,
      text-white/70, dan sejenisnya). Teks sekunder memakai --muted-foreground.
   b. Dilarang memakai warna tetap yang tidak ikut tema untuk teks atau latar:
      text-white, text-black, bg-white, bg-black, text-tinta, bg-tinta,
      text-kertas, dan hex atau rgb di className maupun style.
   c. Setiap latar selalu dipasangkan dengan teks dari token pasangannya:
      bg-primary + text-primary-foreground, bg-muted + text-muted-foreground,
      bg-ok-muda + text-ok-teks, dan seterusnya. Tidak boleh mencampur latar
      dari satu pasangan dengan teks dari pasangan lain.

PEMBAGIAN AGEN
@designer menulis sistem desain dan meninjau setiap layar terhadap instruksi ini.
@fixer mengimplementasikan.
@qa-expert menjalankan audit, mengambil screenshot, dan memeriksa kontras.
@oracle meninjau Langkah 2 dan 3 sebelum token global dan sistem tema diterapkan.

======================================================================
LANGKAH 0: BASELINE DAN AUDIT ULANG
======================================================================
- Catat hasil typecheck, lint, test, build, dan ukuran bundle di .qa/baseline.md.
- Jalankan aplikasi dalam mode mock. Login sebagai rina dan pemilik. Buka shift,
  isi keranjang PoS, buka nota di ponsel, buka tutup shift, dan buka stok.
- Screenshot SEBELUM untuk semua halaman di 390 px dan 1366 px, tema terang dan
  gelap, ke .qa/sebelum/.
- Jalankan axe-core (WCAG 2.1 AA) di setiap halaman, di tema terang DAN gelap.
  Untuk tema gelap, pasang kelas dark di <html> sebelum axe dijalankan.
- Jalankan grep berikut di src/ dan catat setiap hasilnya:
    text-white|text-black|bg-white|bg-black|text-tinta|bg-tinta|text-kertas
    opacity-[0-9]+ pada elemen berisi teks
    text-[a-z-]+/[0-9]+
    text-\[(9|10|11)px\]
    group-hover:block|hover:block
    #[0-9a-fA-F]{3,8} dan rgb( di luar src/styles/globals.css
- Gabungkan hasilnya dengan docs/audit-ui-awal.md. Simpan sebagai
  docs/audit-ui-awal.md yang diperbarui, dengan kolom halaman, tema, temuan,
  penyebab di kode, dan rasio kontras sebelum.

======================================================================
LANGKAH 1: PERBAIKI BUG UI
======================================================================
Kerjakan semua temuan di docs/audit-ui-awal.md, minimal yang ini:
1. Chip status shift di topbar (tema gelap): teks gelap di atas latar kuning
   gelap, kontras 1,2:1. Pakai pasangan bg-ok-muda + text-ok-teks dan titik
   --ok, di kedua tema. Teks mengikuti NAV-03: "Shift Siang aktif sejak 23.05".
2. Chip filter stok (tema gelap): chip aktif "Semua (14)" berteks putih di atas
   latar hampir putih. Chip aktif memakai bg-primary + text-primary-foreground,
   chip tidak aktif memakai bg-card + text-foreground + border. Label filter
   mengikuti STK-01: Semua, Hampir habis, Habis, Aman.
3. Periksa SEMUA chip, badge, tab, segmen, toggle, dan tombol di kedua tema
   dengan aturan warna di atas. Pola yang paling sering rusak: komponen yang
   memakai bg-foreground atau bg-tinta untuk keadaan aktif lalu text-white.
4. Tombol nonaktif karena syarat belum terpenuhi (contoh: Buka Shift sebelum
   konfirmasi dicentang): ganti disabled:opacity-50 di components/ui/button.tsx
   dengan disabled:bg-muted disabled:text-muted-foreground. Di bawahnya tulis
   satu kalimat alasan, misalnya "Centang konfirmasi stok awal untuk membuka
   shift." Tombol yang nonaktif karena SEDANG MEMPROSES (aria-busy) tetap
   berwarna primer dengan spinner di dalam tombol, sesuai PRD 10.5.
5. Kartu menu tidak tersedia (POS-07): hapus opacity pada kartu. Kartu tampil
   redup lewat foto grayscale dan latar --muted. Nama dan harga tetap warna
   penuh. Label "Bahan kurang" berikon AlertCircle warna --bahaya, diikuti nama
   bahan bila diketahui dari respons STOCK_INSUFFICIENT. Kartu tetap disabled.
6. Harga di kartu menu: 18 px, tebal 800, warna --primary. Hapus
   text-foreground/80.
7. Grafik omzet 7 hari di beranda pemilik: nominal "463rb" selalu tampil di atas
   batang (12 px), label hari 12 px. Hapus hidden group-hover:block dan
   text-[11px].
8. Tab tidak aktif (components/ui/tabs.tsx): text-muted-foreground.
9. Tombol tutup sheet dan dialog: area sentuh 44 x 44 px, ikon 20 px, tanpa
   opacity, label "Tutup".
10. Indikator langkah tutup shift: tampilkan nama langkah aktif dan teks
    "Langkah 1 dari 3" di ponsel.
11. Semua target sentuh di bawah 44 px dinaikkan: chip shift, lonceng, avatar,
    item sidebar, chip filter, tombol Ubah dan Nonaktifkan, saran pertanyaan
    asisten, ikon bantuan "?" (ikon boleh kecil, area sentuhnya 44 px).
12. Bar ringkas keranjang di ponsel (POS-09): teks "3 item, Rp36.000" dan ikon
    memakai token pasangan latarnya, tanpa alpha.
13. Bila tingkat gula sudah ada di branch ini, sembunyikan di balik
    VITE_FLAG_TINGKAT_GULA=false. Fitur ini belum ada di Project Plan dan PRD,
    jadi baru boleh dinyalakan setelah PIC dan tim setuju.

======================================================================
LANGKAH 2: SISTEM DESAIN (docs/sistem-desain.md, lalu globals.css)
======================================================================
Tulis di awal dokumen bahwa token ini menggantikan "nilai usulan" di PRD 10.3:
font Plus Jakarta Sans (bukan Inter), primer #8a3b12 (bukan #7C2D12), dan
hierarki radius (bukan satu radius 8 px). Warna status tema terang memakai
nilai PRD apa adanya. Kalau ada foto di "contoh ui/brand/", ambil warna primer
dan aksen dari foto itu, tulis hex dan bagian foto asalnya, lalu hitung ulang
kontrasnya.

Setiap token latar punya token teks pasangannya. Petakan semua token shadcn
(--background, --foreground, --card, --card-foreground, --popover,
--primary, --primary-foreground, --secondary, --muted, --muted-foreground,
--accent, --border, --input, --ring, --destructive) ke token di bawah untuk
kedua tema.

TEMA TERANG (:root)
  latar halaman --kertas #f6f7f4      teks --tinta #1b2420
  kartu         #ffffff              teks sekunder --abu #58635d
  garis #dadfd6   muted #eceee8 (teks di atasnya #58635d)
  primary #8a3b12 / primary-foreground #ffffff
  teh-muda #f6e7dc / teks di atasnya #6e2d0c
  aksen jagung #f2b705 / teks di atasnya #1b2420
  jagung-muda #fff3c4 / teks di atasnya #6b4a00
  ok #15803D on ok-muda #DCFCE7          (PRD: Aman, Sesuai)
  warn #A16207 on warn-muda #FEF9C3      (PRD: Hampir habis, Waspada)
  bahaya #B91C1C on bahaya-muda #FEE2E2  (PRD: Habis, Kritis)
  info #1D4ED8 on info-muda #DBEAFE      (PRD: Simulasi, Info)
  shopee #9a3412 on #fff0e6
  kategori: teh #8a3b12 / #f6e7dc, jasuke #9a6b00 / #fff3c4,
            lainnya #2d5a87 / #e3ecf6

TEMA GELAP (.dark)
  latar halaman #141a17   teks #eef1ec
  kartu #1c2420           teks sekunder #a9b3ad
  garis #2e3833   muted #252f2a (teks di atasnya #a9b3ad)
  primary #e9a06f / primary-foreground #1b120c
  teh-muda #3a2418 / teks di atasnya #f3c3a1
  aksen jagung #f2b705 / teks di atasnya #1b2420
  jagung-muda #3a3006 / teks di atasnya #f6d77a
  ok #4cc38a, ok-muda #123826 / ok-teks #bdeed3
  warn #f0b35a, warn-muda #3a2a0c / teks #f6d9a8
  bahaya #ff8a7a, bahaya-muda #3d1712 / teks #ffd2cb
  info #8fb3ff, info-muda #172645 / teks #cfe0ff
  shopee #ff9a66 on #3a1d10
  kategori: teh #e9a06f / #3a2418, jasuke #e9c25a / #3a3006,
            lainnya #8fb7e0 / #172b40

Kontras yang sudah dihitung dan wajib dipertahankan (tulis tabelnya di dokumen):
  terang: harga dan tombol Simpan Pesanan 7,7:1; total nota 15,9:1; teks
          sekunder 6,3:1; tombol nonaktif 5,3:1; badge status PRD 4,6 sampai 5,5:1.
  gelap:  teks utama 13,9:1; teks sekunder 7,4:1; harga 7,4:1; tombol Simpan
          Pesanan 8,5:1; chip shift 10,1:1; teks di jagung-muda 9,3:1.
Setiap pasangan lain minimal 4,5:1, teks 24 px ke atas minimal 3:1. Hijau hanya
untuk status, bukan warna merek.

Tipografi: Plus Jakarta Sans, angka tabular-nums dan rata kanan di tabel.
  12 px / 16 / 500  keterangan, label ilustrasi, label sumbu grafik
  14 px / 20 / 500-700  tombol, isi tabel, navigasi
  16 px / 24 / 700  nama menu, judul kartu
  18 px / 24 / 800  harga di kartu menu
  22 px / 28 / 800  judul nota, angka sekunder
  28 px / 34 / 800  judul halaman, angka KPI sedang
  36 px / 40 / 800  total nota
  44 px / 48 / 800  omzet hari ini (satu-satunya)
Tidak ada ukuran lain, tidak ada teks di bawah 12 px, tidak ada label kapital semua.

Bentuk: radius 6 px (input, chip, segmen), 8 px (tombol, thumbnail), 10 px (foto
di dalam kartu), 12 px (kartu, panel), 16 px (sheet, dialog). Jarak kelipatan
4 px. Kartu memakai garis tepi 1 px tanpa bayangan. Bayangan hanya untuk elemen
melayang (bar ringkas keranjang, sheet, popover). Di tema gelap bayangan diganti
garis.

Gerak, hanya sebagai jawaban atas aksi pengguna:
  tambah menu: kartu scale 0,97 selama 120 ms; lencana jumlah scale 1,25 lalu
  kembali dalam 260 ms; baris nota yang berubah berlatar jagung-muda yang
  memudar dalam 600 ms.
  simpan berhasil: toast sesuai POS-06, ditambah tanda centang dan teks
  "Tersimpan" di tombol selama 900 ms sebelum keranjang dikosongkan.
  ganti tema: tanpa animasi.
  Semua gerak mati saat prefers-reduced-motion: reduce. Tidak ada animasi masuk
  per bagian, parallax, atau shimmer dekoratif.

Ikon lucide stroke 2 ukuran 16, 18, atau 20. Tanpa emoji. Cincin fokus 3 px
warna jagung di kedua tema.

Buat halaman /dev/tokens (hanya terdaftar bila import.meta.env.DEV) yang
menampilkan semua pasangan token di kedua tema berdampingan beserta rasio
kontrasnya, skala huruf, radius, chip, badge, dan tombol termasuk nonaktif.
Commit, tunjukkan ringkasan, lalu BERHENTI dan tunggu persetujuan saya.

======================================================================
LANGKAH 3: SISTEM TEMA (Terang, Gelap, Ikuti sistem)
======================================================================
Kalau sistem tema sudah ada di branch ini, rapikan agar sesuai poin di bawah.
File baru yang diizinkan: src/stores/tema-store.ts, src/lib/tema.ts,
src/components/PilihTema.tsx.

1. Store: zustand persist dengan key "mrtea-tema", nilai "terang" | "gelap" |
   "sistem", bawaan "sistem". Pilihan berlaku per perangkat.
2. lib/tema.ts: terapkanTema(pilihan) menentukan tema akhir (untuk "sistem"
   membaca matchMedia("(prefers-color-scheme: dark)")), memasang atau melepas
   kelas "dark" di <html>, mengisi style.colorScheme, dan memperbarui
   <meta name="theme-color"> (#f6f7f4 terang, #141a17 gelap). Saat "sistem",
   dengarkan perubahan matchMedia tanpa reload.
3. Cegah kedipan: skrip inline kecil di index.html, sebelum stylesheet, membaca
   localStorage "mrtea-tema" (format {"state":{"pilihan":"..."}}) dan memasang
   kelas "dark" bila perlu. Bungkus dengan try/catch.
4. PilihTema.tsx: kontrol segmen tiga pilihan berikon Sun, Moon, Monitor dengan
   teks "Terang", "Gelap", "Ikuti sistem". Tinggi 44 px, role radiogroup, bisa
   dipakai dengan keyboard. Pasang di menu akun (avatar), halaman Bantuan bagian
   "Tampilan", dan pojok halaman login (versi ikon, aria-label "Tema tampilan").
5. Ikut tema: Toaster sonner, warna grafik recharts lewat var(--...), popover
   tur driver.js, skeleton, chip, badge, dan latar iframe dasbor. Bila dasbor
   Streamlit tetap terang, tulis catatan kecil di atas iframe.
6. Foto menu tidak diberi filter di tema gelap.
7. Tes unit terapkanTema: terang, gelap, sistem terang, sistem gelap, dan
   perubahan matchMedia.

======================================================================
LANGKAH 4: FOTO MENU (tampilan saja)
======================================================================
- Salin gambar di "contoh ui/foto-menu/" ke public/menu/<menuId>.webp, ukuran
  640 x 480, kualitas 80, masing-masing di bawah 60 KB.
- Buat src/lib/foto-menu.ts dengan fungsi fotoMenu(menu) yang mengembalikan
  path lokal berdasarkan menuId, atau null. Tidak ada field baru di tipe Menu
  dan tidak ada unggah foto di form MST-02. Bila null, tampilkan ilustrasi SVG
  garis per kategori.
- Foto lokal adalah ilustrasi buatan AI. Tampilkan label "Ilustrasi AI" (12 px,
  latar kartu 85%) di pojok kiri bawah foto sampai PIC mengirim foto asli.
  Jangan mengambil foto dari Google Maps, Instagram, atau situs lain.
- Semua <img> menu: loading="lazy", decoding="async", width dan height diisi,
  alt kosong karena nama menu sudah tertulis.

======================================================================
LANGKAH 5: KASIR (PRD 5.5 dan 10.2)
======================================================================
- Desktop >= 1024 px: sidebar kiri tetap (NAV-01). Topbar berisi chip shift,
  lonceng stok, dan avatar. PoS dua kolom: daftar menu dan keranjang menempel
  di kanan (360 sampai 420 px). Tablet 768 sampai 1023 px: topbar dan bottom
  navigation, PoS dua kolom bila muat. Ponsel < 768 px: bottom navigation
  (Shift, PoS, Pesanan, Stok, Lainnya) dan bar ringkas keranjang.
- Tab kategori Semua, Teh, Jasuke, Lainnya dengan ikon kategori. Tab aktif
  berlatar warna -muda kategori dengan garis 2 px warna kategori. Kolom cari di
  kanan. Penanda "2 bahan hampir habis" di kepala halaman (POS-08).
- Grid kartu: repeat(auto-fill, minmax(176px, 1fr)), gap 12 px. Kartu adalah
  <button> berisi foto 4:3, nama maksimal 2 baris, dan harga kanal terpilih.
  Menu di keranjang: garis kartu berwarna kategori dan lencana jumlah di pojok
  kanan atas foto. Hapus strip warna di sisi kiri kartu.
- Keranjang bergaya nota (visual saja): judul dan nomor, segmen Toko /
  Shopee Food (POS-02), garis putus-putus, item (thumbnail 44 px, titik warna
  kategori, nama, harga satuan, subtotal, QuantityStepper tombol kurang, input
  angka, tombol tambah sesuai POS-03, tombol hapus), garis putus-putus, total
  36 px, dan tombol "Simpan Pesanan" 56 px yang selalu terlihat.
- Keranjang kosong: ilustrasi gelas kosong dan kalimat "Ketuk menu untuk mulai
  mencatat pesanan."
- Riwayat pesanan: thumbnail menu pertama, nomor, waktu, chip kanal, total, dan
  status berikon plus teks.

======================================================================
LANGKAH 6: PEMILIK (PRD BRD-01, RKP, FC, MST)
======================================================================
- Beranda (BRD-01), grid 12 kolom, gap 16 px, ukuran sesuai kepentingan:
  omzet hari berjalan 7 kolom (angka 44 px, label "Sementara" selama hari
  belum ditutup, jumlah pesanan, pembagian Toko dan Shopee Food bila datanya
  tersedia, grafik omzet 7 hari yang sudah ada); shift aktif 5 kolom berlatar
  ok-muda (nama, pembuka, jam buka); lima bahan dengan status terburuk 5 kolom
  (bar sisa, badge berikon dan teks); pintasan ke Rekap, Perkiraan Belanja, dan
  Dasbor (Dasbor disembunyikan bila flag mati, DSB-05). Setiap kartu punya
  keadaan memuat, kosong, dan galat sendiri. Di bawah 768 px satu kolom dengan
  urutan omzet, shift, stok, pintasan. Jangan menambah kartu menu terlaris,
  pesanan per jam, atau perkiraan belanja di beranda.
- Rekap harian dan perkiraan belanja: angka utama 28 px, tabel tetap memakai
  ResponsiveTable dengan sel angka rata kanan, label "Sementara" dan
  SimulasiBanner tetap ada.
- Master menu: thumbnail 56 x 42 px di tabel. Form MST-02 tidak berubah.

======================================================================
LANGKAH 7: AUDIT AKHIR (@qa-expert)
======================================================================
Tulis docs/audit-desain.md dengan kolom halaman, tema, temuan, status. Periksa
di KEDUA tema:
- axe-core WCAG 2.1 AA: 0 pelanggaran di setiap halaman dan tema.
- Semua grep di Langkah 0 bersih, atau setiap sisa punya alasan tertulis.
- Target sentuh 44 px, tidak ada scroll horizontal di 360 sampai 1280 px, fokus
  keyboard terlihat, dialog dan sheet bisa ditutup dengan Esc.
- Keadaan memuat, kosong, dan galat ada di setiap halaman (PRD 10.5).
- Pola generik yang dilarang: gradien, glassmorphism, neon, kartu identik
  berbayangan sama, strip warna di sisi kiri kartu, label kapital semua, titik
  tengah sebagai pemisah, em dash, panah di teks tombol, emoji, penomoran
  dekoratif, animasi masuk per bagian, kalimat pemasaran.
- Tema: ganti Terang, Gelap, Ikuti sistem tanpa reload; pilihan tetap setelah
  reload; tidak ada kedipan tema terang saat membuka aplikasi dalam mode gelap.
- Teks dan label PRD tidak berubah (cek daftar di batas nomor 3).
Screenshot SESUDAH ke .qa/sesudah/: semua halaman, tema terang dan gelap, 390 px
dan 1366 px.

SELESAI BILA
- typecheck, lint, test, build lulus dan bundle awal di bawah 300 KB gzip.
- Semua temuan di docs/audit-ui-awal.md berstatus selesai.
- docs/sistem-desain.md dan docs/audit-desain.md lengkap.
- Pull request ke main berisi ringkasan, daftar commit, dan screenshot sebelum
  dan sesudah untuk kasir (ponsel dan desktop), keranjang, stok, beranda
  pemilik, master menu, dan pilihan tema, masing-masing di tema terang dan
  gelap. Tanpa atribusi AI.
```
