# Audit Desain: Pola AI Slop dan Kegunaan

Tema terang. Sumber: screenshot `.qa/sebelum/` (belum diambil di sini karena dokumen ini ditulis sebelum capture), dua gambar di `contoh ui/`, dan `docs/rencana-redesain.md`.

## Tabel temuan

| halaman | temuan | jenis | tingkat | usulan | alasan |
|---|---|---|---|---|---|
| Seluruh halaman | Warna hardcode di luar token (`#F5F3F0`, `#4A2B1D`, `#D17842`, dark mode `#0C0F14`) | konsistensi | tinggi | perbaiki kecil | AGENTS.md wajib pakai token `kertas`, `tinta`, `teh`, `jagung`, dll. Gambar acuan pakai warna non-token. |
| Seluruh halaman | Bayangan kartu, gradien, glassmorphism, animasi masuk per bagian | slop | tinggi | perbaiki kecil | Melanggar aturan ornamen: satu-satunya ornamen adalah `nota-edge` PoS. |
| Seluruh halaman | Teks antarmuka berbahasa Inggris (gambar acuan) | kegunaan | tinggi | perbaiki kecil | AGENTS.md wajib Bahasa Indonesia baku, sentence case. |
| PoS kartu menu | Modifier (Mood, Size, Gula, Es) inline di kartu | kegunaan | sedang | redesain | Membantu target sentuh <44 px dan menumpuk pilihan di kasir satu tangan. Pindahkan gula ke baris keranjang. |
| PoS | Teks pemasaran umum, ikon emoji | slop | rendah | biarkan | Tidak ditemukan di kode saat ini, hanya dalam gambar acuan. |
| PoS / keranjang | Kontrol tingkat gula belum ada | kegunaan | sedang | redesain | Diminta rencana Tahap 2 (2.7). Muncul hanya untuk menu `bisaAturGula`. |
| Semua halaman | Tema gelap belum ada | kegunaan | sedang | redesain | Diminta Tahap 3. Default sistem, saklar manual, kontras AA. |
| Navigasi | Label huruf kapital semua / pemisah titik tengah / em dash / panah tombol | slop | rendah | biarkan | Tidak ditemukan di kode saat ini. |
| Tabel | Scroll horizontal di 360 px | kegunaan | tinggi | biarkan | `ResponsiveTable` sudah menjadi kartu di bawah 768 px, perlu verifikasi ulang. |

## Ringkasan

- Tinggi: 4 (warna, ornamentasi, bahasa, scroll horizontal)
- Sedang: 3 (tema gelap, kontrol gula, modifier kartu)
- Rendah: 2 (slop teks, kapitalisasi/pemisah)

## File yang akan diubah di Bagian C

1. `src/styles/globals.css` — tambah blok `.dark` untuk token, default sistem.
2. `src/stores/ui-store.ts` — simpan pilihan tema (terang/gelap/sistem).
3. `src/components/layout/UserMenu.tsx` — saklar tema.
4. `src/features/pos/PosPage.tsx` — pindahkan kontrol tingkat gula ke baris keranjang.
5. `src/features/master/MenuMasterPage.tsx` — unggah foto + pengaturan `bisaAturGula`.
6. `src/features/orders/OrdersPage.tsx` — tampilkan tingkat gula per item.
7. `src/components/shared/EmptyState.tsx`, `ErrorState.tsx`, skeleton — Bahasa Indonesia.
8. Komponen baru: `MenuPhoto`, ilustrasi SVG kategori, kontrol tingkat gula.

Status: menunggu persetujuan sebelum Bagian C.
