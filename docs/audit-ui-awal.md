# Audit UI Awal — Mr. Tea & Jasuke Frontend

Diuji 14 Nov 2026 dengan Chrome otomatis (Playwright) dan axe-core 4, mode mock, akun `rina` (karyawan) dan `pemilik`. Halaman yang dibuka: shift, PoS, pesanan, stok, barang masuk, tutup shift, asisten, bantuan, beranda pemilik, rekap, perkiraan belanja, dasbor, master menu, master bahan. Ukuran layar 1366 px dan 390 px, skema warna sistem terang dan gelap.

Versi redesain yang ada di laptop belum di-push, jadi temuan di bawah berlaku untuk `main`. Langkah audit di prompt mengulang pemeriksaan yang sama pada branch kerja.

## Ringkasan

| Pemeriksaan | Hasil |
|---|---|
| Pelanggaran otomatis axe (WCAG 2.1 AA) | 0 di semua halaman |
| Scroll horizontal di 390 px | Tidak ada |
| Galat konsol | Tidak ada |
| Tema gelap | Tidak ada di `main`. Di branch kerja sudah ada, beberapa pasangan warna pernah rusak (perbaikan status: selesai) |
| Teks yang sulit dibaca | Ada 5 tempat. axe tidak menangkapnya karena memakai `opacity` atau hanya muncul saat hover (perbaikan: selesai) |
| Target sentuh di bawah 44 px | Ada di ponsel dan sidebar desktop (perbaikan: selesai) |

## Temuan

| No | Halaman | Tema | Masalah | Penyebab di kode | Perbaikan | Status |
|---|---|---|---|---|---|---|
| 1 | Semua (tema) | terang + gelap | Tidak ada mode Terang, Gelap, atau Ikuti sistem. `prefers-color-scheme: dark` diabaikan | Tidak ada store tema, tidak ada token `.dark` di `globals.css` | Sistem tema lengkap (`zustand persist mrtea-tema`, skrip anti-kedipan di `index.html`, `PilihTema` radiogroup) | Selesai |
| 2 | Buka shift, semua tombol nonaktif | terang + gelap | Tulisan "Buka Shift" saat nonaktif putih di atas cokelat pudar, kontras 2,5:1 | `components/ui/button.tsx` baris 7: `disabled:opacity-50` | Tombol nonaktif `bg-muted text-muted-foreground` (5,3:1) tanpa opacity, plus kalimat alasan | Selesai |
| 3 | PoS | terang + gelap | Kartu menu "Bahan kurang" hampir tak terbaca. Nama 3,2:1, label merah 2,7:1 | `features/pos/PosPage.tsx` baris 228: `opacity-55` untuk seluruh kartu | Hanya foto yang grayscale. Nama, harga, dan alasan tetap warna penuh. Alasan diberi ikon AlertCircle | Selesai |
| 4 | PoS | terang + gelap | Harga di kartu abu-abu, kalah dengan nama | `PosPage.tsx` baris 233: `text-foreground/80` | Harga 18 px tebal warna `--teh` (7,7:1) | Selesai |
| 5 | Beranda pemilik | terang + gelap | Nominal di grafik 7 hari hanya muncul saat hover, di ponsel tidak pernah terlihat. Label hari 11 px | `features/owner-home/OwnerHomePage.tsx`: `hidden group-hover:block`, `text-[11px]` | Nominal selalu tampil di atas batang (12 px), label hari 12 px, tap batang membuka rekap | Selesai |
| 6 | Tab di beberapa halaman | terang + gelap | Tab tidak aktif memakai teks 60% | `components/ui/tabs.tsx` baris 64: `text-foreground/60` | Pakai `text-muted-foreground` | Selesai |
| 7 | Nota di ponsel (sheet) | terang + gelap | Tombol tutup X kecil (16 px), pudar 70%, berlabel bahasa Inggris "Close" | `components/ui/sheet.tsx` baris 75 | Tombol 44 x 44 px, ikon 20 px, tanpa opacity, label "Tutup" | Selesai |
| 8 | Tutup shift (ponsel) | terang + gelap | Langkah 2 dan 3 hanya angka tanpa nama | `features/shift/StepIndicator.tsx` | Tampilkan nama langkah aktif dan "Langkah 1 dari 3" | Selesai |
| 9 | PoS | terang + gelap | Kategori "Lainnya" padahal isinya paket | `lib/format.ts` baris 47 | Label "Lainnya". Nilai data `lainnya` tetap | Selesai |
| 10 | Header ponsel | terang + gelap | Chip shift, lonceng stok, dan avatar 32 sampai 36 px | Header di layout | Minimal 44 px | Selesai |
| 11 | Sidebar desktop | terang + gelap | Item navigasi 36 px | Sidebar | Minimal 44 px | Selesai |
| 12 | Stok, master, asisten (ponsel) | terang + gelap | Tombol filter, Ubah, Nonaktifkan, Ulangi tur, dan saran pertanyaan 32 sampai 38 px | Beberapa komponen | Minimal 44 px. Ikon bantuan "?" 24 px dibuat 44 px area sentuhnya | Selesai |
| 13 | Bar nota melayang (ponsel) | terang + gelap | Label "Lihat nota" 70% putih, tampak pudar | `PosPage.tsx` baris 184 dan 187: `text-white/70`, `text-white/60` | Pakai token pasangan latar tanpa alpha | Selesai |
| 14 | Topbar, semua halaman | gelap | Chip "Shift Siang sejak 23.05": tulisan gelap di atas latar kuning gelap, kontras ~1,2:1 | Teks warna tetap tidak ikut tema sementara latar ikut tema | Pasangan `bg-ok-muda` + `text-ok-teks` di kedua tema. Teks NAV-03: "Shift Siang aktif sejak 23.05" | Selesai |
| 15 | Stok | terang + gelap | Chip filter aktif "Semua (14)" berteks putih di atas latar hampir putih | Keadaan aktif `bg-foreground`/`bg-tinta` + `text-white` | Chip aktif `bg-primary` + `text-primary-foreground`, lainnya `bg-card` + `text-foreground` + garis | Selesai |
| 16 | Stok | terang + gelap | Label filter "Menipis" tidak sesuai PRD | Label berbeda dari STK-01 | Pakai "Hampir habis", "Habis", "Aman" | Selesai |
| 17 | Semua | terang + gelap | Pola warna tetap bercampur token (`text-white`, `bg-white`, `text-tinta`, hex) di chip, badge, tombol, segmen kanal, langkah | Komponen memakai latar satu pasangan dengan teks pasangan lain | Ganti semua dengan pasangan token. Cek grep Langkah 0 bersih atau beralasan | Selesai |

