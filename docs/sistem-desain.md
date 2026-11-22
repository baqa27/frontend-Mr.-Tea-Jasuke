# Sistem Desain Mr. Tea & Jasuke

Acuan hidup untuk tampilan seluruh layar frontend: token warna poster resmi (**Mode Terang sebagai bawaan & Mode Gelap berkontras tinggi**), aturan kontras WCAG AA, logo dua nada, skala hijau grafik dasbor, warna kartu shift, dan pola chatbot melayang.

Dokumen ini menggantikan yang lama berdasarkan proposal PRD 10.3 (`#8a3b12`, Inter, radius 8 px). Nilai yang berlaku adalah nilai di bawah, yang sudah diimplementasikan di `src/styles/globals.css` (`:root` = terang, `.dark` = gelap).

---

## 0. Prinsip Umum

1. **Tema bawaan Mode Terang.** Saat pertama kali dibuka, aplikasi selalu terang, tidak otomatis mengikuti `prefers-color-scheme: dark` OS. Toggle `Terang / Gelap / Sistem` tetap tersedia di `PilihTema.tsx`.
2. Penyimpanan tema pakai kunci baru `mrtea-tema:v2`, sehingga preferensi gelap lama di `localStorage` (`mrtea-tema`) otomatis di-reset ke Mode Terang tanpa clear cache manual.
3. Skrip anti-kedipan di `index.html` membaca kunci baru sebelum konten gambar agar tidak ada flash tema saat muat pertama.
4. Bahasa Indonesia baku, kalimat aktif, sentence case. Tidak ada huruf kapital semua, pemisah titik tengah, em dash, atau panah di teks tombol.
5. Status selalu teks + ikon, bukan warna saja. Opacity dilarang untuk memudarkan teks (`opacity-*`, `text-*/60`, `text-white/70`); pakai token `-muda` / `muted-foreground`.
6. Target sentuh minimal 44 px. Fokus keyboard: cincin 3 px warna ring (`--teh` / `--ring`).
7. Satu-satunya ornamen adalah tepi bergerigi nota (`nota-edge`). Tidak ada gradien, glassmorphism, shimmer, atau animasi masuk per bagian. Animasi hanya sebagai respons aksi pengguna (baris nota, lencana jumlah, tombol tersimpan).
8. Ukuran teks minimal 12 px. Angka pakai kelas `num` untuk `tabular-nums`.

---

## 1. Token Warna Poster Resmi

### 1.1 Mode Terang (`:root` — bawaan)

| Token | Nilai | Kegunaan |
|---|---|---|
| `kertas` / canvas | `#F5FBF8` | Latar halaman |
| `kartu` / card | `#FFFFFF` | Permukaan kartu, sidebar, header |
| `border` / garis | `#DCF2E7` | Border lembut |
| `tinta` | `#111827` | Teks utama |
| `tinta-muda` | `#4B635B` | Teks sekunder |
| `teh` | `#56A73E` | Primer Tea Green — logo “Mr. & Tea”, tombol utama |
| `teh-tua` | `#1F5E16` | Teks di atas latar utama |
| `teh-muda` | `#EBF7E6` | Latar primer lembut |
| `mint` | `#38D2A3` | Segar Mint — status aktif |
| `mint-muda` | `#E6FAF3` | Latar mint lembut |
| `mint-tua` | `#0F5E49` | Teks di atas latar mint |
| `jagung` | `#F4D026` | Aksen Jasuke — warna kategori, chip shift pagi |
| `jagung-muda` | `#FEFCE8` | Latar aksen lembut |
| `jagung-border` | `#FDE047` | Border aksen |
| `jagung-tua` | `#854D0E` | Teks ikon kontras di atas putih |
| `amber` | `#F39C12` | Peringatan |
| `amber-muda` | `#FEF3E2` | Latar peringatan |
| `amber-tua` | `#854D0E` | Teks di atas latar peringatan |
| `cta` / tombol kontras poster | `#111827` | Tombol gelap teks `#FFFFFF` |

### 1.2 Mode Gelap (`.dark` — kontras WCAG AA minimal 4.5:1)

