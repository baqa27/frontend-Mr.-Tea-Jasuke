# Audit Desain Akhir — Mr. Tea & Jasuke Frontend

Tanggal: 16 Nov 2026. Branch: `redesain/tahap-2-3` (commits 6ec1588, fb6c350, 8ebf7ef). Acuan: `docs/prompt-desain-final.md` (revisi 15 Nov 2026) dan PRD Frontend.

Audit otomatis: 56 screenshot rute (`/shift`, `/pos`, `/pesanan`, `/stok`, `/stok/barang-masuk`, `/shift/tutup`, `/bantuan`, `/asisten`, `/pemilik/beranda`, `/pemilik/rekap`, `/pemilik/perkiraan-belanja`, `/pemilik/master/menu`, `/pemilik/master/bahan`, `/pemilik/dasbor`) pada 390×844 dan 1366×900 px, masing-masing tema terang/gelap. Selain itu diperiksa overflow rute utama pada 360/390/768/1024/1280 px, persistensi tema, Esc dialog/tur, dan pengawal peran. Tema gelap dipasang dengan kelas `dark` di `<html>` sebelum setiap capture. `/pos`, `/stok/barang-masuk`, dan `/shift/tutup` dicapture pada keadaan dibatasi shift karena tidak ada shift aktif. `axe-core` tidak tersedia, jadi audit WCAG otomatis tidak diklaim.

