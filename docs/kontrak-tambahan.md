# Kontrak Tambahan

## Tipe Data

### TingkatGula

```typescript
/** Tingkat gula untuk menu teh dan jasuke. */
export type TingkatGula = "kurang" | "normal" | "ekstra"
```

### Menu

```typescript
/** Menu dengan tambahan foto dan pengaturan tingkat gula. */
export interface Menu {
  // ... field lama ...
  fotoUrl?: string
  bisaAturGula: boolean
}
```

### BuatPesananInput

```typescript
/** Item pesanan dengan tingkat gula opsional. */
export interface BuatPesananInput {
  // ... field lama ...
  items: { menuId: string; jumlah: number; tingkatGula?: TingkatGula }[]
}
```

### ItemPesanan

```typescript
/** Item pesanan dengan tingkat gula opsional. */
export interface ItemPesanan {
  // ... field lama ...
  tingkatGula?: TingkatGula
}
```

## Validasi

### TingkatGula

- Nilai harus salah satu dari: "kurang", "normal", atau "ekstra"
- Untuk menu dengan `bisaAturGula: false`, nilai harus "normal"
- Bawaan: "normal"

### Foto Menu

- Format: `/img/menu/*.webp`, `data:image/...`, atau URL HTTPS
- Ukuran maksimal: 30 KB
- Bawaan: ilustrasi kategori

## Contoh Request/Respons

### Request Buat Pesanan

```json
{
  "clientRequestId": "req-123",
  "kanal": "toko",
  "items": [
    {
      "menuId": "m-teh-ori",
      "jumlah": 2,
      "tingkatGula": "kurang"
    }
  ]
}
```

### Respons Pesanan

```json
{
  "id": "o-123",
  "nomor": "MT-261113-001",
  "items": [
    {
      "menuId": "m-teh-ori",
      "namaMenu": "Teh Original",
      "jumlah": 2,
      "hargaSatuan": 3000,
      "subtotal": 6000,
      "tingkatGula": "kurang"
    }
  ],
  "total": 6000
}
```

### Respons Menu

```json
{
  "id": "m-teh-ori",
  "nama": "Teh Original",
  "kategori": "teh",
  "harga": { "toko": 3000, "shopee_food": 4000 },
  "aktif": true,
  "sumberTakaran": "pic",
  "takaran": [...],
  "tersedia": true,
  "fotoUrl": "/img/menu/teh.webp",
  "bisaAturGula": true
}
```