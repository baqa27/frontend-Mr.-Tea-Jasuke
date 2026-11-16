# Sistem Desain Mr. Tea & Jasuke

Dokumen ini menggantikan "nilai usulan" PRD 10.3: font Plus Jakarta Sans menggantikan Inter, primer `#8a3b12` menggantikan `#7C2D12`, dan hierarki radius menggantikan satu radius 8 px. Nilai warna status tema terang tetap mengikuti PRD.

Arah: "Kedai hangat, cepat dibaca". Aplikasi kasir yang terang dan minimalis, foto menu sebagai pusat perhatian, nota bergaya struk sebagai elemen khas. Dokumen ini acuan tampilan untuk seluruh layar; token warna, tipografi, radius, jarak, gerak, ikon, dan ilustrasi diatur di sini.

Prinsip:

1. Kasir cepat: alur dua ketukan, tanpa dialog untuk aksi cepat, target sentuh minimal 44 px.
2. Foto menu dulu: kartu menu memakai foto 4:3, teks pendukung, dan harga besar.
3. Nota adalah ciri khas: satu-satunya ornamen adalah tepi bergerigi `nota-edge`.
4. Bidang datar: tanpa gradien, glassmorphism, neon, atau animasi masuk per bagian.
5. Hijau hanya untuk status sukses (`ok`), bukan warna merek, supaya tidak tertukar dengan merek es teh lain.

## 1. Warna

### 1.1 Token dasar

Tidak ada foto identitas toko di `contoh ui/brand/`, jadi token yang sudah ada dipertahankan dan lolos uji kontras. Warna kategori ditambahkan sebagai turunan kerabat warna yang sudah ada. Nilai di bawah untuk tema terang.

Latar netral:

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `kertas` | `#f6f7f4` | `#141a17` | Latar aplikasi |
| `tinta` | `#1b2420` | `#eef1ec` | Teks utama |
| `kartu` | `#ffffff` | `#1c2420` | Permukaan kartu dan panel |

Merek:

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `teh` | `#8a3b12` | `#e9a06f` | Primer, tombol utama, tautan |
| `teh-tua` | `#6e2d0c` | `#f3c3a1` | Teks harga di kartu menu |
| `teh-muda` | `#f6e7dc` | `#3a2418` | Latar tile kategori teh aktif, strip |
| `jagung` | `#f2b705` | `#f2b705` | Aksen: nota PoS dan chip shift aktif saja |
| `jagung-muda` | `#fff3c4` | `#3a3006` | Latar sementara baris nota yang berubah |

Status (selalu dengan ikon dan teks):

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `ok` | `#1f7a4d` | `#4cc38a` | Stok aman, pesanan tersimpan, sukses |
| `ok-muda` | `#ddf1e5` | `#123826` | Latar status ok |
| `ok-teks` | `#14563a` | `#bdeed3` | Teks pada latar ok-muda |
| `warn` | `#8a4f00` | `#f0b35a` | Stok menipis, perlu perhatian |
| `warn-muda` | `#fdf0d5` | `#3a2a0c` | Latar status warn |
| `bahaya` | `#b42318` | `#ff8a7a` | Stok habis, galat, aksi permanen |
| `bahaya-muda` | `#fde4e1` | `#3d1712` | Latar status bahaya |
| `info` | `#1e4fa3` | `#8fb3ff` | Informasi netral |
| `info-muda` | `#e2eafa` | `#172645` | Latar status info |

Tambahan:

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `shopee` | `#9a3412` | `#ff9a66` | Kanal Shopee Food |
| `shopee-muda` | `#fff0e6` | `#3a1d10` | Latar chip Shopee |

### 1.2 Token kategori

Tile kategori, strip kartu menu, dan titik kategori di nota memakai tiga warna kategori, masing-masing dengan versi `-muda` untuk latar tile aktif. Warnanya dipilih dari kerabat merek: teh sama dengan `teh`, jasuke versi tua agar tetap terbaca sebagai teks, dan paket memakai biru tua agar tidak tertukar dengan status `info`.

Hijau tidak dipakai sebagai warna kategori.

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `kat-teh` | `#8a3b12` | `#e9a06f` | Strip kartu menu teh, titik nota, ilustrasi |
| `kat-teh-muda` | `#f6e7dc` | `#3a2418` | Latar tile kategori teh aktif |
| `kat-jasuke` | `#9a6b00` | `#e9c25a` | Strip kartu menu jasuke, titik nota, ilustrasi |
| `kat-jasuke-muda` | `#fff3c4` | `#3a3006` | Latar tile kategori jasuke aktif |
| `kat-paket` | `#2d5a87` | `#8fb7e0` | Strip kartu menu paket, titik nota, ilustrasi |
| `kat-paket-muda` | `#e3ecf6` | `#172b40` | Latar tile kategori paket aktif |

