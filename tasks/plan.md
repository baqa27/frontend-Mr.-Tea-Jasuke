# Implementation Plan: Redesain UI, Sistem Tema, dan Polishing Mr. Tea & Jasuke

## Overview
Menyelesaikan perbaikan UI, penerapan sistem desain token warna baru (terang & gelap), sistem tema (terang/gelap/sistem dengan anti-flicker), foto menu dan ilustrasi AI, penyempurnaan PoS Kasir, penyempurnaan Bento Grid Pemilik, dan QA audit akhir sesuai instruksi prompt final.

## Architecture Decisions
1. **Branch**: Menggunakan branch `desain/final` (bercabang dari progress terkini `redesain/tahap-2-3`) agar riwayat kontrak foto/gula dan komponen tidak hilang, serta memenuhi ketentuan penamaan branch prompt final.
2. **Sistem Tema**:
   - Zustand persist store di `src/stores/tema-store.ts` dengan key `mrtea-tema`.
   - Logika aplikasi kelas di `src/lib/tema.ts` (`terapkanTema`), sinkronisasi `colorScheme`, `<meta name="theme-color">`, dan listener `matchMedia`.
   - Script anti-flicker inline di `index.html` membaca localStorage `mrtea-tema` sebelum stylesheet dirender.
   - Komponen pemilih tema `src/components/PilihTema.tsx` (radiogroup 44px: Terang, Gelap, Ikuti sistem) di header UserMenu, Bantuan, dan Login.
3. **Sistem Desain & Token**:
   - Token warna baru di `src/styles/globals.css` untuk `:root` dan `.dark` sesuai palet hex yang ditetapkan.
   - Larangan opacity pada teks: ganti dengan `--muted-foreground` dan token warna solid.
   - Halaman pratinjau `/dev/tokens` aktif hanya saat `import.meta.env.DEV`.
4. **Foto Menu**:
   - `src/lib/foto-menu.ts` untuk memetakan foto (backend -> lokal webp -> fallback SVG).
   - Badge "Ilustrasi AI" di pojok kiri bawah foto lokal.
   - Fallback SVG garis kategori seragam jika foto belum ada.
5. **Kasir (PoS)**:
   - Header kasir 64px, chip shift aktif.
   - Grid kartu menu 4:3 tanpa strip sisi kiri, border kartu aktif sewarna kategori, lencana jumlah bulat di sudut kanan atas.
   - Kartu bahan kurang: foto grayscale, nama/harga solid, icon AlertCircle dengan alasan.
   - Nota struk dengan SugarControl, total besar 36px, tombol Simpan 56px sticky.
6. **Pemilik**:
   - Bento grid 12 kolom di `OwnerHomePage.tsx`.
   - Master menu: thumbnail di tabel, form upload/preview.
7. **Verifikasi & Kontras**:
   - Semua tes (89+ tes), typecheck, lint, build wajib lolos di setiap langkah.
   - Kontras WCAG AA terpenuhi.

## Task List

### Phase 0: Baseline & Audit
- [ ] Task 0: Catat baseline dan perbarui `docs/audit-ui-awal.md` serta `.qa/baseline.md`.

### Phase 1: Perbaikan Bug UI (Langkah 1)
- [ ] Task 1.1: Perbaiki tombol nonaktif di `components/ui/button.tsx` (ganti `disabled:opacity-50` dengan `bg-muted text-muted-foreground`).
- [ ] Task 1.2: Perbaiki kartu "Bahan kurang" di `PosPage.tsx` (hapus opacity kartu, grayscale pada foto saja, badge bahaya solid).
- [ ] Task 1.3: Perbaiki harga di kartu menu (18px, font-extrabold, `--teh`, hapus `text-foreground/80`).
- [ ] Task 1.4: Perbaiki grafik omzet 7 hari di `OwnerHomePage.tsx` (nominal selalu tampil, hapus hover-only).
- [ ] Task 1.5: Perbaiki tabs di `components/ui/tabs.tsx` (`text-muted-foreground`).
- [ ] Task 1.6: Perbaiki tombol tutup sheet dan dialog (44x44px, label "Tutup").
- [ ] Task 1.7: Perbaiki indikator langkah tutup shift (`StepIndicator.tsx`).
- [ ] Task 1.8: Perbaiki label kategori "Lainnya" -> "Paket" di `lib/format.ts`.
- [ ] Task 1.9: Naikkan semua target sentuh interaktif ke min 44x44px.
- [ ] Task 1.10: Bar nota melayang di ponsel: teks dan ikon solid.

### Phase 2: Sistem Desain & Dev Tokens (Langkah 2)
- [ ] Task 2.1: Update `src/styles/globals.css` dengan palet hex baru `:root` dan `.dark`, skala tipografi, dan radius.
- [ ] Task 2.2: Update `docs/sistem-desain.md` dengan tabel kontras dan panduan tipografi.
- [ ] Task 2.3: Buat rute `/dev/tokens` (hanya `import.meta.env.DEV`).

### Phase 3: Sistem Tema Terang / Gelap / Sistem (Langkah 3)
- [ ] Task 3.1: Buat `src/stores/tema-store.ts` dan `src/lib/tema.ts`.
- [ ] Task 3.2: Pasang anti-flicker di `index.html`.
- [ ] Task 3.3: Buat `src/components/PilihTema.tsx` dan integrasikan ke UserMenu, Bantuan, dan Login.
- [ ] Task 3.4: Tambah unit test untuk `terapkanTema` dan sinkronisasi tema.

### Phase 4: Integrasi Foto Menu (Langkah 4)
- [ ] Task 4.1: Buat `src/lib/foto-menu.ts` dan perbarui `MenuPhoto.tsx` dengan badge "Ilustrasi AI".
- [ ] Task 4.2: Pastikan fallback dan seed webp bekerja optimal.

### Phase 5: Redesain Layar Kasir PoS (Langkah 5)
- [ ] Task 5.1: Rapikan PoS desktop (header 64px, tile kategori 56px, grid kartu 4:3, sticky nota).
- [ ] Task 5.2: Rapikan PoS ponsel (bar melayang, bottom sheet nota).
- [ ] Task 5.3: Perbarui Riwayat Pesanan (`OrdersPage.tsx`).

### Phase 6: Redesain Halaman Pemilik (Langkah 6)
- [ ] Task 6.1: Bento grid 12 kolom `OwnerHomePage.tsx`.
- [ ] Task 6.2: Master Menu & Bahan (`MenuMasterPage.tsx`).
- [ ] Task 6.3: Rapikan hierarki angka Rekap Harian & Perkiraan Belanja.

### Phase 7: Audit Akhir & Verifikasi (Langkah 7)
- [ ] Task 7.1: Audit axe-core, kontras warna, target sentuh, dan eliminasi pola dilarang.
- [ ] Task 7.2: Lengkapi `docs/audit-desain.md` dan `.qa/sesudah/`.
- [ ] Task 7.3: Verifikasi final: typecheck, test, lint, build.
