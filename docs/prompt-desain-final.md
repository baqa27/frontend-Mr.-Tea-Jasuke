# Prompt final OpenCode: perbaikan UI, sistem tema, dan desain Mr. Tea & Jasuke

Persiapan sebelum menjalankan:
1. Taruh `audit-ui-main.md` di `docs/audit-ui-awal.md` di repo frontend.
2. Ekspor 12 gambar dari file Figma "Foto menu Mr. Tea & Jasuke (ilustrasi AI)" (pilih semua frame, Export, PNG 1x). Ubah namanya sesuai `menuId` di `prompt-foto-menu.md`, lalu taruh di `contoh ui/foto-menu/`.
3. Bila PIC sudah mengirim foto papan nama, gelas, atau banner, taruh di `contoh ui/brand/`.
4. Kalau frontend sudah dipindah ke monorepo, jalankan OpenCode dari dalam `apps/web`.

Tempel seluruh blok di bawah ke OpenCode.

```text
Baca AGENTS.md, README.md, docs/rencana-redesain.md, docs/audit-ui-awal.md,
src/styles/globals.css, dan gambar di "contoh ui/". Baca seluruh instruksi ini
sampai habis sebelum mengubah file apa pun.

TUJUAN
1. Memperbaiki bug UI yang membuat teks sulit dibaca dan target sentuh terlalu kecil.
2. Menambah sistem tema: Terang, Gelap, dan Ikuti sistem.
3. Menyempurnakan tampilan dengan arah "Kedai hangat, cepat dibaca": terang,
   foto menu jadi pusat perhatian, nota bergaya struk, angka besar yang terbaca
   dari jarak satu lengan.
Ini bukan pekerjaan fitur. Daftar fitur tetap seperti sekarang.

BATAS YANG TIDAK BOLEH DILANGGAR
1. Tidak ada fitur, endpoint, field kontrak, atau dependensi baru. Semua yang
   masuk "Yang tidak dikerjakan" di Project Plan tetap tidak disentuh.
2. Logika di src/lib/calc.ts, src/api/*, src/types/*, dan src/mocks/* tidak
   diubah. File baru yang diizinkan hanya yang disebut di instruksi ini.
3. Kerjakan di branch desain/final dari main terbaru. Satu langkah = satu commit
   berformat fix(fe): ..., feat(fe): ..., atau style(fe): .... Jangan merge
   sendiri. Tanpa Co-Authored-By dan tanpa menyebut AI di commit, PR, atau
   komentar kode.
4. Setelah setiap langkah jalankan: npm run typecheck && npm run lint &&
   npm test && npm run build. Kalau dua kali perbaikan tetap gagal, kembalikan
   perubahan langkah itu dengan git restore, lalu laporkan penyebabnya.
5. Yang wajib tetap terjaga: satu pesanan selesai dalam 2 ketukan (ketuk menu,
   ketuk Simpan); target sentuh minimal 44 x 44 px; tidak ada scroll horizontal
   di lebar 360 px; JavaScript awal di bawah 300 KB gzip; semua tes lama lulus.
6. Dilarang memakai opacity untuk memudarkan TEKS (opacity-*, text-*/60,
   text-white/70, dan sejenisnya). Teks yang sekunder memakai token
   --muted-foreground, bukan transparansi.

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
  isi keranjang PoS, buka nota di ponsel, dan buka tutup shift.
- Screenshot SEBELUM untuk semua halaman di 390 px dan 1366 px ke .qa/sebelum/.
- Jalankan axe-core (WCAG 2.1 AA) di setiap halaman. Selain itu cari dengan
  grep dan pemeriksaan mata: teks yang diberi opacity, teks yang hanya muncul
  saat hover, teks di bawah 12 px, dan elemen interaktif di bawah 44 px.
- Cocokkan hasilnya dengan docs/audit-ui-awal.md. Tambahkan temuan baru dari
  branch ini, termasuk hasil redesain sebelumnya yang belum ada di main.
  Simpan sebagai docs/audit-ui-awal.md yang diperbarui.

======================================================================
LANGKAH 1: PERBAIKI BUG UI
======================================================================
Kerjakan semua temuan di docs/audit-ui-awal.md, minimal yang ini:
1. Tombol nonaktif (components/ui/button.tsx): ganti disabled:opacity-50
   dengan disabled:bg-muted disabled:text-muted-foreground disabled:border-
   transparent. Di bawah tombol utama yang nonaktif, tampilkan satu kalimat
   alasan, misalnya "Centang konfirmasi stok awal untuk membuka shift."
2. Kartu menu "Bahan kurang" (PosPage.tsx): hapus opacity pada kartu. Foto atau
   ilustrasinya saja yang grayscale. Nama dan harga tetap warna penuh. Alasan
   ditulis dengan ikon AlertCircle dan warna --bahaya, misalnya "Sirup leci
   habis". Kartu tetap disabled dan aria-label menyebut alasannya.
3. Harga di kartu menu: 18 px, tebal 800, warna --teh. Hapus text-foreground/80.
4. Grafik omzet 7 hari (OwnerHomePage.tsx): nominal "463rb" selalu tampil di
   atas batang (12 px), label hari 12 px. Hapus pola hidden group-hover:block
   dan text-[11px].
5. Tab (components/ui/tabs.tsx): tab tidak aktif memakai text-muted-foreground.
6. Tombol tutup sheet dan dialog: area sentuh 44 x 44 px, ikon 20 px, tanpa
   opacity, label "Tutup".
7. Indikator langkah tutup shift: tampilkan nama langkah aktif dan teks
   "Langkah 1 dari 3" di ponsel.
8. Label kategori "Lainnya" diganti "Paket" (lib/format.ts). Nilai data
   lainnya tetap.
9. Semua target sentuh di bawah 44 px dinaikkan ke 44 px: chip shift, lonceng,
   avatar, item sidebar, chip filter, tombol Ubah dan Nonaktifkan, saran
   pertanyaan asisten, ikon bantuan "?" (ikon boleh kecil, area sentuhnya yang
   44 px).
10. Bar nota melayang di ponsel: teks dan ikon putih penuh.

======================================================================
LANGKAH 2: SISTEM DESAIN (docs/sistem-desain.md, lalu globals.css)
======================================================================
Pakai nilai di bawah apa adanya. Kalau ada foto di "contoh ui/brand/", ambil
warna primer dan aksen dari foto itu, tulis hex dan bagian foto asalnya, lalu
hitung ulang kontrasnya.

Warna tema TERANG (:root)
  --kertas #f6f7f4  --kartu #ffffff  --tinta #1b2420  --abu #58635d
  --garis #dadfd6   --muted #eceee8
  --teh #8a3b12  --teh-tua #6e2d0c  --teh-muda #f6e7dc
  --jagung #f2b705  --jagung-muda #fff3c4
  --ok #1f7a4d  --ok-muda #ddf1e5  --ok-teks #14563a
  --bahaya #b42318  --bahaya-muda #fde4e1
  --warn #8a4f00  --warn-muda #fdf0d5
  --info #1e4fa3  --info-muda #e2eafa
  --shopee #9a3412  --shopee-muda #fff0e6
  --kat-teh #8a3b12 / #f6e7dc   --kat-jasuke #9a6b00 / #fff3c4
  --kat-paket #2d5a87 / #e3ecf6

Warna tema GELAP (.dark)
  --kertas #141a17  --kartu #1c2420  --tinta #eef1ec  --abu #a9b3ad
  --garis #2e3833   --muted #252f2a
  --teh #e9a06f (teks di atasnya #1b120c)  --teh-tua #f3c3a1  --teh-muda #3a2418
  --jagung #f2b705 (teks di atasnya #1b2420)  --jagung-muda #3a3006
  --ok #4cc38a  --ok-muda #123826  --ok-teks #bdeed3
  --bahaya #ff8a7a  --bahaya-muda #3d1712
  --warn #f0b35a  --warn-muda #3a2a0c
  --info #8fb3ff  --info-muda #172645
  --shopee #ff9a66  --shopee-muda #3a1d10
  --kat-teh #e9a06f / #3a2418   --kat-jasuke #e9c25a / #3a3006
  --kat-paket #8fb7e0 / #172b40

Petakan semua token shadcn (--background, --foreground, --card, --primary,
--primary-foreground, --muted-foreground, --border, --input, --ring, dan
lainnya) ke token di atas untuk kedua tema. Hijau hanya untuk status, bukan
warna merek.

Kontras yang sudah dihitung dan wajib dipertahankan (tulis tabelnya di dokumen):
  terang: harga dan tombol Simpan 7,7:1; total nota 15,9:1; teks sekunder 6,3:1;
          tombol nonaktif 5,3:1; label bahan kurang 7,3:1.
  gelap:  teks utama 13,9:1; teks sekunder 7,4:1; harga 7,4:1;
          tombol Simpan 8,5:1; status bahaya 6,9:1; chip shift 10,1:1.
Setiap pasangan teks dan latar lain minimal 4,5:1, teks 24 px ke atas minimal 3:1.

Tipografi: Plus Jakarta Sans, angka memakai tabular-nums.
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
melayang (bar nota ponsel, sheet, popover); di tema gelap bayangan diganti garis.

Gerak, hanya sebagai jawaban atas aksi pengguna:
  tambah menu: kartu scale 0,97 selama 120 ms; lencana jumlah scale 1,25 lalu
  kembali dalam 260 ms; baris nota yang berubah berlatar --jagung-muda yang
  memudar dalam 600 ms.
  simpan: tombol menjadi --ok dengan ikon centang dan teks "Tersimpan" selama
  900 ms, lalu keranjang dikosongkan.
  Ganti tema: tanpa animasi.
  Semua gerak mati saat prefers-reduced-motion: reduce. Tidak ada animasi masuk
  per bagian, parallax, atau shimmer dekoratif.

Ikon lucide stroke 2 ukuran 16, 18, atau 20. Tanpa emoji. Cincin fokus 3 px
warna --jagung di kedua tema.

Buat halaman /dev/tokens (hanya terdaftar bila import.meta.env.DEV) yang
menampilkan semua token di kedua tema berdampingan, skala huruf, radius, dan
contoh tombol termasuk tombol nonaktif.
Commit, tunjukkan ringkasan, lalu BERHENTI dan tunggu persetujuan saya.

======================================================================
LANGKAH 3: SISTEM TEMA (Terang, Gelap, Ikuti sistem)
======================================================================
File baru yang diizinkan: src/stores/tema-store.ts, src/lib/tema.ts,
src/components/PilihTema.tsx.

1. Store: zustand persist dengan key "mrtea-tema", nilai pilihan
   "terang" | "gelap" | "sistem", bawaan "sistem". Pilihan disimpan per
   perangkat dan berlaku untuk semua akun di perangkat itu.
2. lib/tema.ts: fungsi terapkanTema(pilihan) yang menentukan tema akhir (untuk
   "sistem" membaca matchMedia("(prefers-color-scheme: dark)")), menambah atau
   menghapus kelas "dark" di <html>, mengisi style.colorScheme, dan memperbarui
   <meta name="theme-color"> (#f6f7f4 terang, #141a17 gelap). Saat pilihan
   "sistem", dengarkan perubahan matchMedia dan terapkan ulang tanpa reload.
3. Cegah kedipan: di index.html, sebelum stylesheet, tambahkan skrip inline
   kecil yang membaca localStorage "mrtea-tema" (format persist zustand:
   {"state":{"pilihan":"..."}}) dan langsung memasang kelas "dark" bila perlu.
   Bungkus dengan try/catch.
4. PilihTema.tsx: kontrol segmen tiga pilihan dengan ikon Sun, Moon, Monitor
   dan teks "Terang", "Gelap", "Ikuti sistem". Tinggi 44 px, role radiogroup,
   bisa dipakai dengan keyboard. Pasang di:
   - menu akun (avatar) di header, untuk semua peran;
   - halaman Bantuan, bagian "Tampilan";
   - pojok halaman login, versi ikon saja dengan aria-label "Tema tampilan".
5. Komponen yang ikut tema: Toaster sonner (prop theme dari store), warna
   grafik recharts lewat var(--...) bukan hex, popover tur driver.js, iframe
   dasbor Streamlit (beri latar --kartu dan catatan bila dasbor tetap terang),
   skeleton, dan semua chip status.
6. Foto menu tidak diberi filter di tema gelap.
7. Tes: tambahkan tes unit untuk terapkanTema (terang, gelap, sistem terang,
   sistem gelap, perubahan matchMedia). Uji juga dengan emulasi
   prefers-color-scheme gelap di browser.

======================================================================
LANGKAH 4: FOTO MENU
======================================================================
- Salin gambar di "contoh ui/foto-menu/" ke public/menu/<menuId>.webp, ukuran
  640 x 480, kualitas 80, masing-masing di bawah 60 KB.
- Buat src/lib/foto-menu.ts dengan fungsi fotoMenu(menu) yang mengembalikan
  menu.fotoUrl bila backend nanti mengirimnya, lalu path lokal, lalu null. Bila
  null, tampilkan ilustrasi SVG garis per kategori.
- Foto lokal adalah ilustrasi buatan AI. Tampilkan label "Ilustrasi AI" (12 px,
  latar --kartu 85%) di pojok kiri bawah foto sampai PIC mengirim foto asli.
  Jangan mengambil foto dari Google Maps, Instagram, atau situs lain.
- Semua <img> menu: loading="lazy", decoding="async", width dan height diisi,
  alt kosong karena nama menu sudah tertulis.

======================================================================
LANGKAH 5: KASIR
======================================================================
Desktop (>= 1024 px): header 64 px (logo, chip shift --ok-muda berisi
"Shift pagi, dibuka 07.02 oleh Rina", navigasi, avatar). Di bawahnya dua kolom:
daftar menu (fleksibel) dan panel nota 360 sampai 420 px.
- Tile kategori Semua, Teh, Jasuke, Paket: tinggi 56 px, ikon kategori dalam
  kotak 40 px berwarna -muda, nama, dan jumlah menu. Tile aktif berlatar -muda
  dengan garis 2 px warna kategori. Kolom cari di kanan.
- Grid kartu: repeat(auto-fill, minmax(176px, 1fr)), gap 12 px. Kartu adalah
  <button> berisi foto 4:3, nama maksimal 2 baris, dan harga. Menu di keranjang:
  garis kartu berwarna kategori dan lencana jumlah di pojok kanan atas foto.
  Hapus strip warna di sisi kiri kartu yang ada sekarang.
- Panel nota bergaya struk: judul "Pesanan baru" dan nomor, segmen Toko /
  Shopee Food, garis putus-putus 2 px, item (thumbnail 44 px, titik warna
  kategori, nama, "2 × Rp 5.000 = Rp 10.000", tombol - dan + 44 px), kontrol
  gula Tanpa / Sedikit / Normal di bawah item teh bila fitur itu sudah ada di
  kode, garis putus-putus, ringkasan, total 36 px, dan tombol "Simpan pesanan"
  56 px yang selalu terlihat di dasar panel.
- Keranjang kosong: ilustrasi gelas kosong dan kalimat "Ketuk menu di kiri
  untuk mulai mencatat pesanan."
- Ponsel: header ringkas, segmen kanal, chip kategori yang bisa digeser, grid
  2 kolom, bar bawah melayang (jumlah item, total 22 px, "Lihat nota",
  "Simpan").
- Riwayat pesanan: thumbnail menu pertama, nomor, waktu, chip kanal, total, dan
  status berikon plus teks.

======================================================================
LANGKAH 6: PEMILIK
======================================================================
- Beranda: grid 12 kolom, gap 16 px, ukuran kartu sesuai kepentingan:
  omzet hari ini 7 kolom x 2 baris (angka 44 px, jumlah pesanan, bar Toko dan
  Shopee Food dengan nominal, grafik pesanan per jam dengan jam puncak --teh);
  shift aktif 5 kolom berlatar --ok-muda; stok menipis 5 kolom (3 bahan, bar
  sisa, status berikon); terlaris 4 kolom dengan thumbnail; belanja untuk besok
  4 kolom berlatar --jagung-muda dengan chip "Simulasi" bila sumberData bukan
  asli; pintasan 4 kolom bergaris putus-putus. Di bawah 900 px satu kolom dengan
  urutan omzet, shift, stok, terlaris.
- Rekap harian dan perkiraan belanja: angka utama 28 px. Tabel tetap memakai
  ResponsiveTable dengan sel angka rata kanan dan tabular.
- Master menu: thumbnail 56 x 42 px di tabel, area foto di form dengan
  pratinjau dan label "Ilustrasi AI" bila memakai foto lokal.

======================================================================
LANGKAH 7: AUDIT AKHIR (@qa-expert)
======================================================================
Tulis docs/audit-desain.md dengan kolom halaman, temuan, status. Periksa di
KEDUA tema:
- axe-core WCAG 2.1 AA: 0 pelanggaran di setiap halaman.
- grep src/ untuk opacity pada teks, text-*/[0-9]+ pada teks, text-[1[01]px],
  dan group-hover:block: hasilnya nol atau masing-masing punya alasan tertulis.
- grep warna hex di src/ di luar globals.css: nol.
- Target sentuh 44 px, tidak ada scroll horizontal di 360 px, fokus keyboard
  terlihat.
- Keadaan memuat, kosong, dan galat ada di setiap halaman.
- Pola generik yang dilarang: gradien, glassmorphism, neon, kartu identik
  berbayangan sama, strip warna di sisi kiri kartu, label kapital semua, titik
  tengah sebagai pemisah, em dash, panah di teks tombol, emoji, penomoran
  dekoratif, animasi masuk per bagian, kalimat pemasaran.
- Ganti tema dari Terang ke Gelap ke Ikuti sistem tanpa reload. Pilihan tetap
  setelah reload. Tidak ada kedipan tema terang saat membuka aplikasi dalam
  mode gelap.
Screenshot SESUDAH ke .qa/sesudah/: semua halaman, tema terang dan gelap, 390 px
dan 1366 px.

SELESAI BILA
- typecheck, lint, test, build lulus dan bundle awal di bawah 300 KB gzip.
- Semua temuan di docs/audit-ui-awal.md berstatus selesai.
- docs/sistem-desain.md dan docs/audit-desain.md lengkap.
- Pull request ke main berisi ringkasan, daftar commit, dan screenshot sebelum
  dan sesudah untuk kasir (ponsel dan desktop), nota, beranda pemilik, master
  menu, dan pilihan tema. Tanpa atribusi AI.
```