Aturan pemakaian:

- Strip kategori di kiri foto kartu menu: latar `kat-*`, lebar 4 px.
- Tile kategori: latar `kat-*-muda`, garis tepi `kat-*` hanya saat aktif.
- Titik kategori di nota: lingkaran 8 px memakai `kat-*`, selalu didampingi nama kategori bila ruang cukup.

### 1.3 Kontras

Semua pasangan diukur dengan rumus WCAG 2.1. Angka-rasio ditulis sebagai "teks pada latar".

Tema terang:

| Pasangan | Rasio | Lolos |
|---|---|---|
| `tinta` pada `kertas` | 14.8:1 | AA, AAA |
| `tinta` pada `kartu` | 15.9:1 | AA, AAA |
| `muted-foreground` pada `kartu` | 6.3:1 | AA |
| `muted-foreground` pada `kertas` | 5.8:1 | AA |
| `teh-tua` pada `kartu` (harga) | 7.7:1 | AA, AAA |
| `tinta` pada `jagung` (chip shift) | 8.8:1 | AA, AAA |
| `tinta` pada `jagung-muda` (baris nota berubah) | 14.3:1 | AA, AAA |
| `teh` pada `primary-foreground` (tombol Simpan) | 7.7:1 | AA, AAA |
| `tinta` pada `kartu` (total nota) | 15.9:1 | AA, AAA |
| `muted-foreground` pada `kartu` (tombol nonaktif) | 5.3:1 | AA |
| `bahaya` pada `kartu` (label bahan kurang) | 7.3:1 | AA, AAA |

Tema gelap:

| Pasangan | Rasio | Lolos |
|---|---|---|
| `tinta` pada `kertas` | 15.8:1 | AA, AAA |
| `tinta` pada `kartu` | 14.3:1 | AA, AAA |
| `muted-foreground` pada `kartu` | 7.4:1 | AA |
| `teh-tua` pada `kartu` (harga gelap) | 7.4:1 | AA, AAA |
| `tinta-tetap` pada `teh` (tombol Simpan) | 8.5:1 | AA, AAA |
| `bahaya` pada `kartu` (status bahaya) | 6.9:1 | AA, AAA |
| `tinta` pada `jagung` (chip shift) | 10.1:1 | AA, AAA |

Semua pasangan teks dan latar lain minimal 4,5:1, teks 24 px ke atas minimal 3:1.

## 2. Tipografi

Satu keluarga font: Plus Jakarta Sans (variabel). Tidak ada font kedua.

### 2.1 Skala

| Peran | Ukuran | Line-height | Berat | Kelas |
|---|---|---|---|---|
| Keterangan, label ilustrasi, label sumbu grafik | 12 px | 16 px | 500 | `text-xs font-medium` |
| Tombol, isi tabel, navigasi | 14 px | 20 px | 500–700 | `text-sm font-medium` / `font-bold` |
| Nama menu, judul kartu | 16 px | 24 px | 700 | `text-base font-bold` |
| Harga di kartu menu | 18 px | 24 px | 800 | `text-[18px]/6 font-extrabold` |
| Judul nota, angka sekunder | 22 px | 28 px | 800 | `text-[22px]/7 font-extrabold` |
| Judul halaman, angka KPI sedang | 28 px | 34 px | 800 | `text-[28px]/8.5 font-extrabold` |
| Total nota | 36 px | 40 px | 800 | `text-[36px]/10 font-extrabold` |
| Omzet hari ini (satu-satunya) | 44 px | 48 px | 800 | `text-[44px]/12 font-extrabold` |

Tidak ada ukuran di luar skala ini. Tidak ada teks di bawah 12 px. Tidak ada label kapital semua.

### 2.2 Angka

Semua angka harga, stok, kuantitas, dan total memakai kelas `num` (sudah ada di `globals.css`) untuk `tabular-nums` dan `tnum` Plus Jakarta Sans.

## 3. Bentuk dan jarak

### 3.1 Radius

| Radius | Kegunaan | Kelas |
|---|---|---|
| 6 px | Input, chip, segmented, tombol kecil | `rounded-md` |
| 8 px | Tombol, thumbnail | `rounded-[8px]` |
| 10 px | Foto menu di dalam kartu | `rounded-[10px]` |
| 12 px | Kartu menu, panel, kartu bento | `rounded-xl` |
| 16 px | Sheet, dialog, popover besar | `rounded-2xl` |

