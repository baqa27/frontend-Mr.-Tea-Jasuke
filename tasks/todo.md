# Task List: Redesain UI, Sistem Tema, dan Polishing Mr. Tea & Jasuke

## Phase 0: Baseline & Audit
- [ ] Task 0: Catat baseline (typecheck, lint, test, build, bundle size) ke `.qa/baseline.md`. Perbarui `docs/audit-ui-awal.md` dengan temuan terbaru.

## Phase 1: Perbaikan Bug UI (Langkah 1)
- [ ] Task 1.1: Perbaiki tombol nonaktif di `components/ui/button.tsx` — ganti `disabled:opacity-50` → `disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent` + kalasan alasan.
- [ ] Task 1.2: Perbaiki kartu "Bahan kurang" di `features/pos/PosPage.tsx` — hapus `opacity-55`, hanya foto grayscale, badge `--bahaya`, alasan dengan ikon `AlertCircle`.
- [ ] Task 1.3: Harga di kartu menu `PosPage.tsx` — 18px, font-extrabold, `--teh`, hapus `text-foreground/80`.
- [ ] Task 1.4: Grafik omzet 7 hari `OwnerHomePage.tsx` — nominal selalu tampil di atas batang (12px), hapus `hidden group-hover:block text-[11px]`.
- [ ] Task 1.5: Tab tidak aktif `components/ui/tabs.tsx` — `text-muted-foreground` (bukan `text-foreground/60`).
- [ ] Task 1.6: Tombol tutup sheet/dialog `components/ui/sheet.tsx` — area 44x44px, ikon 20px, tanpa opacity, label "Tutup".
- [ ] Task 1.7: Indikator langkah tutup shift `features/shift/StepIndicator.tsx` — nama langkah aktif + "Langkah X dari Y".
- [ ] Task 1.8: Label kategori "Lainnya" → "Paket" di `lib/format.ts` (nilai data `lainnya` tetap).
- [ ] Task 1.9: Semua target sentuh interaktif < 44px → 44px (chip shift, lonceng, avatar, sidebar item, chip filter, tombol Ubah/Nonaktifkan, saran pertanyaan, ikon bantuan "?").
- [ ] Task 1.10: Bar nota melayang ponsel `PosPage.tsx` — teks dan ikon putih penuh (hapus `text-white/70`, `text-white/60`).

## Phase 2: Sistem Desain & Dev Tokens (Langkah 2)
- [ ] Task 2.1: Update `src/styles/globals.css` dengan palet hex baru (terang & gelap), skala tipografi, radius hierarki, token kategori `--kat-teh/jasuke/paket` + `-muda`, mapping shadcn tokens.
- [ ] Task 2.2: Update `docs/sistem-desain.md` — tabel kontras (terang 7.7:1/15.9:1/6.3:1, gelap 13.9:1/7.4:1/7.4:1/8.5:1/6.9:1/10.1:1), tipografi 12/14/16/18/22/28/36/44px, gerak, ikon.
- [ ] Task 2.3: Buat halaman `/dev/tokens` (hanya `DEV`) menampilkan token dua tema, skala huruf, radius, contoh tombol disabled.

## Phase 3: Sistem Tema Terang / Gelap / Sistem (Langkah 3)
- [ ] Task 3.1: `src/stores/tema-store.ts` (zustand persist key `mrtea-tema`, pilihan: terang|gelap|sistem, bawaan sistem).
- [ ] Task 3.2: `src/lib/tema.ts` — `terapkanTema(pilihan)`, toggle `dark` pada `<html>`, `colorScheme`, `<meta name="theme-color">`, listener `matchMedia` untuk "sistem".
- [ ] Task 3.3: Anti-flicker script di `index.html` (inline, sebelum stylesheet, baca localStorage `mrtea-tema` format Zustand, try/catch).
- [ ] Task 3.4: `src/components/PilihTema.tsx` — radiogroup 3 pilihan (Sun/Moon/Monitor), 44px tinggi, keyboard-navigable, pasang di UserMenu, Bantuan, Login.
- [ ] Task 3.5: Unit test `terapkanTema` (terang, gelap, sistem terang, sistem gelap, change matchMedia).

## Phase 4: Integrasi Foto Menu (Langkah 4)
- [ ] Task 4.1: `src/lib/foto-menu.ts` — `fotoMenu(menu)`: backend → lokal `public/menu/<id>.webp` (640x480 <60KB) → fallback ilustrasi SVG kategori.
- [ ] Task 4.2: `MenuPhoto.tsx` badge "Ilustrasi AI" (12px, bg `--kartu` 85%) pojok kiri bawah foto lokal.
- [ ] Task 4.3: Pastikan seed webp & fallback ilustrasi sudah kompatibel.

## Phase 5: Redesain Layar Kasir PoS (Langkah 5)
- [ ] Task 5.1: `PosPage.tsx` desktop — header 64px, tile kategori 56px (ikon 40px `-muda`, garis 2px aktif), grid kartu 4:3 minmax(176px,1fr), border kartu aktif sewarna kategori, lencana bulat sudut kanan atas, foto grayscale untuk bahan kurang.
- [ ] Task 5.2: `Nota.tsx` — struk `nota-edge`, thumbnail 44px, stepper ± 44px, `SugarControl` bila `bisaAturGula`, garis putus-putus, total 36px, Simpan 56px sticky.
- [ ] Task 5.3: Ponsel — bar bawah melayang (jumlah, total 22px, Lihat nota, Simpan), bottom sheet nota.
- [ ] Task 5.4: `OrdersPage.tsx` — thumbnail menu pertama, nomor, waktu, chip kanal, total tabular, status ikon+teks, badge tingkat gula.

## Phase 6: Redesain Halaman Pemilik (Langkah 6)
- [ ] Task 6.1: `OwnerHomePage.tsx` bento grid 12 kolom gap 16px — omzet 7 kolom x2 baris (44px), shift aktif 5 kolom `--ok-muda`, stok menipis 5 kolom, terlaris 4 kolom thumbnail, belanja besok 4 kolom `--jagung-muda`, pintasan 4 kolom dashed. <900px satu kolom.
- [ ] Task 6.2: `MenuMasterPage.tsx` — thumbnail 56x42px di tabel, form upload foto dengan pratinjau & label "Ilustrasi AI".
- [ ] Task 6.3: Rekap harian & perkiraan belanja — angka utama 28px, ResponsiveTable sel angka rata kanan tabular.

## Phase 7: Audit Akhir & Verifikasi (Langkah 7)
- [ ] Task 7.1: Audit axe-core semua halaman, grep opacity teks, hex di luar globals.css, target sentuh 44px, 360px no-scroll, fokus keyboard.
- [ ] Task 7.2: Lengkapi `docs/audit-desain.md` (kolom: halaman, temuan, status) dan `.qa/sesudah/` screenshot 390/1366px terang & gelap.
- [ ] Task 7.3: Verifikasi final: typecheck=0, lint=0, test=89+, build=0, bundle <300KB gzip. PR ke main tanpa atribusi AI.