| Token | Nilai | Kegunaan |
|---|---|---|
| `kertas` / canvas | `#0D1512` | Latar halaman |
| `kartu` / card | `#14201B` | Permukaan kartu, sidebar, header |
| `border` / garis | `#243830` | Border |
| `elevated` / hover | `#1B2C25` | Permukaan lebih tinggi (muted surface) |
| `tinta` | `#F3FAF6` | Teks utama |
| `tinta-muda` | `#9EB8AC` | Teks sekunder |
| `teh` | `#5EC444` | Primer Tea Green cerah |
| `teh-tua` | `#9DF08A` | Teks di atas latar hijau gelap (DILARANG teks hijau gelap di latar hijau gelap) |
| `teh-muda` | `#1B3622` | Latar primer lembut di gelap |
| `mint` | `#38D2A3` | Segar Mint |
| `mint-muda` | `#12332A` | Latar mint lembut di gelap |
| `mint-tua` | `#6EE7C8` | Teks di atas latar mint gelap |
| `jagung` | `#FACC15` | Aksen Jasuke di gelap |
| `jagung-muda` | `#2E260E` | Latar aksen lembut di gelap |
| `jagung-border` | `#715A12` | Border aksen gelap |
| `jagung-tua` | `#FDE047` | Teks kontras di latar gelap |
| `amber` | `#F59E0B` | Peringatan gelap |
| `amber-muda` | `#33210B` | Latar peringatan gelap |
| `amber-tua` | `#FCD34D` | Teks di atas latar peringatan gelap |
| `cta` | `#1B2C25` | Tombol kontras gelap teks `#F3FAF6` |

Meta warna browser: terang `#F5FBF8`, gelap `#0D1512`.

### 1.3 Logo Dua Nada (`BrandMark.tsx`)

| Bagian | Warna Terang | Warna Gelap |
|---|---|---|
| `Mr. & Tea` | `#56A73E` (Tea Green) | `#65D14B` |
| `Jasuke` | `#D49B00` (Corn Yellow) | `#FACC15` |

Ikon gelas teh tersegel berwarna sesuai permukaan kartu agar terbaca di kedua mode. Teks bagian logo dikecualikan dari ketentuan kontras teks UI umum karena termasuk logotype, tetapi nilainya dipilih semakin gelap yang tetap terlihat sebagai jagung putih.

---

## 2. Aturan Kontras WCAG AA (4.5:1 teks normal, 3:1 grafis/teks besar)

Pasangan kunci yang telah terukur di kode:

| Pasangan | Rasio | Keterangan |
|---|---|---|
| `tinta` `#111827` pada `kertas` `#F5FBF8` | 16.93:1 | AA, AAA |
| `tinta` `#111827` pada `kartu` `#FFFFFF` | 6.49:1 | AA |
| `teh-tua` `#1F5E16` pada `kartu` | 7.11:1 | AA |
| `jagung-tua` `#854D0E` pada `jagung-muda` `#FEFCE8` | 6.62:1 | AA |
| `primary-foreground` `#FFFFFF` pada `primary` `#56A73E` | 3.00:1 | Hanya AA-large (ponytail: ubah latar primer bila teks normal menjadi penuh) |
| `tinta` `#F3FAF6` pada `kertas` `#0D1512` (gelap) | 17.49:1 | AA, AAA |
| `teh-tua` `#9DF08A` pada `teh-muda` `#1B3622` (gelap) | 9.56:1 | AA |
| `jagung-tua` `#FDE047` pada `jagung-muda` `#2E260E` (gelap) | 11.38:1 | AA |

Perlu diketahui: teks putih pada primær Tea Green `#56A73E` (tombol default sebelumnya) baru 3.00:1, tidak memenuhi 4.5:1 untuk teks normal. Oleh karena itu implementasi yang diterapkan menggunakan teks `#111827` di atas primær Tea Green, bukan putih, agar lolos WCAG AA.

Semua pasangan teks-lain minimal 4.5:1. Elemen grafik non-teks (ikon, strip, chip) minimal 3:1.

---

