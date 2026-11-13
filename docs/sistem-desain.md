# Sistem Desain Mr. Tea & Jasuke

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
| `kertas` | `#f6f7f4` | `#1a1d1b` | Latar aplikasi |
| `tinta` | `#1b2420` | `#f6f7f4` | Teks utama |
| `card` | `#ffffff` | `#222623` | Permukaan kartu dan panel |

Merek:

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `teh` | `#8a3b12` | `#c47c4d` | Primer, tombol utama, tautan |
| `teh-tua` | `#6e2d0c` | `#e0b08c` | Teks harga di kartu menu |
| `teh-muda` | `#f6e7dc` | `#3d2212` | Latar tile kategori teh aktif, strip |
| `jagung` | `#f2b705` | `#f2b705` | Aksen: nota PoS dan chip shift aktif saja |
| `jagung-muda` | `#fff3c4` | `#fff3c4` | Latar sementara baris nota yang berubah |

Status (selalu dengan ikon dan teks):

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `ok` | `#1f7a4d` | `#5ec98b` | Stok aman, pesanan tersimpan, sukses |
| `warn` | `#9a5800` | `#f2b705` | Stok menipis, perlu perhatian |
| `bahaya` | `#b42318` | `#f87060` | Stok habis, galat, aksi permanen |
| `info` | `#1e4fa3` | `#7aa0e8` | Informasi netral |

### 1.2 Token kategori baru

Tile kategori, strip kartu menu, dan titik kategori di nota memakai tiga warna kategori, masing-masing dengan versi `-muda` untuk latar tile aktif. Warnanya dipilih dari kerabat merek: the sama dengan `teh`, jagung versi tua agar tetap terbaca sebagai teks, dan paket memakai ungu tua agar tidak tertukar dengan status `info`.

Hijau tidak dipakai sebagai warna kategori.

| Token | Nilai (terang) | Nilai (gelap) | Kegunaan |
|---|---|---|---|
| `kat-teh` | `#8a3b12` | `#e0915e` | Strip kartu menu teh, titik nota, ilustrasi |
| `kat-teh-muda` | `#f6e7dc` | `#3d2212` | Latar tile kategori teh aktif |
| `kat-jasuke` | `#8a5a00` | `#e6b23a` | Strip kartu menu jasuke, titik nota, ilustrasi |
| `kat-jasuke-muda` | `#fdf2cc` | `#33290f` | Latar tile kategori jasuke aktif |
| `kat-paket` | `#5c3b88` | `#bfa2e8` | Strip kartu menu paket, titik nota, ilustrasi |
| `kat-paket-muda` | `#f1ebf7` | `#2e213d` | Latar tile kategori paket aktif |

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
| `tinta` pada `card` | 15.9:1 | AA, AAA |
| `muted-foreground` pada `card` | 6.25:1 | AA |
| `muted-foreground` pada `kertas` | 5.82:1 | AA |
| `teh` pada `card` (harga) | 7.73:1 | AA, AAA |
| `teh-tua` pada `card` (harga) | 10.28:1 | AA, AAA |
| `tinta` pada `jagung` (chip shift) | 8.75:1 | AA, AAA |
| `tinta` pada `jagung-muda` (baris nota berubah) | 14.3:1 | AA, AAA |

Tombol Simpan Pesanan: teks `primary-foreground` `#fff8f0` pada `teh` `#8a3b12`, rasio 7.34:1. Total nota dan angka KPI memakai `tinta` pada `card`, 15.9:1. Semua pasangan harga, total, dan tombol Simpan minimal 7:1 sesuai target.

Warna kategori saat dipakai sebagai teks pada latar terang:

| Pasangan | Rasio | Lolos |
|---|---|---|
| `kat-teh` pada `card` | 7.73:1 | AA, AAA |
| `kat-jasuke` pada `card` | 5.93:1 | AA |
| `kat-paket` pada `card` | 8.62:1 | AA, AAA |

Tema gelap:

| Pasangan | Rasio | Lolos |
|---|---|---|
| `tinta` pada `kertas` | 15.8:1 | AA, AAA |
| `tinta` pada `card` | 14.3:1 | AA, AAA |
| `muted-foreground` pada `card` | 6.89:1 | AA |
| `teh-tua` pada `card` (harga gelap) | 7.86:1 | AA, AAA |

Tombol Simpan di tema gelap: `tinta-tetap` `#1b2420` pada `teh` `#c47c4d`, rasio 4.8:1, lolos AA untuk teks besar dan ikon; label tombol Simpan di kasir memakai ukuran 18 px tebal sehingga termasuk teks besar. Harga, total, dan KPI di tema gelap memakai `tinta` pada `card` di atas 7:1.

## 2. Tipografi

Satu keluarga font: Plus Jakarta Sans (variabel). Tidak ada font kedua.

### 2.1 Skala

