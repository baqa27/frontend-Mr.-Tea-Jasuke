# Integrasi API Mr. Tea & Jasuke

Dokumen acuan kontrak integrasi antara Frontend React (repo mandiri/tim) dengan Backend Express dan layanan AI FastAPI (tim A26-CS164).

Basis data dan runtime backend ada di repo kolaborasi (`https://github.com/llailynisa/Mr-Tea-Jasuke.git`). Kontrak mengacu pada OpenAPI 3.0.3 di `backend/docs/openapi.yaml` dan berkas-berkas di `backend/docs/openapi/paths/` serta `backend/docs/component.yaml`.

---

## 1. Konfigurasi dan Lingkungan

| Parameter | Nilai Bawaan | Keterangan |
|---|---|---|
| Base URL | `http://localhost:3000/api/v1` | Diatur lewat variabel `VITE_API_BASE_URL` |
| Mode Mock | `false` | Fallback mock adapter di `src/mocks/` dimatikan secara default (`VITE_USE_MOCK=false`) |
| Format Data | `application/json` | Header `Content-Type: application/json` pada mutasi |
| Timeout HTTP | 75 detik (login), 15 detik (lainnya) | Dikelola lewat instance `http` di `src/lib/axios.ts` |

### Amplop Respons Standar

Semua endpoint mengembalikan struktur JSON konsisten:

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... },
  "errors": null
}
```

Format galat (`success: false`):

```json
{
  "success": false,
  "message": "Validasi gagal",
  "data": null,
  "errors": [
    { "field": "shiftNumber", "message": "Shift pagi sudah dibuka hari ini" }
  ]
}
```

Instance Axios di `src/lib/axios.ts` otomatis membuka amplop ini: bila `success: true`, pemanggil menerima isi `data`; bila `success: false` atau status HTTP bukan 2xx, Axios menolak promise dengan instans `ApiError`.

---

## 2. Autentikasi dan Sesi

- **Metode:** Bearer JWT di header `Authorization: Bearer <token>`.
- **Penyimpanan:** **Hanya di memori** (`src/stores/auth-store.ts`). Token tidak disimpan di `localStorage` maupun `sessionStorage` untuk mematuhi kaidah keamanan dan batasan OpenAPI (tidak ada endpoint refresh token).
- **Konsekuensi reload (Q-10):** Bila peramban di-refresh, pengguna harus login kembali. Perilaku ini terdokumentasi dan sengaja dipertahankan.
- **Kedaluwarsa / 401:** Memicu pembersihan sesi dan pengalihan ke halaman `/login`, kecuali untuk panggilan yang sedang berada di `/auth/login`.

---

## 3. Pemetaan Endpoint ke Hook Frontend

### 3.1 Autentikasi dan Sistem

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `GET` | `/health` | `authApi.health()` | Publik | Sesuai OpenAPI |
| `POST` | `/auth/login` | `authApi.login({ username, password })` | Publik | Sesuai OpenAPI. Mengembalikan `{ token, user }` |
| `GET` | `/auth/me` | `authApi.me()` | Bearer | Sesuai OpenAPI. Mengembalikan objek pengguna |
| `POST` | `/auth/logout` | `authApi.logout()` | Bearer | **TODO(BACKEND-SYNC):** Belum ada di OpenAPI; frontend membersihkan token lokal di memori secara mandiri |

### 3.2 Katalog Menu dan Resep

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `GET` | `/menu-items` | `useMenus()` | Bearer | Query `includeInactive=true`. Menghasilkan array `MenuItem` |
| `POST` | `/menu-items` | `useSaveMenu()` | OWNER | Body: `{ name, category, price, isAssumed? }` |
| `PUT` | `/menu-items/{id}` | `useSaveMenu()` | OWNER | Body: `{ name?, category?, price?, isActive?, isAssumed? }` |
| `DELETE` | `/menu-items/{id}` | `useMenuStatus()` | OWNER | Soft-delete via backend (`isActive: false`) |
| `GET` | `/menu-items/{id}/recipe` | — | OWNER | Tersedia di OpenAPI; frontend saat ini membaca takaran lewat `takaran: []` bawaan mapper |
| `PUT` | `/menu-items/{id}/recipe` | — | OWNER | Tersedia di OpenAPI; belum dipanggil langsung dari master menu |

**Catatan Kontrak Menu:**
- Field `fotoUrl`, `tingkatGula`, `bisaAturGula`, dan harga terpisah `shopee_food` **tidak ada di skema OpenAPI backend**. Frontend menyetel `fotoUrl: null`, takaran kosong, dan `bisaAturGula: false` melalui mapper tanpa menjatuhkan validasi.

### 3.3 Bahan Baku dan Stok

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `GET` | `/ingredients` | `useIngredients()` | Bearer | Menghasilkan array `Ingredient` |
| `POST` | `/ingredients` | `useSaveBahan()` | OWNER | Body: `{ name, unit, currentStock, minStock, isAssumed? }` |
| `PUT` | `/ingredients/{id}` | `useSaveBahan()` | OWNER | Body: `{ name?, unit?, minStock?, isAssumed? }` (stok saat ini tidak diubah lewat PUT) |
| `DELETE` | `/ingredients/{id}` | `useBahanStatus()` | OWNER | Hard-delete di skema OpenAPI |
| `GET` | `/stock` | — | Bearer | Menghasilkan array stok bahan |
| `GET` | `/stock/low` | `useLowStock()` | Bearer | Bahan dengan `currentStock <= minStock` |
| `POST` | `/stock/incoming` | `useStockIn()` | Bearer | Body: `{ items: [{ ingredientId, quantity, note? }] }` |
| `GET` | `/stock/movements` | `useMovements(ingredientId)` | OWNER | Riwayat mutasi per bahan baku |
| `GET` | `/stock/risk` | `useRisk()` | OWNER | **TODO(BACKEND-SYNC):** Endpoint prediksi risiko kehabisan belum ada di OpenAPI; dinonaktifkan via `VITE_FLAG_RISK_MODEL=false` |

**Catatan Kontrak Bahan:**
- Skema backend tidak memiliki field `presisi` dan `toleransiSelisih`. Frontend memakai nilai bawaan (`presisi: 2`, `toleransiSelisih: 0`) pada mapper.

### 3.4 Kasir / POS dan Pesanan

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `POST` | `/orders` | `useCreateOrder()` | Bearer | Body: `{ channel: "STORE" \| "SHOPEE_FOOD", items: [{ menuItemId, quantity }], clientRequestId? }` |
| `GET` | `/orders` | `useOrders({ shiftId, date, page, limit })` | Bearer | Respons: `{ items, pagination: { page, limit, total } }` |
| `GET` | `/orders/{id}` | `useOrder(id)` | Bearer | Detail pesanan tunggal |
| `POST` | `/orders/{id}/cancel` | — | Bearer | **TODO(BACKEND-SYNC):** Belum ada di OpenAPI (keputusan Q-03); frontend tidak menampilkan opsi pembatalan |

**Kaidah Idempotensi Pesanan:**
- Frontend menyertakan `clientRequestId: crypto.randomUUID()` pada body `POST /orders` untuk mencegah dobel pesanan saat jaringan lambat (POS-06). Bila backend belum membaca field ini, Express akan mengabaikannya dengan aman.
- `tingkatGula` disimpan di keranjang lokal tetapi tidak dikirim ke backend karena tidak tercantum di skema pesanan OpenAPI.

### 3.5 Shift dan Tutup Kasir

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `GET` | `/shifts/current` | `useActiveShift()` | Bearer | Mengembalikan shift yang sedang aktif atau `null` bila kasir tutup |
| `POST` | `/shifts/open` | `useOpenShift()` | Bearer | Body: `{ shiftNumber: 1 \| 2 \| 3 }`. 1=pagi, 2=siang, 3=malam |
| `POST` | `/shifts/{id}/close` | `useCloseShift()` | Bearer | Body: `{ counts: [{ ingredientId, physicalStock }] }` |
| `GET` | `/shifts/{id}` | `useShiftSummary(id)` / `useShiftRecap(id)` | Bearer | Mengembalikan detail shift beserta `stockCounts[]` |

**Pemetaan Shift:**
- `shiftNumber` dipetakan dua arah: `1` ↔ `pagi`, `2` ↔ `siang`, `3` ↔ `malam`.
- `stockCounts[]` dari respons `/shifts/{id}` dipetakan penuh ke `RekapShift.stok` (stok awal, masuk, terpakai, sistem, fisik, selisih).

### 3.6 Rekap Harian dan Dasbor Analitik

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `GET` | `/recaps` | `useRecaps(from, to)` | OWNER | Query: `startDate` dan `endDate` (format `YYYY-MM-DD`). Mengembalikan array `DailyRecap` |
| `GET` | `/recaps/{date}` | `useRecap(date)` | OWNER | Detail rekap harian untuk tanggal spesifik |

**Filter Rentang Waktu Dasbor (`DashboardPage.tsx`):**
- **1 Hari:** `startDate = endDate = hariIni`
- **7 Hari:** `startDate = 6 hari lalu`, `endDate = hariIni`
- **30 Hari:** `startDate = 29 hari lalu`, `endDate = hariIni`
- **Custom Range:** `startDate` dan `endDate` ditentukan manual oleh pengguna lewat input kalender.
- Setiap perubahan preset langsung memicu refetch TanStack Query via kunci query `qk.recaps(from, to)`.
- Field `topMenu` dari rekap dipetakan ke daftar menu terlaris (`menuTerjual`). Rincian per shift tidak disediakan di tingkat rekap harian oleh backend, sehingga ditandai dengan `TODO(BACKEND-SYNC)`.

### 3.7 Layanan AI: Perkiraan Belanja dan Chatbot

| Method | Endpoint | Hook / Fungsi | Hak Akses | Status Sinkron |
|---|---|---|---|---|
| `POST` | `/forecast` | `useForecast()` | OWNER | Body: `{ targetDate?: "YYYY-MM-DD" }`. Mengembalikan prediksi bahan + metrik MAE/RMSE |
| `GET` | `/forecast/history` | `useForecastHistory({ limit })` | OWNER | Riwayat prediksi perkiraan belanja sebelumnya |
| `POST` | `/chat` | `useSendChat()` | Bearer | Body: `{ message: string, sessionId?: string }`. Mengembalikan `{ sessionId, answer, intent, sources }` |
| `GET` | `/chat/history` | `useChatHistory(sessionId)` | Bearer | Query: `sessionId`. Mengembalikan array percakapan berurutan |

**Pola Chatbot Pop-Up (`ChatbotPopup.tsx` + `ChatBody.tsx`):**
- Riwayat per sesi `/chat/history` dipecah oleh mapper menjadi pesan berurutan: pesan pengguna (`question`) diikuti tanggapan asisten (`answer`).
- `sessionId` disimpan di `localStorage` per pengguna (`mrtea-chat-sesi:${userId}`) agar percakapan tidak hilang saat berpindah antar halaman.
- Komponen chat menggunakan token tema penuh (`bg-primary`, `bg-mint-muda`, `bg-muted`) sehingga otomatis mengikuti Mode Terang dan Mode Gelap tanpa hardcode warna.

---

## 4. Daftar Kesenjangan Kontrak dan Solusi Frontend

| Kode | Kasus | Kontrak Backend Aktual | Solusi Frontend |
|---|---|---|---|
| `TODO(BACKEND-SYNC:AUTH-01)` | Logout | Endpoint `/auth/logout` tidak ada di OpenAPI | Bersihkan state autentikasi di memori, arahkan ke login |
| `TODO(BACKEND-SYNC:ORD-01)` | Batal Pesanan | Endpoint pembatalan pesanan tidak ada (Q-03) | Opsi batalkan pesanan tidak ditampilkan di UI |
| `TODO(BACKEND-SYNC:ORD-02)` | Tingkat Gula | Skema pesanan tidak punya field gula | Gula dipilih kasir di keranjang, diabaikan saat kirim body |
| `TODO(BACKEND-SYNC:ORD-03)` | Idempotensi | Skema `/orders` tidak mendokumentasikan `clientRequestId` | Frontend tetap mengirim UUID di body sebagai antisipasi retry jaringan |
| `TODO(BACKEND-SYNC:MST-01)` | Foto & Opsi Menu | Tidak ada `fotoUrl`, takaran resep, atau `bisaAturGula` | Mapper memberi fallback kosong; foto menggunakan ilustrasi lokal berlabel |
| `TODO(BACKEND-SYNC:MST-02)` | Presisi Bahan | Tidak ada `presisi` dan `toleransiSelisih` | Mapper menyetel presisi 2 desimal dan toleransi 0 |
| `TODO(BACKEND-SYNC:STK-01)` | Risiko Stok | Endpoint `/stock/risk` belum ada | Dinonaktifkan lewat feature flag |
| `TODO(BACKEND-SYNC:RKP-01)` | Rincian Shift Harian | `DailyRecap` tidak menyertakan array per shift | Tampilkan agregat omzet dan kanal; rincian per shift diakses via menu Shift |