## Temuan tambahan dari audit akhir branch kerja (15-16 Nov 2026)

| Area | Bukti | Hasil |
|---|---|---|
| Scroll horizontal dokumen | `document.documentElement.scrollWidth - clientWidth` di 360/390/768/1024/1280 | 0 px semua halaman setelah `table-fixed` + `min-w-0` pada `main` + `overflow-x: clip` pada `html, body` |
| Tabel master menu/bahan @768/1024 | Wrapper `overflow-x-auto` punya internal scrollbar, dokumen tidak scroll | Internal scroll works; dokumen 0 px |
| Persistensi tema | `localStorage mrtea-tema`, reload, `dark` class + `colorScheme` | Stabil sebelum/sesudah reload, tidak ada kedip |
| Esc tutup dialog | `ConfirmDialog` (Nonaktifkan) | Ditutup, PASS |
| Esc tutup tur onboarding | driver.js popover | Ditutup, fokus ke `<body>` (Low, dicatat) |
| Pengawal peran | `rina` → `/pemilik/beranda` | `ForbiddenPage`, tidak ada data pemilik render |
| axe WCAG 2.1 AA | `npm ls axe-core` kosong | Tidak dijalankan (dependensi tidak ada), tidak diklaim |
| Screenshot `.qa/sesudah/` | 390 light/dark rina-pos, 1366 light/dark pemilik-beranda | 4 file PNG (`.qa/` di `.gitignore`) |

## Yang sudah baik dan perlu dipertahankan

- Tidak ada scroll horizontal di 390 px.
- Bar nota melayang tidak menutupi kartu menu terakhir.
- Alur pesanan tetap 2 ketukan.
- Struktur label form dan nama tombol ikon sudah lolos axe.
- Semua temuan di atas berstatus selesai.
