# Audit UI frontend, branch main (commit 1e2b499)

Diuji 14 Nov 2026 dengan Chrome otomatis (Playwright) dan axe-core 4, mode mock, akun `rina` (karyawan) dan `pemilik`. Halaman yang dibuka: shift, PoS, pesanan, stok, barang masuk, tutup shift, asisten, bantuan, beranda pemilik, rekap, perkiraan belanja, dasbor, master menu, master bahan. Ukuran layar 1366 px dan 390 px, skema warna sistem terang dan gelap.

Versi redesain yang ada di laptop belum di-push, jadi temuan di bawah berlaku untuk `main`. Langkah audit di prompt mengulang pemeriksaan yang sama pada branch kerja.

## Ringkasan

| Pemeriksaan | Hasil |
|---|---|
| Pelanggaran otomatis axe (WCAG 2.1 AA) | 0 di semua halaman |
| Scroll horizontal di 390 px | Tidak ada |
| Galat konsol | Tidak ada |
| Tema gelap | Tidak ada di `main`. Di branch kerja sudah ada, tetapi beberapa pasangan warna rusak (lihat bagian berikut) |
| Teks yang sulit dibaca | Ada 5 tempat. axe tidak menangkapnya karena memakai `opacity` atau hanya muncul saat hover |
| Target sentuh di bawah 44 px | Ada di ponsel dan sidebar desktop |

## Temuan

| No | Halaman | Masalah | Penyebab di kode | Perbaikan |
|---|---|---|---|---|
| 1 | Semua (tema) | Tidak ada mode Terang, Gelap, atau Ikuti sistem. `prefers-color-scheme: dark` diabaikan | Tidak ada store tema, tidak ada token `.dark` di `globals.css` | Sistem tema lengkap (Langkah 3 di prompt) |
| 2 | Buka shift, semua tombol nonaktif | Tulisan "Buka Shift" saat nonaktif putih di atas cokelat pudar, kontras 2,5:1 | `components/ui/button.tsx` baris 7: `disabled:opacity-50` | Tombol nonaktif memakai `bg-muted text-muted-foreground` (5,3:1) tanpa opacity, plus kalimat alasan di dekatnya |
| 3 | PoS | Kartu menu "Bahan kurang" (contoh: Teh Leci) hampir tak terbaca. Nama 3,2:1, label merah 2,7:1 | `features/pos/PosPage.tsx` baris 228: `opacity-55` untuk seluruh kartu | Hanya foto yang grayscale. Nama, harga, dan alasan tetap warna penuh. Alasan diberi ikon |
| 4 | PoS | Harga di kartu abu-abu, kalah dengan nama | `PosPage.tsx` baris 233: `text-foreground/80` | Harga 18 px tebal warna `--teh` (7,7:1) |
| 5 | Beranda pemilik | Nominal di grafik 7 hari hanya muncul saat hover, jadi di ponsel tidak pernah terlihat. Label hari 11 px | `features/owner-home/OwnerHomePage.tsx` baris 120 dan 126: `hidden group-hover:block`, `text-[11px]` | Nominal selalu tampil di atas batang (12 px), label hari 12 px, tap batang membuka rekap |
| 6 | Tab di beberapa halaman | Tab tidak aktif memakai teks 60% | `components/ui/tabs.tsx` baris 64: `text-foreground/60` | Pakai `text-muted-foreground` |
| 7 | Nota di ponsel (sheet) | Tombol tutup X kecil (16 px), pudar 70%, dan berlabel bahasa Inggris "Close" | `components/ui/sheet.tsx` baris 75 | Tombol 44 x 44 px, ikon 20 px, tanpa opacity, label "Tutup" |
| 8 | Tutup shift (ponsel) | Langkah 2 dan 3 hanya angka tanpa nama | `features/shift/StepIndicator.tsx` | Tampilkan nama langkah aktif dan "Langkah 1 dari 3" |
| 9 | Header ponsel | Chip shift, lonceng stok, dan avatar 32 sampai 36 px | Header di layout | Minimal 44 px |
| 10 | Sidebar desktop | Item navigasi 36 px | Sidebar | Minimal 44 px |
| 11 | Stok, master, asisten (ponsel) | Tombol filter, Ubah, Nonaktifkan, Ulangi tur, dan saran pertanyaan 32 sampai 38 px | Beberapa komponen | Minimal 44 px. Ikon bantuan "?" 24 px dibuat 44 px area sentuhnya |
| 12 | Bar nota melayang (ponsel) | Label "Lihat nota" 70% putih, kontras cukup tapi tampak pudar | `PosPage.tsx` baris 184 dan 187: `text-white/70`, `text-white/60` | `text-white` 90% atau token khusus, ikon tanpa alpha |

## Temuan dari screenshot tema gelap di branch kerja (15 Nov)

| No | Halaman | Masalah | Kemungkinan penyebab | Perbaikan |
|---|---|---|---|---|
| 13 | Topbar, semua halaman | Chip "Shift Siang sejak 23.05": tulisan "Shift Siang" gelap di atas latar kuning gelap, kontras sekitar 1,2:1 | Teks memakai warna tetap (misalnya `text-tinta`) yang tidak ikut tema, sementara latarnya ikut tema | Pasangan `bg-ok-muda` + `text-ok-teks` di kedua tema. Teks mengikuti PRD NAV-03: "Shift Siang aktif sejak 23.05" |
| 14 | Stok | Chip filter aktif "Semua (14)" berteks putih di atas latar hampir putih | Keadaan aktif memakai `bg-foreground` atau `bg-tinta` yang berubah terang di tema gelap, dipasangkan dengan `text-white` | Chip aktif `bg-primary` + `text-primary-foreground`, chip lain `bg-card` + `text-foreground` + garis |
| 15 | Stok | Label filter "Menipis" tidak sesuai PRD | Label berbeda dari STK-01 | Pakai "Hampir habis", "Habis", "Aman" |
| 16 | Semua | Pola yang sama kemungkinan ada di tab, segmen kanal, badge, dan tombol lain | Warna tetap (`text-white`, `bg-white`, `text-tinta`, hex) bercampur dengan token tema | Ganti semua dengan pasangan token. Cek dengan grep dan axe di tema gelap |

## Yang sudah baik dan perlu dipertahankan

- Tidak ada scroll horizontal di 390 px.
- Bar nota melayang tidak menutupi kartu menu terakhir.
- Alur pesanan tetap 2 ketukan.
- Struktur label form dan nama tombol ikon sudah lolos axe.