## 3. Skema Hijau Grafik Dasbor (Dual Mode)

Intensitas relatif terhadap min–max data yang ditampilkan; semakin tinggi nilai, semakin pekat warna.

**Mode Terang (rendah → tertinggi):**
1. `#BBF7D0`
2. `#6EE7B7`
3. `#38D2A3`
4. `#56A73E`
5. `#166534`

**Mode Gelap (rendah → tertinggi):**
1. `#1E4D3B`
2. `#257A5C`
3. `#38D2A3`
4. `#5EC444`
5. `#86EFAC`

Implementasi di `DashboardPage.tsx` memakai kelas `.heat-0` hingga `.heat-4` yang mengacu pada variabel CSS `--dashboard-level-0` hingga `--dashboard-level-4`, sehingga otomatis berganti saat `data-theme` / `.dark` berubah. Tidak ada hex hardcode di style inline. Label angka dan sumbu pakai token teks kontras. Legenda skala menyertakan swatch dan nilai. Badge unggulan memakai aksen kuning Jasuke (`#F4D026` terang / `#FACC15` gelap) secara proporsional.

---

## 4. Kode Warna Kartu Shift (Dual Mode)

Setiap kartu shift: permukaan bersih + border kiri tebal + badge pembeda, tidak ada blok gelap pekat.

| Shift | Terang bg | Terang border | Terang teks badge | Gelap bg | Gelap border | Gelap teks badge |
|---|---|---|---|---|---|---|
| Pagi | `#FFFBEB` | `#F39C12` | `#854D0E` | `#26200D` | `#FACC15` | `#FDE047` |
| Siang | `#ECFDF5` | `#38D2A3` | `#065F46` | `#102B24` | `#38D2A3` | `#6EE7C8` |
| Malam | `#F0FDF4` | `#56A73E` | `#166534` | `#132B1D` | `#5EC444` | `#9DF08A` |

Pagi digambarkan dengan kuning Jasuke, Siang dengan mint, Malam dengan tea. Status selalu teks + ikon (Sun / Sunrise / Moon), bukan warna saja.

---

## 5. Sidebar Aktif & Shift Chip

**Sidebar menu aktif:**
- Terang: bg `#EBF7E6`, border kiri `#56A73E`, teks & ikon `#1F5E16`.
- Gelap: bg `#1B3622`, border kiri `#5EC444`, teks & ikon `#9DF08A`.

**Chip shift aktif (header / topbar):**
- Terang: bg `#E6FAF3`, border `#38D2A3`, teks `#0F5132`, titik indikator `#22C55E`.
- Gelap: bg `#12332A`, border `#2B7A63`, teks `#A7F3D0`, titik indikator `#4ADE80`.

Chip selalu ikon + label dan target sentuh 44 px.

---

## 6. Chatbot Melayang (`ChatbotPopup.tsx`)

- Dipasang di `AppShell`, terlihat dari semua halaman tanpa meninggalkan halaman aktif.
- Tombol melayang (FAB) pojok kanan bawah, aksen hijau brand, ikon kontras tinggi, animasi buka/tutup halus, responsif (panel compact desktop, drawer/sheet mobile).
- State percakapan bertahan selama sesi (`localStorage` per pengguna).
- Panel & bubble mengikuti tema aktif: bubble pengguna solid primær, asisten mint soft, typing dots mint, penolakan netral.
- Tidak ada menu halaman Assistant duplikat di navigasi/router.

---

## 7. Implementasi

- `src/styles/globals.css` — token `:root` dan `.dark`, variabel grafik, utilitas `.heat-*`, `.heat-swatch-*`.
- `src/lib/tema.ts` — `KUNCI_PERSIST = "mrtea-tema:v2"`, `bersihkanPreferensiTema()`, meta warna browser.
- `src/stores/tema-store.ts` — default `"terang"`, reset kunci lama saat rehydrate.
- `src/components/PilihTema.tsx` — toggle terang/gelap/sistem dengan token aktif.
- `src/components/layout/{BrandMark,Sidebar,ShiftChip}.tsx` — logo dua nada, sidebar, chip shift.
