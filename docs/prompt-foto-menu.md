# Foto menu: ilustrasi AI

File Figma berisi 12 gambar resolusi penuh (1280 x 960): https://www.figma.com/design/oP4dmeogABa77CgIXMPw9B

Model: gpt-image-2.5-flare lewat Figma AI, rasio 4:3. Ekspor dari Figma dengan nama file sesuai `menuId` di tabel.

## Dasar pembuatan

- Google Maps mencatat Mr. Tea & Jasuke di Jl. Bimo Kurdo, Sapen, Demangan, Gondokusuman, Yogyakarta, dengan 7 ulasan. Ulasan menyebut es teh dan jasuke, tetapi tidak ada daftar menu atau foto menu yang bisa dipakai.
- Web dan media sosial publik tidak memuat menu toko ini. Nama menu diambil dari data master di mock frontend, yang berasal dari use case bersama PIC.
- Gaya gambar mengikuti kemasan es teh dan jasuke kaki lima yang umum: gelas plastik bening bersegel, cup kertas putih, tanpa logo. Ganti dengan foto asli begitu PIC mengirimnya.
- Gambar ini ilustrasi, bukan foto produk. Aplikasi wajib menampilkan label "Ilustrasi AI" sampai foto asli tersedia.
- Foto menu hanya tampilan di frontend. Project Plan dan PRD tidak memuat foto menu, jadi tidak ada field foto di kontrak API dan tidak ada unggah foto di form menu. "Paket Teh + Jasuke" tetap berkategori Lainnya sesuai PRD POS-01.

## Prompt per menu

Prompt bisa dipakai ulang di Gemini, ChatGPT, atau Figma AI bila ada menu baru. Pertahankan kalimat gaya di akhir agar semua gambar seragam.

### Teh Original (`m-teh-ori`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Sweet iced jasmine tea (es teh manis): clear amber-brown tea with ice cubes in a 16 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Teh Jumbo (`m-teh-jumbo`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Jumbo sweet iced jasmine tea: amber-brown tea full of ice cubes in a tall 22 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. The cup looks noticeably tall and large. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Teh Lemon (`m-teh-lemon`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Iced lemon tea: lighter golden tea with ice cubes and one thin lemon slice pressed against the inside of a 16 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Teh Leci (`m-teh-leci`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Iced lychee tea: pale amber tea with ice cubes and two peeled white lychee fruits visible inside a 16 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Teh Susu (`m-teh-susu`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Iced milk tea (teh susu): creamy light-brown tea with ice cubes, a thick layer of white sweetened condensed milk settling at the bottom of a 16 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Thai Tea (`m-thai`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Thai tea: vivid orange Thai iced tea with ice cubes and a white milk swirl near the top, in a 16 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Teh Lemon Jumbo (`m-teh-lemon-jumbo`)

```text
Realistic menu photo for a small Indonesian street-side iced tea stall. Jumbo iced lemon tea: lighter golden tea with ice cubes and two thin lemon slices inside a tall 22 oz clear plastic cup, top heat-sealed with a plain transparent sealer film, one plain straw. The cup looks noticeably tall and large. Plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Jasuke Original (`m-jasuke-ori`)

```text
Realistic menu photo for a small Indonesian street snack stall. Jasuke (jagung susu keju), original: warm steamed yellow sweet corn kernels mixed with melted margarine, drizzled with white sweetened condensed milk and a light sprinkle of grated yellow cheese, served in a 12 oz plain white paper cup with a small plain plastic spoon stuck in. Plain warm off-white table, 3/4 angle from slightly above, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Jasuke Keju Double (`m-jasuke-keju`)

```text
Realistic menu photo for a small Indonesian street snack stall. Jasuke double cheese: warm steamed yellow sweet corn kernels with margarine and white sweetened condensed milk, topped with a generous heaped mound of finely grated yellow cheddar cheese, served in a 12 oz plain white paper cup with a small plain plastic spoon. Plain warm off-white table, 3/4 angle from slightly above, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Jasuke Cokelat Keju (`m-jasuke-coklat`)

```text
Realistic menu photo for a small Indonesian street snack stall. Jasuke chocolate cheese: warm steamed yellow sweet corn kernels with margarine and white sweetened condensed milk, topped with dark chocolate sprinkles (meses) and grated yellow cheese, served in a 12 oz plain white paper cup with a small plain plastic spoon. Plain warm off-white table, 3/4 angle from slightly above, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Jasuke Balado (`m-jasuke-balado`)

```text
Realistic menu photo for a small Indonesian street snack stall. Jasuke balado: warm steamed yellow sweet corn kernels glossy with melted margarine, dusted with red-orange spicy balado seasoning powder, no milk, served in a 12 oz plain white paper cup with a small plain plastic spoon. Plain warm off-white table, 3/4 angle from slightly above, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns on the cup, no hands, no people.
```

### Paket Teh + Jasuke (`m-paket`)

```text
Realistic menu photo for a small Indonesian street stall, combo set: one 16 oz clear plastic cup of sweet iced jasmine tea (amber-brown with ice, heat-sealed transparent film lid, plain straw) standing next to one 12 oz plain white paper cup of jasuke (steamed sweet corn with margarine, condensed milk and grated cheese, small plastic spoon). Both side by side on a plain warm off-white table, 3/4 angle, soft natural daylight from the left, slight shadow, shallow depth of field, clean empty light background. Honest and appetizing. No text, no logo, no brand names, no printed patterns, no hands, no people.
```