### 3.2 Jarak

Skala 4 px: 4, 8, 12, 16, 24, 32, 48. Jarak antar bagian utama halaman 24 px, dalam kartu 12 px, elemen sejenis 8 px. Tidak ada nilai jarak di luar skala.

### 3.3 Garis tepi dan bayangan

- Kartu biasa: garis tepi 1 px `border` (`#dadfd6` terang, `#2e3833` gelap), tanpa bayangan.
- Satu bayangan, hanya untuk elemen melayang: sheet, popover, dan bar nota di ponsel. Nilainya `0 4px 16px rgb(27 36 32 / 0.12)`, token `--shadow-melayang` di `globals.css`.
- Di tema gelap bayangan diganti garis tepi.

## 4. Gerak

Gerak hanya sebagai respons aksi pengguna. Tidak ada animasi masuk per bagian, parallax, atau gerak yang berjalan sendiri. Sheet dan dialog memakai transisi bawaan shadcn.

| Aksi | Gerak | Durasi |
|---|---|---|
| Tambah menu | Kartu mengecil ke 0.97 lalu kembali (`active:scale-[0.97]`) | 120 ms |
| Tambah menu | Lencana jumlah memantul scale 1.25 lalu kembali | 260 ms |
| Baris nota berubah | Latar `jagung-muda` memudar ke transparan | 600 ms |
| Pesanan tersimpan | Tombol menjadi `ok` dengan ikon centang dan teks "Tersimpan" sebelum keranjang dikosongkan | 900 ms |
| Ganti tema | Tanpa animasi | — |

Semua gerak mati saat `prefers-reduced-motion: reduce` aktif, lewat aturan yang sudah ada di `globals.css` (durasi animasi dan transisi dipaksa 0.01 ms). Tidak ada animasi masuk per bagian, parallax, atau shimmer dekoratif.

## 5. Ikon dan ilustrasi

- Ikon: lucide, ketebalan garis seragam (stroke `2` ukuran 16, 18, atau 20). Tanpa emoji di antarmuka.
- Ilustrasi kategori (SVG, garis sederhana, warna token `kat-*` dan `tinta`): gelas teh tersegel (teh), cup jagung susu keju (jasuke), paket hemat (paket).
- Ilustrasi keadaan kosong, memakai gaya garis yang sama: gelas kosong untuk keranjang kosong, rak kosong untuk stok kosong. Warna garis `tinta`, aksen `kat-*` secukupnya.
- Foto menu lokal adalah ilustrasi buatan AI. Tampilkan label "Ilustrasi AI" (12 px, latar `--kartu` 85%) di pojok kiri bawah foto sampai PIC mengirim foto asli. Jangan mengambil foto dari Google Maps, Instagram, atau situs lain.
- Semua `<img>` menu: `loading="lazy"`, `decoding="async"`, `width` dan `height` diisi, `alt` kosong karena nama menu sudah tertulis.

## 6. Tata letak dasar

- Lebar konten maksimum 1366 px, bidang kasir fokus ke tengah.
- Ponsel: bottom navigation, bar nota menempel di bawah, konten satu kolom. Desktop: sidebar kiri, nota menempel kanan.
- Tabel memakai `ResponsiveTable`, otomatis menjadi kartu di bawah 768 px, tanpa scroll horizontal di 360 px.
- Target sentuh minimal 44 px di ponsel. Fokus keyboard: cincin 3 px warna `--jagung` di kedua tema.

## 7. Gaya penulisan antarmuka

- Bahasa Indonesia baku, kalimat aktif, sentence case. Tanpa kapital semua, tanpa pemisah titik tengah, tanpa em dash, tanpa panah di teks tombol.
- Tombol memakai kata kerja yang menjelaskan akibat: "Simpan Pesanan", "Buka Shift", "Tutup Shift".
- Status selalu teks dan ikon, bukan warna saja.
- Dilarang memakai opacity untuk memudarkan TEKS (`opacity-*`, `text-*/60`, `text-white/70`, dan sejenisnya). Teks yang sekunder memakai token `--muted-foreground`, bukan transparansi.

## 8. Status implementasi

- Warna globals: token di `src/styles/globals.css` (tema terang pada `:root`, tema gelap pada `.dark`).
- Halaman `/dev/tokens` (hanya terdaftar bila `import.meta.env.DEV`) menampilkan semua token di kedua tema berdampingan, skala huruf, radius, dan contoh tombol termasuk tombol nonaktif.
- Tema tersedia setelah Langkah 3 (store, skrip anti-kedipan, kontrol PilihTema).
- Foto lokal label "Ilustrasi AI" sampai foto PIC.