| Peran | Ukuran | Line-height | Berat | Kelas |
|---|---|---|---|---|
| KPI pemilik | 36 px | 44 px | 800 | `text-4xl font-extrabold` |
| Total nota | 28 px | 36 px | 800 | `text-[28px]/9 font-extrabold` |
| Judul halaman | 22 px | 28 px | 700 | `text-[22px]/7 font-bold` |
| Harga kartu menu | 18 px | 28 px | 700 | `text-lg font-bold` |
| Teks isi | 16 px | 24 px | 400 | `text-base` |
| Teks sekunder | 14 px | 20 px | 400 | `text-sm` |
| Label, badge, meta | 12 px | 16 px | 500 | `text-xs font-medium` |

Tidak ada ukuran di luar skala ini. Ukuran berikut dipakai konsisten:

- Harga di kartu menu: 18 px (`text-lg`), warna `teh-tua`, kelas `num` agar angkanya tabular.
- Total di nota: 28 px, `tinta`, kelas `num`.
- Angka KPI di beranda pemilik: 36 px, `tinta`, kelas `num`.

### 2.2 Angka

Semua angka harga, stok, kuantitas, dan total memakai kelas `num` (sudah ada di `globals.css`) untuk `tabular-nums` dan `tnum` Plus Jakarta Sans.

## 3. Bentuk dan jarak

### 3.1 Radius

| Radius | Kegunaan | Kelas |
|---|---|---|
| 6 px | Input, chip, segmented, tombol kecil | `rounded-md` |
| 10 px | Foto menu di dalam kartu | `rounded-[10px]` |
| 12 px | Kartu menu, panel, kartu bento | `rounded-xl` |
| 16 px | Sheet, dialog, popover besar | `rounded-2xl` |

### 3.2 Jarak

Skala 4 px: 4, 8, 12, 16, 24, 32, 48. Jarak antar bagian utama halaman 24 px, dalam kartu 12 px, elemen sejenis 8 px. Tidak ada nilai jarak di luar skala.

### 3.3 Garis tepi dan bayangan

- Kartu biasa: garis tepi 1 px `border` (`#dadfd6` terang, `#3a3f3b` gelap), tanpa bayangan.
- Satu bayangan, hanya untuk elemen melayang: sheet, popover, dan bar nota di ponsel. Nilainya `0 4px 16px rgb(27 36 32 / 0.12)`, token `--shadow-melayang` di `globals.css`.

## 4. Gerak

Gerak hanya sebagai respons aksi pengguna. Tidak ada animasi masuk per bagian, parallax, atau gerak yang berjalan sendiri. Sheet dan dialog memakai transisi bawaan shadcn.

| Aksi | Gerak | Durasi |
|---|---|---|
| Tambah menu | Kartu mengecil ke 0.97 lalu kembali (`active:scale-[0.97]`) | 120 ms |
| Tambah menu | Lencana jumlah memantul sekali | 240 ms |
| Baris nota berubah | Latar `jagung-muda` memudar ke transparan | 600 ms |
| Pesanan tersimpan | Ikon centang di tombol Simpan sebelum keranjang dikosongkan | 900 ms |
| Hover kartu | Garis tepi menguat ke `teh`, tanpa gerak transformasi | 150 ms |

Semua gerak mati saat `prefers-reduced-motion: reduce` aktif, lewat aturan yang sudah ada di `globals.css` (durasi animasi dan transisi dipaksa 0.01 ms).

## 5. Ikon dan ilustrasi

- Ikon: lucide, ketebalan garis seragam (stroke `1.5` bila ikon diukur 20 px, `2` bila 16 px). Tanpa emoji di antarmuka.
- Ilustrasi kategori (SVG, garis sederhana, warna token `kat-*` dan `tinta`): gelas teh tersegel (teh), cup jagung susu keju (jasuke), paket hemat (paket).
- Ilustrasi keadaan kosong, memakai gaya garis yang sama: gelas kosong untuk keranjang kosong, rak kosong untuk stok kosong. Warna garis `tinta`, aksen `kat-*` secukupnya.

## 6. Tata letak dasar

- Lebar konten maksimum 1366 px, bidang kasir fokus ke tengah.
- Ponsel: bottom navigation, bar nota menempel di bawah, konten satu kolom. Desktop: sidebar kiri, nota menempel kanan.
- Tabel memakai `ResponsiveTable`, otomatis menjadi kartu di bawah 768 px, tanpa scroll horizontal di 360 px.

## 7. Gaya penulisan antarmuka

- Bahasa Indonesia baku, kalimat aktif, sentence case. Tanpa kapital semua, tanpa pemisah titik tengah, tanpa em dash, tanpa panah di teks tombol.
- Tombol memakai kata kerja yang menjelaskan akibat: "Simpan Pesanan", "Buka Shift", "Tutup Shift".
- Status selalu teks dan ikon, bukan warna saja.