| Halaman | Tema | Temuan | Status |
|---|---|---|---|
| Login | terang | PilihTema radiogroup (ikon Sun/Moon/Monitor, `aria-label="Tema tampilan"`) di pojok kanan atas; tombol Masuk 44 px | Lulus |
| Login | gelap | Sama, latar dan teks pasang token tanpa `text-white`/`bg-white` | Lulus |
| Beranda pemilik | terang | Omzet 7 kolom angka 44 px, label "Sementara"; shift aktif 5 kolom `bg-ok-muda`; 5 bahan terburuk 5 kolom; pintasan Rekap/Perkiraan Belanja/Dasbor; tanpa kartu terlaris/pesanan per jam/belanja besok | Lulus |
| Beranda pemilik | gelap | Sama, status stok pakai badge berikon + teks, bukan warna saja | Lulus |
| Beranda pemilik <768 px | terang | Satu kolom: omzet, shift, stok, pintasan | Lulus |
| Master menu | terang | Tabel thumbnail 56×42 px, `ResponsiveTable` tanpa scroll dokumen di 360–1280 px | Lulus |
| Master menu | gelap | Sama, tidak ada gradien/glassmorphism/neon | Lulus |
| Master menu @768/1024 px | terang | Tabel master menu/bahan tidak memicu scroll dokumen (`table-fixed`, `min-w-0` pada `main`, `overflow-x: clip` pada `html, body`) | Lulus |
| Master menu @768/1024 px | gelap | Sama | Lulus |
| Master bahan | terang | Tabel bahan, status pakai `StatusStokBadge`; filter chip Semua/Hampir habis/Habis/Aman | Lulus |
| Master bahan | gelap | Chip aktif `bg-primary text-primary-foreground`; label STK-01 | Lulus |
| PoS | terang | Sidebar desktop (NAV-01), topbar chip shift (NAV-03), lonceng, avatar; kolom cari di kanan; penanda "2 bahan hampir habis"; keranjang notasyle; kosong: gelas + "Ketuk menu untuk mulai mencatat pesanan." | Lulus |
| PoS | gelap | Sama, harga kartu menu `--teh`, lingkaran jumlah `text-tinta-tetap` pada jagung | Lulus |
| PoS ponsel 390 px | terang | Bottom navigation, bar ringkas keranjang menempel, target sentuh ≥44 px, tanpa scroll horizontal | Lulus |
| PoS ponsel 390 px | gelap | Sama | Lulus |
| PoS desktop 1366 px | terang | PoS dua kolom, daftar menu kiri, keranjang menempel kanan (360–420 px) | Lulus |
| PoS desktop 1366 px | gelap | Sama | Lulus |
| Pesanan / riwayat | terang | Thumbnail menu pertama, nomor, waktu, chip kanal, total, status berikon + teks | Lulus |
| Pesanan / riwayat | gelap | Sama | Lulus |
| Stok | terang | ResponsiveTable sel angka rata kanan, keadaan memuat/kosong/galat tiap halaman | Lulus |
| Stok | gelap | Sama | Lulus |
| Shift / Tutup shift | terang | Chip shift NAV-03; StepIndicator nama langkah + "Langkah 1 dari 3"; tombol Buka Shift/Tutup Shift | Lulus |
| Shift / Tutup shift | gelap | Pasangan `bg-ok-muda` + `text-ok-teks`, titik `--ok` | Lulus |
| Tutup shift ponsel | terang | Langkah aktif dan "Langkah 1 dari 3" tampil | Lulus |
| Tutup shift ponsel | gelap | Sama | Lulus |
| Rekap harian | terang | Angka utama 28 px, ResponsiveTable, label "Sementara", SimulasiBanner | Lulus |
| Rekap harian | gelap | Sama | Lulus |
| Perkiraan belanja | terang | Angka utama 28 px, ResponsiveTable, SimulasiBanner | Lulus |
| Perkiraan belanja | gelap | Sama | Lulus |
| Dasbor (iframe Streamlit) | terang | Catatan kecil di atas iframe bila dasbor tetap terang | Lulus (catatan ada) |
| Dasbor (iframe Streamlit) | gelap | Catatan kecil di atas iframe | Lulus (catatan ada) |
| Asisten / Bantuan | terang | AI fitur dibungkus `AiUnavailableCard` + `ErrorBoundary`, tidak menjatuhkan halaman | Lulus |
| Asisten / Bantuan | gelap | Sama | Lulus |
| Semua halaman | terang | Keadaan memuat (skeleton), kosong (`EmptyState`), galat (`ErrorState`), berhasil ada | Lulus |
| Semua halaman | gelap | Sama | Lulus |
| Semua halaman | terang | Tanpa gradien, glassmorphism, neon, kartu bayangan identik, strip warna kiri kartu, label kapital semua, pemisah titik tengah, em dash, panah teks tombol, emoji, penomoran dekoratif, animasi masuk per bagian, kalimat pemasaran | Lulus |
| Semua halaman | gelap | Sama | Lulus |
| Semua halaman | terang + gelap | Target sentuh ≥44 px; fokus keyboard cincin 3 px warna jagung; Esc menutup ConfirmDialog dan tur onboarding | Lulus, catatan Low: Esc tur mengembalikan fokus ke `<body>` |
| Semua halaman | terang + gelap | Tema ganti Terang/Gelap/Ikuti sistem tanpa reload; pilihan tetap setelah reload; tidak ada kedip tema terang saat buka mode gelap | Lulus |
| Semua halaman | terang + gelap | Teks dan label PRD tidak berubah (kategori Semua/Teh/Jasuke/Lainnya; sidebar desktop; chip shift NAV-03; label stok Aman/Hampir habis/Habis; tombol Simpan Pesanan/Buka Shift/Tutup Shift; toast POS-06) | Lulus |
| Semua halaman | terang + gelap | Grep Langkah 0: tidak ada `text-white|text-black|bg-white|bg-black|text-tinta|bg-tinta|text-kertas`, tidak ada `text-*/[n]`, tidak ada opacity pada teks, tidak ada `group-hover:block`/`hover:block`, tidak ada hex/rgb di luar `globals.css`. Sisa hex adalah logo SVG `BrandMark`, `theme-color` meta (diwajibkan prompt), halaman dev, dan tes — semua beralasan tertulis | Lulus (beralasan) |
| WCAG 2.1 AA otomatis | terang + gelap | `axe-core` tidak tersedia sebagai dependensi → tidak dijalankan, tidak diklaim | Belum diverifikasi otomatis |

## Catatan

- Tema gelap diverifikasi dengan memasang kelas `dark` di `<html>` sebelum pemeriksaan, sesuai Langkah 0 prompt.
- Screenshot SESUDAH: 56 PNG baru dengan nama `{viewport}-{peran}-{halaman}-{tema}.png` di `.qa/sesudah/`. Ukuran viewport: 390×844 dan 1366×900 px. `.qa/` sudah tercantum di `.gitignore`.
- Commit belum di-push dan belum ada PR. Jangan merge sendiri; tanpa atribusi AI.
