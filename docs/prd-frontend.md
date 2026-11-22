**PRODUCT REQUIREMENTS DOCUMENT**

Frontend Aplikasi Web Rekap Penjualan dan Stok Harian

**UMKM Mr. Tea & Jasuke**

*Capstone Project Asah 2026 led by Dicoding supported by GoTo*

|                      |                                                                                                                                    |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------|
| **Atribut**          | **Keterangan**                                                                                                                     |
| ID Tim               | A26-CS164                                                                                                                          |
| Judul use case       | Efisiensi Rekapitulasi Penjualan dan Stok Harian UMKM Mr. Tea & Jasuke                                                             |
| Dokumen acuan        | Project Plan A26-CS164 (Ringkasan Eksekutif, Cakupan Proyek, Sumber Daya, Risiko, Rencana Pengujian)                               |
| Cakupan PRD          | Seluruh pekerjaan frontend (React + Vite + Tailwind CSS + shadcn/ui)                                                               |
| Penyusun             | Muhammad Sultan Baqa (fs466b6y1270), AI Full-Stack Developer, penanggung jawab frontend                                            |
| Mitra kerja langsung | Fitri Laily Yuanisa (backend), Moh. Ferdinand Ramdhani dan Alfian Hafidz Affandi (AI), Agnetha Giselle dan Ayu Rahma Adibrata (DS) |
| Versi / status       | 1.0 / Draf untuk disepakati tim                                                                                                    |
| Tanggal              | 12 November 2026                                                                                                                   |

**DAFTAR ISI**

**1. Pendahuluan** **4**

> 1.1 Tujuan Dokumen 4
>
> 1.2 Ruang Lingkup Frontend 4
>
> 1.3 Cara Memakai Dokumen Ini 5
>
> 1.4 Istilah 5

**2. Latar Belakang dan Sasaran Produk** **6**

> 2.1 Masalah yang Diselesaikan 6
>
> 2.2 Sasaran dan Ukuran Keberhasilan Frontend 6

**3. Pengguna dan Hak Akses** **7**

> 3.1 Profil Pengguna 7
>
> 3.2 Matriks Hak Akses 7

**4. Alur Pengguna Utama** **8**

> 4.1 Login dan Pengalihan 8
>
> 4.2 Buka Shift 8
>
> 4.3 Catat Pesanan 8
>
> 4.4 Catat Barang Masuk 8
>
> 4.5 Tutup Shift 9
>
> 4.6 Pemantauan oleh Pemilik 9

**5. Kebutuhan Fungsional** **10**

> 5.1 Autentikasi dan Sesi 10
>
> 5.2 Kerangka Aplikasi dan Navigasi 10
>
> 5.3 Beranda Pemilik 11
>
> 5.4 Buka Shift 11
>
> 5.5 Pencatatan Pesanan (PoS) 12
>
> 5.6 Riwayat Pesanan 13
>
> 5.7 Stok dan Barang Masuk 13
>
> 5.8 Tutup Shift dan Rekap Shift 14
>
> 5.9 Rekap Harian 15
>
> 5.10 Data Master Menu, Bahan Baku, dan Takaran 15
>
> 5.11 Perkiraan Belanja 16
>
> 5.12 Dasbor Streamlit Tertanam 17
>
> 5.13 Asisten Toko 17
>
> 5.14 Onboarding, Bantuan, dan Notifikasi 18
>
> 5.15 Penanganan Galat dan Degradasi 19

**6. Spesifikasi Rute dan Halaman** **20**

**7. Model Data Frontend** **22**

> 7.1 Aturan Turunan di Klien 24

**8. Kontrak API yang Dibutuhkan Frontend** **25**

> 8.1 Format Respons 25
>
> 8.2 Daftar Endpoint 25
>
> 8.3 Pemetaan Galat 26

**9. Arsitektur Frontend** **28**

> 9.1 Teknologi dan Pustaka 28
>
> 9.2 Struktur Folder 28
>
> 9.3 Pengelolaan State 29
>
> 9.4 Lapisan HTTP dan Cache 29
>
> 9.5 Pengembangan dengan Mock 30
>
> 9.6 Variabel Lingkungan dan Feature Flag 30
>
> 9.7 Deploy 31

**10. Desain Antarmuka** **32**

> 10.1 Prinsip Desain 32
>
> 10.2 Tata Letak Responsif 32
>
> 10.3 Token Desain 32
>
> 10.4 Komponen 33
>
> 10.5 Pola Keadaan Halaman 33
>
> 10.6 Format dan Pesan 34
>
> 10.7 Aksesibilitas 34

**11. Kebutuhan Non-Fungsional** **35**

**12. Keamanan di Sisi Frontend** **36**

**13. Rencana Pengujian Frontend** **37**

> 13.1 Uji Unit dan Komponen 37
>
> 13.2 Skenario Uji Fungsional 37
>
> 13.3 Uji End-to-End 38

**14. Rencana Implementasi Sekali Jalan** **39**

> 14.1 Definisi Selesai 40

**15. Keterlacakan ke Project Plan** **41**

**16. Asumsi, Pertanyaan Terbuka, dan Catatan Dokumen** **42**

> 16.1 Pertanyaan Terbuka 42
>
> 16.2 Catatan Ketidaksesuaian pada Project Plan 43

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini menetapkan kebutuhan frontend aplikasi web rekap penjualan dan stok harian Mr. Tea & Jasuke secara lengkap, mulai dari halaman, komponen, aturan validasi, bentuk data, kontrak API yang dibutuhkan frontend, hingga kriteria penerimaan. PRD ini menjadi acuan tunggal bagi penanggung jawab frontend saat membangun antarmuka, sekaligus bahan kesepakatan dengan backend dan tim AI pada saat penyusunan kontrak OpenAPI (T5).

PRD sengaja tidak mengikuti pembagian minggu pada Jadwal Pengerjaan. Seluruh modul frontend dirancang untuk dibangun dalam satu kali pengerjaan memakai data tiruan (mock) yang mengikuti kontrak API. Ketika endpoint backend siap, frontend cukup mengganti sumber data melalui satu variabel lingkungan, tanpa membongkar komponen. Pendekatan ini membuat penyesuaian terhadap jadwal tim tetap mudah, karena urutan sambung ke API dapat mengikuti kesiapan backend.

## 1.2 Ruang Lingkup Frontend

**Termasuk dalam cakupan frontend:**

-   Autentikasi dua peran (karyawan dan pemilik), penjaga rute, dan navigasi per peran.

-   Alur operasional shift: buka shift, pencatatan pesanan (PoS), riwayat pesanan, stok bahan, barang masuk, tutup shift, dan rekap shift.

-   Halaman khusus pemilik: beranda ringkasan, rekap harian per tanggal, data master menu, bahan baku, dan takaran.

-   Antarmuka fitur AI dan data: Perkiraan Belanja (hasil model forecasting beserta metrik), dasbor Streamlit tertanam, Asisten Toko (chatbot), dan penanda risiko stok di balik feature flag.

-   Onboarding, bantuan kontekstual, halaman panduan, notifikasi status, serta penanganan galat dan degradasi saat layanan AI atau server lambat.

-   Pengujian frontend, deploy ke Vercel, dan bagian frontend pada README Web/API serta Buku Panduan Pengguna.

**Di luar cakupan frontend** (mengikuti bagian Yang Tidak Dikerjakan pada Project Plan): pemesanan mandiri pelanggan, program loyalitas, jadwal shift dan penggajian, integrasi API Shopee Food, payment gateway, printer struk fisik, kanal Telegram atau WhatsApp, aplikasi mobile native, multi-cabang, laporan akuntansi lengkap, serta logika bisnis yang menjadi wewenang server (pemotongan stok, perhitungan rekap final, dan inferensi model).

## 1.3 Cara Memakai Dokumen Ini

1.  Bagian 3 sampai 5 menjelaskan apa yang dibangun: pengguna, alur, dan kebutuhan fungsional dengan ID (misalnya POS-04). ID ini dipakai pada judul pull request dan lembar uji.

2.  Bagian 6 sampai 8 menjelaskan bentuk teknis: rute, tipe data, dan kontrak API usulan frontend. Kontrak final tetap mengikuti dokumen OpenAPI yang disepakati bersama backend.

3.  Bagian 9 sampai 12 menjelaskan arsitektur, desain antarmuka, kebutuhan non-fungsional, dan keamanan.

4.  Bagian 13 dan 14 berisi rencana pengujian serta urutan implementasi sekali jalan berikut definisi selesai.

5.  Bagian 15 dan 16 memetakan kebutuhan ke ID Project Plan, lalu mencatat asumsi, pertanyaan terbuka, dan ketidaksesuaian dokumen yang perlu dibahas tim.

## 1.4 Istilah

|                   |                                                                                                                                                  |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **Istilah**       | **Arti dalam dokumen ini**                                                                                                                       |
| Shift             | Satu periode kerja karyawan. Dalam sehari terdapat tiga shift: Pagi, Siang, dan Malam. Shift Malam adalah shift ketiga yang memicu rekap harian. |
| Kanal             | Sumber pesanan: Toko (pembeli langsung) atau Shopee Food (diinput manual oleh karyawan).                                                         |
| Takaran           | Jumlah setiap bahan baku yang terpakai untuk satu porsi menu.                                                                                    |
| Stok tercatat     | Stok menurut sistem: stok awal + barang masuk - pemakaian dari pesanan.                                                                          |
| Stok fisik        | Hasil hitung langsung oleh karyawan saat tutup shift.                                                                                            |
| Selisih           | Stok fisik - stok tercatat. Nilai negatif berarti bahan berkurang lebih banyak dari catatan.                                                     |
| Toleransi selisih | Batas selisih per bahan yang masih dianggap wajar. Selisih di atas toleransi wajib diberi catatan.                                               |
| Stok minimum      | Batas bawah stok. Bahan pada atau di bawah batas ini ditandai Hampir habis.                                                                      |
| Mock              | Data tiruan yang dilayani Mock Service Worker (MSW) dengan bentuk persis seperti kontrak API.                                                    |
| Feature flag      | Saklar konfigurasi untuk menyalakan atau mematikan fitur tambahan tanpa mengubah kode.                                                           |
| Cold start        | Jeda sekitar satu menit saat layanan Render Free bangun setelah tidak aktif 15 menit.                                                            |

# 2. Latar Belakang dan Sasaran Produk

## 2.1 Masalah yang Diselesaikan

Mr. Tea & Jasuke mencatat penjualan dan stok bahan baku secara manual di buku. Rekapitulasi harian memakan waktu, rawan salah hitung, dan selisih stok sulit dilacak, terutama saat pergantian shift. Pemilik juga belum memiliki dasar data untuk memutuskan bahan apa yang perlu dibeli sebelum stok habis.

Dari sisi antarmuka, masalah tersebut menuntut tiga hal. Pertama, karyawan harus bisa mencatat pesanan lebih cepat daripada menulis di buku, terutama di ponsel saat antrean ramai. Kedua, proses tutup shift harus menuntun karyawan menghitung stok fisik tanpa celah langkah yang terlewat. Ketiga, pemilik harus dapat membaca rekap, selisih, dan perkiraan belanja tanpa membuka banyak halaman.

## 2.2 Sasaran dan Ukuran Keberhasilan Frontend

|                                       |                                                                         |                                                                   |                                                                             |
|---------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **Sasaran**                           | **Ukuran**                                                              | **Target usulan**                                                 | **Cara ukur**                                                               |
| Pencatatan pesanan cepat              | Jumlah ketukan untuk menyimpan satu pesanan berisi satu menu            | Maksimal 3 ketukan dari halaman PoS                               | Uji alur di ponsel Android                                                  |
| Tutup shift efisien                   | Durasi dari langkah pertama tutup shift hingga konfirmasi               | Di bawah 5 menit untuk sekitar 10 bahan                           | Field durasiTutupDetik yang dikirim frontend dan pengamatan saat demo (W15) |
| Bebas kesalahan input                 | Persentase input tidak valid yang lolos ke server                       | 0% untuk kasus kosong, nol, negatif, dan desimal pada jumlah menu | Unit test skema validasi dan lembar uji                                     |
| Dapat dipakai tanpa pelatihan panjang | Karyawan menyelesaikan alur buka shift sampai tutup shift tanpa bantuan | Berhasil pada sesi demo dengan PIC dan karyawan                   | Observasi dan kuesioner umpan balik (W6, W15)                               |
| Tahan gangguan AI                     | Fitur PoS dan stok tetap berjalan saat layanan AI mati                  | 100% skenario uji degradasi lulus                                 | Uji dengan mock respons 503 dan timeout (T4)                                |
| Ramah perangkat seluler               | Scroll horizontal pada lebar 360 px                                     | Tidak ada                                                         | Uji Chrome DevTools dan ponsel nyata (W7)                                   |

Target di atas merupakan usulan frontend dan perlu disepakati tim sebelum dicantumkan pada laporan akhir.

# 3. Pengguna dan Hak Akses

## 3.1 Profil Pengguna

|                |                                                                                                               |                                                                                                        |                                                                                             |
|----------------|---------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **Peran**      | **Konteks pemakaian**                                                                                         | **Kebutuhan utama**                                                                                    | **Implikasi desain**                                                                        |
| Karyawan shift | Berdiri di area kasir, memakai ponsel atau laptop toko, sering di tengah antrean, satu tangan memegang gelas. | Catat pesanan cepat, catat barang masuk, hitung stok saat tutup shift, tanya SOP.                      | Tombol besar, alur pendek, bottom navigation di ponsel, keypad numerik, sedikit pengetikan. |
| Pemilik        | Memantau dari rumah atau toko, lebih sering memakai laptop, sesekali ponsel.                                  | Melihat rekap per tanggal, selisih stok, menu terlaris, perkiraan belanja, mengelola menu dan takaran. | Tata letak sidebar di desktop, tabel padat informasi, filter tanggal, grafik dan dasbor.    |

## 3.2 Matriks Hak Akses

Penjaga rute di frontend hanya mengatur tampilan. Penegakan hak akses tetap dilakukan backend (W5). Tanda (S) berarti membutuhkan shift aktif.

|                                  |                  |                         |
|----------------------------------|------------------|-------------------------|
| **Fitur / halaman**              | **Karyawan**     | **Pemilik**             |
| Login, Bantuan, Asisten Toko     | Ya               | Ya                      |
| Status dan buka shift            | Ya               | Ya                      |
| PoS (catat pesanan)              | Ya (S)           | Ya (S)                  |
| Riwayat pesanan                  | Shift aktif saja | Semua tanggal dan shift |
| Daftar stok dan detail mutasi    | Ya               | Ya                      |
| Barang masuk                     | Ya (S)           | Ya (S)                  |
| Tutup shift dan rekap shift      | Ya (S)           | Ya (S)                  |
| Beranda pemilik                  | Tidak            | Ya                      |
| Rekap harian per tanggal         | Tidak            | Ya                      |
| Data master menu, bahan, takaran | Tidak            | Ya                      |
| Perkiraan Belanja                | Tidak            | Ya                      |
| Dasbor Streamlit                 | Tidak            | Ya                      |
| Kolom risiko stok (T13, flag)    | Ya               | Ya                      |

# 4. Alur Pengguna Utama

Alur berikut menurunkan lima alur pada Project Plan menjadi langkah antarmuka. Setiap langkah merujuk ke ID kebutuhan pada Bagian 5.

## 4.1 Login dan Pengalihan

1.  Pengguna membuka URL aplikasi. Aplikasi mengirim ping GET /health untuk membangunkan server (ERR-02).

2.  Pengguna mengisi nama pengguna dan kata sandi, lalu menekan Masuk (AUTH-01).

3.  Karyawan tanpa shift aktif diarahkan ke halaman Shift. Karyawan dengan shift aktif diarahkan ke PoS. Pemilik diarahkan ke Beranda Pemilik (AUTH-02).

4.  Pada login pertama, tur onboarding sesuai peran tampil dan dapat dilewati (ONB-01).

## 4.2 Buka Shift

1.  Halaman Shift menampilkan status: belum ada shift aktif, atau shift aktif beserta pembukanya (SHF-01).

2.  Karyawan memilih nama shift. Aplikasi mengusulkan shift berikutnya berdasarkan urutan hari itu (SHF-02).

3.  Aplikasi menampilkan stok awal hasil penutupan shift sebelumnya. Karyawan mencentang konfirmasi sudah memeriksa stok awal.

4.  Karyawan menekan Buka Shift. Aplikasi mengarahkan ke PoS dan memperbarui chip status shift (SHF-04).

## 4.3 Catat Pesanan

1.  Karyawan memilih kanal (Toko atau Shopee Food) bila berbeda dari bawaan (POS-02).

2.  Karyawan mengetuk kartu menu. Setiap ketukan menambah satu porsi ke keranjang (POS-03).

3.  Karyawan mengubah jumlah bila perlu, memeriksa total, lalu menekan Simpan Pesanan (POS-05, POS-06).

4.  Aplikasi menampilkan notifikasi diproses, lalu berhasil atau gagal. Pesanan langsung muncul di riwayat dan stok terbarui (ORD-05).

## 4.4 Catat Barang Masuk

1.  Karyawan membuka Stok, lalu Barang Masuk (STK-05).

2.  Karyawan menambah baris bahan dan jumlah. Aplikasi menampilkan pratinjau stok setelah masuk.

3.  Karyawan menyimpan. Stok bertambah dan penanda hampir habis diperbarui (STK-06).

## 4.5 Tutup Shift

1.  Karyawan membuka Tutup Shift dan memeriksa ringkasan pesanan serta barang masuk selama shift (TUT-02).

2.  Karyawan menghitung dan mengisi stok fisik setiap bahan. Isian tersimpan sementara bila halaman tertutup (TUT-03, TUT-04).

3.  Aplikasi menampilkan selisih tiap bahan. Bahan yang melewati toleransi wajib diberi catatan (TUT-05).

4.  Karyawan mengonfirmasi penutupan. Aplikasi menampilkan Rekap Shift (TUT-07, TUT-08).

5.  Jika shift yang ditutup adalah Shift Malam, aplikasi memberi tahu bahwa rekap harian sudah dibuat (TUT-09).

## 4.6 Pemantauan oleh Pemilik

1.  Pemilik membuka Beranda dan melihat omzet hari berjalan, shift aktif, dan bahan hampir habis (BRD-01).

2.  Pemilik membuka Rekap Harian, memilih tanggal, lalu membaca omzet per kanal, rekap per shift, menu terjual, dan selisih stok (RKP-01, RKP-02).

3.  Pemilik membuka Perkiraan Belanja untuk melihat kebutuhan bahan besok dan saran jumlah beli (FC-01 sampai FC-05).

4.  Pemilik membuka Dasbor untuk analisis visual dengan filter tanggal dan shift (DSB-01).

5.  Pemilik atau karyawan bertanya kepada Asisten Toko tentang SOP, stok, atau penjualan (AST-01 sampai AST-09).

# 5. Kebutuhan Fungsional

Kolom Ref merujuk ke ID fitur pada Project Plan. Seluruh kebutuhan berprioritas wajib kecuali yang merujuk ke ID berawalan T (tambahan) atau diberi keterangan opsional.

## 5.1 Autentikasi dan Sesi

|         |                                                                                                                                                                                                       |                                                                                                                                                  |         |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID**  | **Kebutuhan**                                                                                                                                                                                         | **Kriteria penerimaan**                                                                                                                          | **Ref** |
| AUTH-01 | Halaman login berisi field nama pengguna dan kata sandi, tombol tampilkan atau sembunyikan kata sandi, dan tombol Masuk.                                                                              | Field kosong ditolak di klien dengan pesan di bawah field. Tombol Masuk menampilkan indikator memproses dan nonaktif selama permintaan berjalan. | W5      |
| AUTH-02 | Setelah login berhasil, aplikasi menyimpan token dan profil, lalu mengarahkan pengguna sesuai peran dan status shift. Parameter ?redirect= dihormati bila rute tujuan diizinkan untuk peran tersebut. | Karyawan tanpa shift aktif masuk ke /shift, karyawan dengan shift aktif ke /pos, pemilik ke /pemilik/beranda.                                    | W5      |
| AUTH-03 | Login gagal menampilkan pesan umum tanpa menyebut field mana yang salah.                                                                                                                              | Pesan: "Nama pengguna atau kata sandi salah." Isian nama pengguna dipertahankan, kata sandi dikosongkan.                                         | W5      |
| AUTH-04 | Token disertakan otomatis pada setiap permintaan melalui interceptor Axios. Respons 401 menghapus sesi dan cache data.                                                                                | Setelah 401, pengguna diarahkan ke /login dengan pesan "Sesi berakhir, silakan masuk lagi."                                                      | W5, T1  |
| AUTH-05 | Logout tersedia di menu profil. Bila shift masih aktif, tampil peringatan bahwa keluar tidak menutup shift.                                                                                           | Logout membersihkan token, store, dan cache TanStack Query.                                                                                      | W5      |
| AUTH-06 | Rute terlindungi menolak pengguna tanpa sesi dan pengguna di luar peran.                                                                                                                              | Tanpa sesi diarahkan ke /login. Peran tidak sesuai melihat halaman 403 dengan tombol kembali ke beranda.                                         | W5      |
| AUTH-07 | Kotak informasi akun demo di halaman login untuk reviewer.                                                                                                                                            | Tampil hanya bila VITE\_SHOW\_DEMO\_ACCOUNTS=true. Nilainya berasal dari variabel lingkungan, tidak ditulis di kode.                             | W5      |

## 5.2 Kerangka Aplikasi dan Navigasi

|        |                                                                                                                        |                                                                                                                              |         |
|--------|------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                          | **Kriteria penerimaan**                                                                                                      | **Ref** |
| NAV-01 | AppShell responsif. Lebar 1024 px ke atas memakai sidebar kiri. Di bawah 1024 px memakai topbar dan bottom navigation. | Bottom navigation karyawan berisi maksimal lima item: Shift, PoS, Pesanan, Stok, Lainnya. Item lain berada di sheet Lainnya. | T1, W7  |
| NAV-02 | Item navigasi disaring sesuai matriks hak akses (Bagian 3.2).                                                          | Karyawan tidak melihat menu khusus pemilik.                                                                                  | W5      |
| NAV-03 | Topbar menampilkan nama pengguna, peran, dan chip status shift.                                                        | Contoh chip: "Shift Pagi aktif sejak 07.02". Mengetuk chip membuka /shift.                                                   | W4      |
| NAV-04 | Setiap halaman dimuat secara lazy dengan skeleton sebagai fallback.                                                    | Bundle awal tidak memuat Recharts, driver.js, dan react-markdown.                                                            | T1      |
| NAV-05 | Halaman 404 dan 403 berbahasa Indonesia dengan tombol kembali.                                                         | Rute tidak dikenal menampilkan 404.                                                                                          | W6      |
| NAV-06 | Seluruh halaman bebas scroll horizontal pada lebar 360 px. Tabel lebar berubah menjadi daftar kartu di bawah 768 px.   | Lulus uji lebar 360, 390, 768, 1024, dan 1280 px.                                                                            | W7      |

## 5.3 Beranda Pemilik

|        |                                                                                                                                                                                                   |                                                                                                                                   |         |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                                                     | **Kriteria penerimaan**                                                                                                           | **Ref** |
| BRD-01 | Beranda pemilik berisi kartu omzet hari berjalan, jumlah pesanan, shift aktif (nama, pembuka, jam buka), lima bahan dengan status terburuk, dan pintasan ke Rekap, Perkiraan Belanja, dan Dasbor. | Angka omzet diberi label "Sementara" selama hari belum ditutup. Setiap kartu memiliki keadaan loading, kosong, dan galat sendiri. | W4, W3  |

## 5.4 Buka Shift

|        |                                                                                                                                                                                      |                                                                                                                                                             |         |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                                        | **Kriteria penerimaan**                                                                                                                                     | **Ref** |
| SHF-01 | Halaman /shift menampilkan salah satu dari tiga keadaan: belum ada shift aktif, shift aktif dibuka oleh pengguna ini, atau shift aktif dibuka pengguna lain.                         | Keadaan ditentukan dari GET /shifts/active. Shift aktif menampilkan tombol ke PoS dan Tutup Shift.                                                          | W4      |
| SHF-02 | Form buka shift berisi pilihan nama shift (Pagi, Siang, Malam) dengan usulan dari server, tabel stok awal setiap bahan (hanya baca), sumber stok awal, dan kotak centang konfirmasi. | Sumber tertulis, misalnya "Diambil dari penutupan Shift Malam, 11 November 2026, oleh Rina". Tombol Buka Shift aktif hanya setelah kotak centang dicentang. | W4      |
| SHF-03 | Bila shift sebelumnya belum ditutup, pembukaan shift baru dicegah.                                                                                                                   | Respons 409 SHIFT\_STILL\_OPEN menampilkan pesan yang menyebut nama shift dan pembukanya.                                                                   | W4      |
| SHF-04 | Buka shift berhasil memperbarui status dan mengarahkan ke PoS.                                                                                                                       | Toast berhasil tampil dan chip status di topbar berubah tanpa memuat ulang halaman.                                                                         | W4, W6  |
| SHF-05 | Satu shift aktif dapat dipakai lebih dari satu karyawan. Setiap pesanan dan barang masuk mencatat pembuatnya.                                                                        | Karyawan kedua yang login saat shift aktif langsung diarahkan ke PoS.                                                                                       | W4      |

## 5.5 Pencatatan Pesanan (PoS)

|        |                                                                                                                                                               |                                                                                                                                                                                                                   |         |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                 | **Kriteria penerimaan**                                                                                                                                                                                           | **Ref** |
| POS-01 | Grid kartu menu aktif dengan tab kategori (Semua, Teh, Jasuke, Lainnya) dan kolom cari. Kartu memuat nama dan harga sesuai kanal terpilih.                    | Minimal 10 menu tampil dari data master. Pencarian menyaring menurut nama tanpa membedakan huruf besar dan kecil.                                                                                                 | W1, W2  |
| POS-02 | Pemilih kanal berupa segmented control (Toko, Shopee Food) di atas keranjang. Bawaan Toko.                                                                    | Mengganti kanal memperbarui harga satuan dan total di keranjang secara langsung.                                                                                                                                  | W1      |
| POS-03 | Mengetuk kartu menambah satu porsi. Keranjang menampilkan stepper jumlah (tombol kurang, input angka, tombol tambah), tombol hapus item, subtotal, dan total. | Menurunkan jumlah dari 1 menghapus item setelah konfirmasi singkat (inline, tanpa dialog).                                                                                                                        | W1      |
| POS-04 | Validasi jumlah: bilangan bulat 1 sampai 99.                                                                                                                  | Kosong, 0, negatif, dan desimal ditolak dengan pesan "Jumlah minimal 1 dan berupa bilangan bulat." Keranjang kosong membuat tombol Simpan nonaktif.                                                               | W1, T4  |
| POS-05 | Total dihitung otomatis: jumlah dari harga kanal dikali jumlah setiap item, dalam format Rupiah.                                                              | Total berubah setiap kali item, jumlah, atau kanal berubah. Riwayat memakai total dari respons server.                                                                                                            | W1      |
| POS-06 | Simpan pesanan mengirim clientRequestId (UUID v4) yang dibuat saat item pertama masuk keranjang.                                                              | Saat proses: tombol nonaktif dan toast "Memproses pesanan...". Berhasil: toast berisi nomor pesanan dan total, keranjang dikosongkan, kanal kembali ke Toko. Gagal: toast berisi alasan, keranjang dipertahankan. | W1, W6  |
| POS-07 | Menu dengan tersedia=false tampil redup dengan label "Bahan kurang" dan tidak dapat ditambahkan.                                                              | Respons 409 STOCK\_INSUFFICIENT menyebut bahan yang kurang dan menandai item terkait di keranjang.                                                                                                                | W3      |
| POS-08 | Penanda peringatan di kepala halaman PoS bila ada bahan hampir habis atau habis.                                                                              | Contoh: "2 bahan hampir habis", menautkan ke /stok?filter=hampir\_habis.                                                                                                                                          | W3      |
| POS-09 | Tata letak ponsel memakai bar ringkas keranjang di bawah layar yang membuka bottom sheet. Desktop memakai dua kolom dengan keranjang menempel di kanan.       | Bar ringkas menampilkan jumlah item dan total, misalnya "3 item, Rp36.000".                                                                                                                                       | W7      |
| POS-10 | Isi keranjang tersimpan di sessionStorage.                                                                                                                    | Keranjang tidak hilang saat berpindah halaman atau memuat ulang tab.                                                                                                                                              | W1      |
| POS-11 | PoS terkunci bila tidak ada shift aktif.                                                                                                                      | Halaman menampilkan keadaan kosong dengan tombol "Buka Shift".                                                                                                                                                    | W4      |

## 5.6 Riwayat Pesanan

|        |                                                                                                                |                                                                                               |         |
|--------|----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                  | **Kriteria penerimaan**                                                                       | **Ref** |
| ORD-01 | Halaman /pesanan. Karyawan melihat pesanan shift aktif. Pemilik dapat memilih tanggal dan shift.               | Filter pemilik tersimpan di query string agar dapat dibagikan dan bertahan saat dimuat ulang. | W1      |
| ORD-02 | Daftar berisi nomor, jam, badge kanal, ringkasan item, dan total. Urutan terbaru di atas, 20 data per halaman. | Di ponsel tampil sebagai kartu. Di desktop tampil sebagai tabel.                              | W1      |
| ORD-03 | Ringkasan di atas daftar: jumlah pesanan dan omzet per kanal untuk filter aktif.                               | Angka sama dengan jumlah total pada daftar.                                                   | W1      |
| ORD-04 | Detail pesanan dibuka dalam sheet berisi item, harga satuan, subtotal, pembuat, dan waktu.                     | Sheet dapat ditutup dengan tombol, sentuhan di luar, atau tombol Esc.                         | W1      |
| ORD-05 | Pesanan baru langsung muncul di riwayat tanpa muat ulang manual.                                               | Mutasi pesanan memicu invalidasi cache (Bagian 9.4).                                          | W1      |

## 5.7 Stok dan Barang Masuk

|        |                                                                                                                             |                                                                                                                                                    |         |
|--------|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                               | **Kriteria penerimaan**                                                                                                                            | **Ref** |
| STK-01 | Halaman /stok berisi daftar bahan dengan stok saat ini, satuan, stok minimum, dan badge status (Aman, Hampir habis, Habis). | Urutan bawaan: Habis, Hampir habis, lalu Aman. Angka memakai presisi satuan.                                                                       | W3      |
| STK-02 | Filter status dan pencarian nama, tersimpan di query string ?filter=.                                                       | Tautan dari PoS langsung menampilkan filter Hampir habis.                                                                                          | W3      |
| STK-03 | Detail bahan dalam sheet berisi riwayat mutasi tujuh hari terakhir: masuk, terpakai, penyesuaian, waktu, dan referensi.     | Mutasi terpakai menautkan ke nomor pesanan. Penyesuaian menautkan ke rekap shift.                                                                  | W3      |
| STK-04 | Ikon lonceng di topbar menampilkan jumlah bahan hampir habis dan habis.                                                     | Data diperbarui setiap 60 detik saat tab aktif dan setelah setiap mutasi.                                                                          | W3, W6  |
| STK-05 | Form /stok/barang-masuk dengan baris dinamis: bahan, jumlah, catatan opsional. Pengguna dapat menambah dan menghapus baris. | Bahan tidak boleh ganda dalam satu form. Jumlah wajib lebih dari 0 sesuai presisi satuan. Setiap baris menampilkan pratinjau "stok setelah masuk". | W3, T4  |
| STK-06 | Simpan barang masuk mengirim clientRequestId dan mengikuti pola notifikasi POS-06.                                          | Berhasil kembali ke /stok dengan angka terbaru dan badge status yang terbarui.                                                                     | W3, W6  |
| STK-07 | Kolom Risiko habis (Aman, Waspada, Kritis) dari model T13, aktif hanya bila VITE\_FLAG\_RISK\_MODEL=true.                   | Tooltip: "Perkiraan model, bukan stok aktual." Bila endpoint gagal, kolom disembunyikan dan daftar stok tetap tampil.                              | T13     |
| STK-08 | Tidak ada aksi ubah stok langsung. Perubahan hanya melalui pesanan, barang masuk, dan tutup shift.                          | Tidak ada tombol edit stok di halaman stok untuk peran apa pun.                                                                                    | W3      |

## 5.8 Tutup Shift dan Rekap Shift

|        |                                                                                                                                                                                                                                        |                                                                                                                   |         |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                                                                                          | **Kriteria penerimaan**                                                                                           | **Ref** |
| TUT-01 | Tutup shift berbentuk wizard tiga langkah dengan indikator progres: Ringkasan, Hitung Stok Fisik, Tinjau dan Konfirmasi.                                                                                                               | Pengguna dapat kembali ke langkah sebelumnya tanpa kehilangan isian.                                              | W4      |
| TUT-02 | Langkah Ringkasan menampilkan jumlah pesanan, omzet per kanal, dan daftar barang masuk selama shift.                                                                                                                                   | Data dari GET /shifts/:id/summary.                                                                                | W4      |
| TUT-03 | Langkah Hitung menampilkan setiap bahan dengan input stok fisik (inputMode="decimal"). Stok tercatat disembunyikan secara bawaan agar hitungan tidak terpengaruh angka sistem.                                                         | Semua bahan wajib diisi. Nilai negatif ditolak. Nilai 0 diterima. Presisi mengikuti satuan.                       | W4, T4  |
| TUT-04 | Isian hitung stok tersimpan sementara di sessionStorage dengan kunci per shiftId.                                                                                                                                                      | Isian kembali muncul setelah tab tertutup lalu dibuka ulang dalam sesi yang sama.                                 | W4      |
| TUT-05 | Langkah Tinjau menampilkan tabel bahan: tercatat, fisik, selisih bertanda (+/-), dan badge Sesuai, Selisih, atau Melewati toleransi. Catatan wajib untuk bahan yang melewati toleransi. Catatan shift opsional, maksimal 300 karakter. | Tombol Tutup Shift nonaktif selama ada catatan wajib yang kosong.                                                 | W4      |
| TUT-06 | Pratinjau selisih dihitung di klien. Nilai final memakai respons server setelah penutupan.                                                                                                                                             | Rumus klien: tercatat = awal + masuk - terpakai, selisih = fisik - tercatat.                                      | W4, W11 |
| TUT-07 | Dialog konfirmasi sebelum menutup shift.                                                                                                                                                                                               | Teks: "Tutup Shift Pagi? Shift yang sudah ditutup tidak dapat dibuka kembali." Berhasil diarahkan ke Rekap Shift. | W4      |
| TUT-08 | Halaman /shift/:id/rekap menampilkan ringkasan, tabel stok lengkap, dan catatan, dengan tombol Selesai dan Cetak.                                                                                                                      | Cetak memakai stylesheet print tanpa navigasi.                                                                    | W4      |
| TUT-09 | Penutupan Shift Malam dengan rekapHarianDibuat=true menampilkan informasi rekap harian sudah dibuat.                                                                                                                                   | Pemilik melihat tautan ke rekap harian tanggal tersebut. Karyawan hanya melihat informasi.                        | W4      |
| TUT-10 | Frontend mengukur durasi dari pembukaan langkah Ringkasan hingga konfirmasi, lalu mengirimnya sebagai durasiTutupDetik.                                                                                                                | Nilai tersimpan di server dan dapat dipakai untuk pengukuran durasi tutup shift saat demo.                        | W15     |

## 5.9 Rekap Harian

|        |                                                                                                                                                                                                                        |                                                                                         |         |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                                                                          | **Kriteria penerimaan**                                                                 | **Ref** |
| RKP-01 | Halaman /pemilik/rekap berisi daftar 30 tanggal terakhir dengan omzet, jumlah pesanan, status (Lengkap, Belum lengkap), dan jumlah bahan berselisih. Date picker untuk melompat ke tanggal tertentu.                   | Status Belum lengkap berarti belum semua shift ditutup.                                 | W4      |
| RKP-02 | Halaman /pemilik/rekap/:tanggal berisi kartu omzet total dan per kanal, tabel rekap per shift, tabel menu terjual, tabel stok harian (awal hari, masuk, terpakai, fisik akhir, total selisih), dan catatan tiap shift. | Baris yang melewati toleransi disorot merah. Angka sama dengan rekap shift penyusunnya. | W4, W10 |
| RKP-03 | Tanggal tanpa data menampilkan keadaan kosong. Rekap hari berjalan diberi label sementara.                                                                                                                             | Label: "Sementara, belum semua shift ditutup."                                          | W4      |
| RKP-04 | Cetak rekap harian melalui stylesheet print. (Opsional)                                                                                                                                                                | Hasil cetak muat di kertas A4 potret tanpa terpotong.                                   | W4      |

## 5.10 Data Master Menu, Bahan Baku, dan Takaran

|        |                                                                                                                                                                                                                          |                                                                                                                                                |         |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                                                                            | **Kriteria penerimaan**                                                                                                                        | **Ref** |
| MST-01 | Halaman /pemilik/master/menu berisi tabel menu: nama, kategori, harga Toko, harga Shopee Food, jumlah bahan dalam takaran, sumber takaran, dan status aktif.                                                             | Minimal 10 menu tampil dari data awal. Pencarian dan filter kategori tersedia.                                                                 | W2      |
| MST-02 | Form tambah dan ubah menu dalam sheet: nama, kategori, harga Toko, harga Shopee Food (opsional), status aktif, sumber takaran (Konfirmasi PIC atau Asumsi), dan takaran berupa baris dinamis bahan dan jumlah per porsi. | Nama wajib, maksimal 60 karakter, unik. Harga bilangan bulat lebih dari 0. Takaran minimal satu bahan, tanpa bahan ganda, jumlah lebih dari 0. | W2, T4  |
| MST-03 | Menu bersumber takaran Asumsi diberi badge "Asumsi" di tabel master.                                                                                                                                                     | Badge sesuai ketentuan W2 bahwa takaran tanpa konfirmasi PIC diberi label asumsi.                                                              | W2      |
| MST-04 | Hapus menu berarti menonaktifkan, dengan dialog konfirmasi.                                                                                                                                                              | Menu nonaktif hilang dari PoS dan tetap tampil di riwayat pesanan lama.                                                                        | W2      |
| MST-05 | Halaman /pemilik/master/bahan berisi tabel bahan. Form berisi nama, satuan (gram, kg, ml, liter, pcs), presisi desimal, stok minimum, toleransi selisih, dan stok awal (hanya saat membuat).                             | Stok minimum dan toleransi bernilai 0 atau lebih. Stok awal tidak dapat diubah setelah bahan dibuat.                                           | W2, W3  |
| MST-06 | Bahan yang masih dipakai dalam takaran menu aktif tidak dapat dinonaktifkan.                                                                                                                                             | Respons 409 INGREDIENT\_IN\_USE menampilkan daftar menu terkait.                                                                               | W2      |
| MST-07 | Perubahan master langsung tercermin di PoS dan halaman stok.                                                                                                                                                             | Mutasi master memicu invalidasi cache menu dan bahan.                                                                                          | W2      |

## 5.11 Perkiraan Belanja

|        |                                                                                                                                                                                  |                                                                                                                                          |          |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------|
| **ID** | **Kebutuhan**                                                                                                                                                                    | **Kriteria penerimaan**                                                                                                                  | **Ref**  |
| FC-01  | Halaman /pemilik/perkiraan-belanja dengan judul tanggal sasaran, versi model, dan waktu pembuatan perkiraan.                                                                     | Contoh judul: "Perkiraan kebutuhan bahan untuk Jumat, 13 November 2026".                                                                 | W12, W13 |
| FC-02  | Tabel bahan, perkiraan kebutuhan, stok saat ini, saran beli, dan satuan, diurutkan dari saran beli terbesar.                                                                     | Saran beli memakai nilai server. Bila kosong, klien menghitung maks(0, kebutuhan - stok). Bahan dengan saran beli lebih dari 0 ditandai. | W12      |
| FC-03  | Grafik garis pemakaian aktual 14 hari terakhir dan titik perkiraan besok untuk bahan yang dipilih melalui dropdown.                                                              | Titik perkiraan dibedakan dengan garis putus-putus dan legenda.                                                                          | W12, W10 |
| FC-04  | Panel Evaluasi Model berisi tabel perbandingan baseline moving average dan minimal dua konfigurasi model (MAE, RMSE) serta tabel dampak fitur lag, hari dalam minggu, dan kanal. | Model terbaik disorot. Teks penjelas: "Semakin kecil MAE dan RMSE, semakin dekat perkiraan dengan data sebenarnya."                      | W12, T8  |
| FC-05  | Banner keterangan bila sumberData bukan asli.                                                                                                                                    | Teks: "Perkiraan ini dilatih memakai data simulasi. Gunakan sebagai gambaran, bukan patokan pasti."                                      | W10, W9  |
| FC-06  | Kegagalan layanan AI menampilkan kartu "Perkiraan belum bisa dimuat" dengan tombol Coba lagi.                                                                                    | Kartu menyebut bahwa pencatatan pesanan dan stok tetap berjalan. Navigasi lain tidak terhambat.                                          | T4       |
| FC-07  | Frontend hanya memanggil backend Express. Tidak ada panggilan langsung ke FastAPI.                                                                                               | Tidak ada URL layanan AI di bundle frontend.                                                                                             | T3       |

## 5.12 Dasbor Streamlit Tertanam

|        |                                                                                                                         |                                                                                                                                 |         |
|--------|-------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                           | **Kriteria penerimaan**                                                                                                         | **Ref** |
| DSB-01 | Halaman /pemilik/dasbor menanam dasbor Streamlit melalui iframe dari VITE\_DASHBOARD\_URL dengan parameter ?embed=true. | Iframe memenuhi lebar konten dengan tinggi responsif. Filter tanggal dan shift berjalan di dalam dasbor.                        | T6      |
| DSB-02 | Overlay loading dengan pesan cold start sampai event onLoad iframe.                                                     | Teks: "Dasbor sedang dinyalakan, biasanya kurang dari 1 menit." Setelah 90 detik tampil tombol Muat ulang dan Buka di tab baru. | T6, T4  |
| DSB-03 | Label "Data simulasi" di kepala halaman bila dasbor memakai data simulasi.                                              | Label tampil berdasarkan konfigurasi VITE\_DASHBOARD\_SIMULASI.                                                                 | T6, W9  |
| DSB-04 | Di bawah 768 px tampil saran memutar layar atau membuka di tab baru.                                                    | Halaman induk tetap bebas scroll horizontal.                                                                                    | T6, W7  |
| DSB-05 | Menu dasbor disembunyikan bila URL kosong atau VITE\_FLAG\_DASHBOARD=false.                                             | Tidak ada tautan mati di navigasi.                                                                                              | T6      |

## 5.13 Asisten Toko

|        |                                                                                                                                                   |                                                                                   |         |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                     | **Kriteria penerimaan**                                                           | **Ref** |
| AST-01 | Halaman /asisten untuk kedua peran. Desktop dapat memakai tombol mengambang yang membuka panel samping. (Panel samping opsional)                  | Ponsel selalu memakai halaman penuh.                                              | W14     |
| AST-02 | Layar awal berisi sapaan singkat, penjelasan cakupan, dan empat contoh pertanyaan yang dapat diketuk.                                             | Cakupan: "Saya menjawab pertanyaan seputar SOP, stok, dan penjualan toko."        | W14, W6 |
| AST-03 | Input berupa textarea yang membesar otomatis, maksimal 500 karakter dengan penghitung. Enter mengirim di desktop, Shift+Enter membuat baris baru. | Input kosong atau berisi spasi saja ditolak dan tombol kirim nonaktif.            | W14, T4 |
| AST-04 | Indikator mengetik selama menunggu jawaban. Batas waktu 30 detik.                                                                                 | Melewati batas waktu menampilkan pesan gagal di thread dengan tombol Kirim ulang. | W14, T4 |
| AST-05 | Jawaban dirender sebagai Markdown terbatas (paragraf, daftar, tebal) tanpa HTML mentah. Sumber SOP tampil sebagai chip di bawah jawaban.          | Contoh chip: "SOP Penutupan Shift, bagian 3".                                     | T10     |
| AST-06 | Penolakan di luar konteks (ditolak=true) tampil sebagai jawaban biasa dengan ikon informasi.                                                      | Tidak memakai gaya galat merah.                                                   | T11     |
| AST-07 | Jawaban dari model cadangan (model bernilai lokal atau template) diberi label kecil.                                                              | Label: "Dijawab oleh model cadangan".                                             | T14     |
| AST-08 | Riwayat percakapan dimuat dari server (50 pesan terakhir). Tombol Percakapan baru membuka sesi baru.                                              | Riwayat bertahan setelah logout dan login kembali.                                | W14, T2 |
| AST-09 | Kegagalan chatbot ditampilkan sebagai pesan ramah di thread. Respons 429 menampilkan pesan tunggu.                                                | Fitur lain tetap berfungsi normal saat chatbot gagal.                             | T4      |
| AST-10 | Di lingkungan non-produksi, setiap jawaban menampilkan label intent dan latensi.                                                                  | Membantu pengujian klasifikasi intent dan guardrails.                             | T9, T11 |

## 5.14 Onboarding, Bantuan, dan Notifikasi

|        |                                                                                                                                                                             |                                                                                                                  |         |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                                                                                               | **Kriteria penerimaan**                                                                                          | **Ref** |
| ONB-01 | Tur singkat saat login pertama sesuai peran. Karyawan: chip shift, PoS, kanal dan keranjang, stok, tutup shift. Pemilik: beranda, rekap, master, perkiraan belanja, dasbor. | Tur dapat dilewati. Status selesai tersimpan per userId di localStorage. Tur dapat diulang dari halaman Bantuan. | W6      |
| ONB-02 | Ikon bantuan (?) dengan tooltip pada istilah: takaran, stok minimum, stok tercatat, stok fisik, selisih, toleransi, MAE, dan RMSE.                                          | Tooltip dapat dibuka dengan sentuhan di ponsel dan fokus keyboard di desktop.                                    | W6      |
| ONB-03 | Halaman /bantuan berisi panduan langkah per alur, FAQ, dan tautan unduh Buku Panduan Pengguna dari VITE\_USER\_MANUAL\_URL.                                                 | Panduan memuat alur buka shift, catat pesanan, barang masuk, dan tutup shift.                                    | W6, W16 |
| ONB-04 | Toast konsisten untuk tiga status: diproses, berhasil, gagal.                                                                                                               | Berhasil hilang setelah 4 detik. Gagal bertahan sampai ditutup dan memuat alasan serta langkah perbaikan.        | W1, W6  |
| ONB-05 | Keadaan kosong di setiap daftar dengan penjelasan dan aksi berikutnya.                                                                                                      | Contoh: "Belum ada pesanan di shift ini. Mulai dari halaman PoS."                                                | W6      |

## 5.15 Penanganan Galat dan Degradasi

|        |                                                                                                            |                                                                                                              |         |
|--------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|---------|
| **ID** | **Kebutuhan**                                                                                              | **Kriteria penerimaan**                                                                                      | **Ref** |
| ERR-01 | Error boundary per halaman dan per widget AI.                                                              | Galat satu widget tidak menjatuhkan halaman lain.                                                            | T4      |
| ERR-02 | Ping GET /health saat aplikasi dibuka. Banner cold start bila permintaan berjalan lebih dari 5 detik.      | Teks: "Server sedang dinyalakan, mohon tunggu hingga 1 menit." Banner hilang otomatis saat respons diterima. | T4, W7  |
| ERR-03 | Banner luring dari event online dan offline. Tombol simpan nonaktif selama luring.                         | Teks: "Koneksi terputus. Data belum bisa disimpan."                                                          | T4      |
| ERR-04 | Pemetaan kode galat ke pesan dan perilaku sesuai Bagian 8.3.                                               | Tidak ada pesan galat mentah dari server atau stack trace yang tampil ke pengguna.                           | T4      |
| ERR-05 | Skema validasi klien meniru aturan Joi backend. Galat per field dari server dipasang ke field yang sesuai. | Field yang salah diberi garis merah dan pesan di bawahnya.                                                   | T4      |
| ERR-06 | Permintaan GET diulang otomatis dua kali dengan jeda bertahap. Mutasi tidak diulang otomatis.              | Mencegah pesanan ganda akibat pengulangan otomatis.                                                          | T4      |

# 6. Spesifikasi Rute dan Halaman

|                            |                                |           |                             |                                                               |
|----------------------------|--------------------------------|-----------|-----------------------------|---------------------------------------------------------------|
| **Path**                   | **Halaman**                    | **Peran** | **Penjaga**                 | **Komponen utama**                                            |
| /login                     | Login                          | Publik    | Alihkan bila sudah login    | LoginForm, DemoAccountInfo                                    |
| /                          | Pengalihan                     | Semua     | RequireAuth                 | RoleRedirect                                                  |
| /shift                     | Status dan buka shift          | K, P      | RequireAuth                 | ShiftStatusCard, OpenShiftForm, OpeningStockTable             |
| /pos                       | PoS                            | K, P      | RequireActiveShift          | MenuGrid, ChannelToggle, CartPanel, CartSheet, LowStockBadge  |
| /pesanan                   | Riwayat pesanan                | K, P      | RequireAuth                 | OrderFilters, OrderSummary, OrderList, OrderDetailSheet       |
| /stok                      | Stok bahan                     | K, P      | RequireAuth                 | StockFilters, StockList, StockDetailSheet, RiskBadge          |
| /stok/barang-masuk         | Barang masuk                   | K, P      | RequireActiveShift          | StockInForm, StockInRow                                       |
| /shift/tutup               | Tutup shift                    | K, P      | RequireActiveShift          | CloseShiftWizard, SummaryStep, CountStep, ReviewStep          |
| /shift/:id/rekap           | Rekap shift                    | K, P      | RequireAuth                 | ShiftRecapView, PrintButton                                   |
| /asisten                   | Asisten Toko                   | K, P      | RequireAuth                 | ChatThread, ChatInput, SuggestionChips, SourceChips           |
| /bantuan                   | Bantuan                        | K, P      | RequireAuth                 | GuideAccordion, FaqList, ManualDownload                       |
| /pemilik/beranda           | Beranda pemilik                | P         | RequireRole(pemilik)        | StatCard, ActiveShiftCard, LowStockCard, Shortcuts            |
| /pemilik/rekap             | Daftar rekap harian            | P         | RequireRole(pemilik)        | RecapDateList, DatePicker                                     |
| /pemilik/rekap/:tanggal    | Detail rekap harian            | P         | RequireRole(pemilik)        | RevenueCards, ShiftRecapTable, MenuSoldTable, DailyStockTable |
| /pemilik/perkiraan-belanja | Perkiraan belanja              | P         | RequireRole(pemilik)        | ForecastTable, UsageChart, ModelMetricsPanel, SimulasiBanner  |
| /pemilik/dasbor            | Dasbor                         | P         | RequireRole(pemilik) + flag | DashboardFrame, ColdStartOverlay                              |
| /pemilik/master/menu       | Master menu                    | P         | RequireRole(pemilik)        | MenuTable, MenuFormSheet, RecipeFieldArray                    |
| /pemilik/master/bahan      | Master bahan                   | P         | RequireRole(pemilik)        | IngredientTable, IngredientFormSheet                          |
| /403, \*                   | Akses ditolak, tidak ditemukan | Semua     | Tidak ada                   | ForbiddenPage, NotFoundPage                                   |

K berarti karyawan dan P berarti pemilik. RequireActiveShift mengarahkan ke /shift dengan pesan bila tidak ada shift aktif.

# 7. Model Data Frontend

Tipe berikut menjadi acuan bentuk data di frontend dan bahan penyusunan skema OpenAPI. Penamaan field memakai camelCase Bahasa Indonesia agar sejalan dengan istilah domain. Bila tim memakai JavaScript, tipe ini tetap berlaku sebagai dokumentasi bentuk data melalui JSDoc.

> type Peran = 'karyawan' \| 'pemilik';
>
> type Kanal = 'toko' \| 'shopee\_food';
>
> type NamaShift = 'pagi' \| 'siang' \| 'malam';
>
> type StatusStok = 'aman' \| 'hampir\_habis' \| 'habis';
>
> interface Pengguna { id: string; nama: string; username: string; peran: Peran; }
>
> interface Bahan {
>
> id: string; nama: string; satuan: 'gram' \| 'kg' \| 'ml' \| 'liter' \| 'pcs';
>
> presisi: 0 \| 1 \| 2; // jumlah digit desimal input
>
> stokSaatIni: number; stokMinimum: number; toleransiSelisih: number;
>
> status: StatusStok; aktif: boolean;
>
> }
>
> interface TakaranItem { bahanId: string; namaBahan: string; satuan: string; jumlahPerPorsi: number; }
>
> interface Menu {
>
> id: string; nama: string; kategori: 'teh' \| 'jasuke' \| 'lainnya';
>
> harga: { toko: number; shopee\_food: number \| null }; // null = pakai harga toko
>
> aktif: boolean; sumberTakaran: 'pic' \| 'asumsi';
>
> takaran: TakaranItem\[\];
>
> tersedia: boolean; // false bila bahan tidak cukup untuk 1 porsi
>
> }
>
> interface BuatPesananInput {
>
> clientRequestId: string; kanal: Kanal;
>
> items: { menuId: string; jumlah: number }\[\];
>
> }
>
> interface Pesanan {
>
> id: string; nomor: string; shiftId: string; kanal: Kanal;
>
> items: { menuId: string; namaMenu: string; jumlah: number; hargaSatuan: number; subtotal: number }\[\];
>
> total: number; dibuatOleh: { id: string; nama: string }; dibuatPada: string; // ISO 8601
>
> }
>
> interface BarangMasukInput {
>
> clientRequestId: string;
>
> items: { bahanId: string; jumlah: number; catatan?: string }\[\];
>
> }
>
> interface MutasiStok {
>
> id: string; bahanId: string; jenis: 'masuk' \| 'terpakai' \| 'penyesuaian';
>
> jumlah: number; referensi?: { tipe: 'pesanan' \| 'shift' \| 'barang\_masuk'; id: string; label: string };
>
> waktu: string;
>
> }
>
> interface Shift {
>
> id: string; tanggal: string; // YYYY-MM-DD, zona Asia/Jakarta
>
> nama: NamaShift; status: 'aktif' \| 'ditutup';
>
> dibukaOleh: { id: string; nama: string }; dibukaPada: string; ditutupPada?: string;
>
> }
>
> interface PratinjauBukaShift {
>
> namaShiftUsulan: NamaShift;
>
> sumber: { shiftId: string; nama: NamaShift; tanggal: string; ditutupOleh: string } \| null;
>
> stokAwal: { bahanId: string; namaBahan: string; satuan: string; jumlah: number }\[\];
>
> }
>
> interface TutupShiftInput {
>
> stokFisik: { bahanId: string; jumlah: number; catatan?: string }\[\];
>
> catatanShift?: string; durasiTutupDetik: number;
>
> }
>
> interface BarisStokShift {
>
> bahanId: string; namaBahan: string; satuan: string;
>
> awal: number; masuk: number; terpakai: number; tercatat: number;
>
> fisik: number \| null; selisih: number \| null; toleransi: number;
>
> melewatiToleransi: boolean; catatan?: string;
>
> }
>
> interface RekapShift {
>
> shiftId: string; nama: NamaShift; tanggal: string;
>
> jumlahPesanan: number; omzet: number; omzetPerKanal: Record&lt;Kanal, number&gt;;
>
> stok: BarisStokShift\[\]; catatanShift?: string; rekapHarianDibuat: boolean;
>
> }
>
> interface RekapHarian {
>
> tanggal: string; status: 'lengkap' \| 'belum\_lengkap';
>
> omzet: number; omzetPerKanal: Record&lt;Kanal, number&gt;; jumlahPesanan: number;
>
> perShift: RekapShift\[\];
>
> menuTerjual: { menuId: string; namaMenu: string; jumlah: number; omzet: number }\[\];
>
> stokHarian: { bahanId: string; namaBahan: string; satuan: string;
>
> awalHari: number; masuk: number; terpakai: number; fisikAkhir: number; totalSelisih: number }\[\];
>
> }
>
> interface Perkiraan {
>
> untukTanggal: string; versiModel: string; dibuatPada: string;
>
> sumberData: 'asli' \| 'simulasi' \| 'campuran';
>
> items: { bahanId: string; namaBahan: string; satuan: string;
>
> perkiraanKebutuhan: number; stokSaatIni: number; saranBeli: number \| null }\[\];
>
> }
>
> interface MetrikModel { nama: string; konfigurasi: string; mae: number; rmse: number; terbaik: boolean; }
>
> interface DampakFitur { fitur: 'lag' \| 'hari\_dalam\_minggu' \| 'kanal';
>
> maeTanpa: number; maeDengan: number; rmseTanpa: number; rmseDengan: number; }
>
> interface RisikoStok { bahanId: string; risiko: 'aman' \| 'waspada' \| 'kritis'; skor?: number; }
>
> interface PesanChat {
>
> id: string; sesiId: string; peran: 'pengguna' \| 'asisten'; isi: string; waktu: string;
>
> intent?: string; sumber?: { judul: string; bagian?: string }\[\];
>
> model?: 'gemini' \| 'lokal' \| 'template'; ditolak?: boolean; latensiMs?: number;
>
> }

## 7.1 Aturan Turunan di Klien

|                       |                                                                                                               |                |
|-----------------------|---------------------------------------------------------------------------------------------------------------|----------------|
| **Nilai**             | **Rumus atau aturan**                                                                                         | **Dipakai di** |
| Total keranjang       | Jumlah dari (harga\[kanal\] ?? harga.toko) x jumlah untuk setiap item                                         | POS-05         |
| Status stok           | habis bila stok &lt;= 0; hampir\_habis bila stok &lt;= stokMinimum; selain itu aman (nilai server diutamakan) | STK-01, POS-08 |
| Stok tercatat         | awal + masuk - terpakai                                                                                       | TUT-06         |
| Selisih               | fisik - tercatat                                                                                              | TUT-05, TUT-06 |
| Melewati toleransi    | \|selisih\| &gt; toleransiSelisih                                                                             | TUT-05         |
| Saran beli (cadangan) | maks(0, perkiraanKebutuhan - stokSaatIni)                                                                     | FC-02          |
| Pembulatan tampilan   | Mengikuti presisi bahan; Rupiah tanpa desimal                                                                 | Semua halaman  |

Aturan ini ditempatkan pada modul utilitas murni (lib/calc.ts) supaya dapat diuji unit dan dipakai ulang. Server tetap menjadi sumber angka final.

# 8. Kontrak API yang Dibutuhkan Frontend

Daftar berikut adalah usulan frontend untuk dibahas pada penyusunan OpenAPI (T5). Seluruh path berawalan /api/v1 pada backend Express. Kontrak final yang disepakati menggantikan daftar ini, lalu handler mock disesuaikan.

## 8.1 Format Respons

> // Berhasil
>
> { "status": "success", "message": "Pesanan tersimpan", "data": { ... } }
>
> // Gagal karena input atau aturan bisnis
>
> { "status": "fail", "code": "VALIDATION\_ERROR", "message": "Data pesanan tidak valid",
>
> "errors": \[ { "field": "items.0.jumlah", "message": "Jumlah minimal 1" } \] }
>
> // Galat server
>
> { "status": "error", "code": "INTERNAL\_ERROR", "message": "Terjadi kesalahan pada server" }
>
> // Daftar berhalaman
>
> { "status": "success", "data": { "items": \[ ... \], "page": 1, "limit": 20, "total": 134 } }

## 8.2 Daftar Endpoint

|                                         |           |                                    |                                                          |
|-----------------------------------------|-----------|------------------------------------|----------------------------------------------------------|
| **Method dan path**                     | **Peran** | **Masukan**                        | **Data respons**                                         |
| POST /auth/login                        | Publik    | { username, password }             | { accessToken, pengguna }                                |
| GET /auth/me                            | K, P      | Tidak ada                          | Pengguna                                                 |
| POST /auth/logout                       | K, P      | Tidak ada                          | Tidak ada                                                |
| GET /health                             | Publik    | Tidak ada                          | { ok: true }                                             |
| GET /menus                              | K, P      | ?aktif=true                        | Menu\[\]                                                 |
| POST /menus, PUT /menus/:id             | P         | Menu tanpa id dan tersedia         | Menu                                                     |
| PATCH /menus/:id/status                 | P         | { aktif }                          | Menu                                                     |
| GET /ingredients                        | K, P      | ?status=                           | Bahan\[\]                                                |
| POST /ingredients, PUT /ingredients/:id | P         | Bahan (+ stokAwal saat POST)       | Bahan                                                    |
| PATCH /ingredients/:id/status           | P         | { aktif }                          | Bahan                                                    |
| GET /ingredients/:id/movements          | K, P      | ?from&to                           | MutasiStok\[\]                                           |
| GET /stock/risk                         | K, P      | Tidak ada (flag T13)               | RisikoStok\[\]                                           |
| POST /stock-in                          | K, P (S)  | BarangMasukInput                   | MutasiStok\[\]                                           |
| GET /shifts/active                      | K, P      | Tidak ada                          | Shift atau null                                          |
| GET /shifts/opening-preview             | K, P      | Tidak ada                          | PratinjauBukaShift                                       |
| POST /shifts/open                       | K, P      | { nama, konfirmasiStokAwal: true } | Shift                                                    |
| GET /shifts/:id/summary                 | K, P      | Tidak ada                          | RekapShift (fisik dan selisih null)                      |
| POST /shifts/:id/close                  | K, P (S)  | TutupShiftInput                    | RekapShift                                               |
| GET /shifts/:id/recap                   | K, P      | Tidak ada                          | RekapShift                                               |
| POST /orders                            | K, P (S)  | BuatPesananInput                   | Pesanan                                                  |
| GET /orders                             | K, P      | ?shiftId&tanggal&page&limit        | Daftar berhalaman Pesanan                                |
| GET /orders/:id                         | K, P      | Tidak ada                          | Pesanan                                                  |
| GET /recaps/daily                       | P         | ?from&to                           | Ringkasan RekapHarian\[\]                                |
| GET /recaps/daily/:tanggal              | P         | Tidak ada                          | RekapHarian                                              |
| GET /forecast                           | P         | ?tanggal (bawaan besok)            | Perkiraan                                                |
| GET /forecast/history                   | P         | ?bahanId&hari=14                   | { tanggal, aktual }\[\]                                  |
| GET /forecast/metrics                   | P         | Tidak ada                          | { model: MetrikModel\[\], dampakFitur: DampakFitur\[\] } |
| POST /chat                              | K, P      | { pesan, sesiId? }                 | PesanChat (jawaban asisten)                              |
| GET /chat/history                       | K, P      | ?sesiId&limit=50                   | PesanChat\[\]                                            |

Endpoint /forecast\*, /stock/risk, dan /chat\* diteruskan backend ke layanan FastAPI dengan validasi token (W13, T3). Frontend tidak mengetahui alamat layanan AI.

## 8.3 Pemetaan Galat

|               |                                  |                                                                           |
|---------------|----------------------------------|---------------------------------------------------------------------------|
| **HTTP**      | **Kode**                         | **Perilaku frontend**                                                     |
| 400           | VALIDATION\_ERROR                | Pasang errors\[\] ke field terkait dan tampilkan toast ringkas.           |
| 401           | UNAUTHORIZED, TOKEN\_EXPIRED     | Hapus sesi dan cache, arahkan ke /login dengan pesan sesi berakhir.       |
| 403           | FORBIDDEN                        | Navigasi menampilkan halaman 403. Mutasi menampilkan toast akses ditolak. |
| 404           | NOT\_FOUND                       | Tampilkan keadaan kosong atau halaman 404.                                |
| 409           | SHIFT\_STILL\_OPEN               | Pesan yang menyebut nama shift dan pembukanya (SHF-03).                   |
| 409           | NO\_ACTIVE\_SHIFT                | Arahkan ke /shift dengan pesan buka shift dulu.                           |
| 409           | STOCK\_INSUFFICIENT              | Sebut bahan yang kurang dan tandai item di keranjang (POS-07).            |
| 409           | DUPLICATE\_REQUEST               | Anggap berhasil dan pakai data dari respons. Tidak menampilkan galat.     |
| 409           | NAME\_TAKEN, INGREDIENT\_IN\_USE | Pesan pada field nama atau daftar menu terkait (MST-02, MST-06).          |
| 429           | RATE\_LIMITED                    | "Terlalu banyak permintaan, coba lagi sebentar lagi."                     |
| 502, 503, 504 | AI\_UNAVAILABLE                  | Kartu galat ramah di widget AI saja (FC-06, AST-09, STK-07).              |
| 500           | INTERNAL\_ERROR                  | Pesan umum. Tampilkan requestId bila ada untuk pelaporan bug.             |
| Tanpa respons | Timeout atau jaringan            | Banner cold start atau luring (ERR-02, ERR-03).                           |

# 9. Arsitektur Frontend

## 9.1 Teknologi dan Pustaka

|                       |                                                     |                                                                                      |
|-----------------------|-----------------------------------------------------|--------------------------------------------------------------------------------------|
| **Kebutuhan**         | **Pustaka**                                         | **Alasan**                                                                           |
| Kerangka UI dan build | React (versi stabil yang didukung shadcn/ui) + Vite | Ditetapkan di Project Plan (T1).                                                     |
| Gaya dan komponen     | Tailwind CSS + shadcn/ui + lucide-react             | Ditetapkan di Project Plan. Komponen dapat diubah karena kodenya ada di repositori.  |
| Bahasa                | TypeScript (disarankan)                             | Tipe pada Bagian 7 langsung dipakai dan mengurangi salah bentuk data saat integrasi. |
| Routing               | React Router (data router)                          | Mendukung lazy route, loader penjaga, dan query string untuk filter.                 |
| HTTP                  | Axios dengan satu instance terpusat                 | Ditetapkan di T1. Interceptor untuk token, 401, timeout, dan deteksi cold start.     |
| State server          | TanStack Query                                      | Cache, retry GET, invalidasi setelah mutasi, refetch berkala untuk stok.             |
| State klien           | Zustand (dengan persist)                            | Sesi, keranjang PoS, dan isian tutup shift.                                          |
| Form dan validasi     | React Hook Form + Zod                               | Field array untuk takaran, barang masuk, dan stok fisik. Skema meniru aturan Joi.    |
| Notifikasi            | Sonner (komponen toast shadcn/ui)                   | Mendukung status diproses, berhasil, gagal dalam satu toast.                         |
| Grafik                | Recharts                                            | Grafik pemakaian dan perkiraan pada Perkiraan Belanja.                               |
| Onboarding            | driver.js                                           | Ringan dan tidak bergantung pada React.                                              |
| Render jawaban chat   | react-markdown tanpa rehype-raw                     | Mencegah HTML mentah dari jawaban model.                                             |
| Tanggal               | date-fns + locale id                                | Format tanggal Indonesia dan zona Asia/Jakarta.                                      |
| Mock API              | Mock Service Worker (MSW)                           | Memungkinkan seluruh UI dibangun sebelum backend siap.                               |
| Pengujian             | Vitest + React Testing Library + Playwright         | Unit, komponen, dan end-to-end.                                                      |
| Kualitas kode         | ESLint + Prettier                                   | Konsistensi gaya antar anggota tim.                                                  |

## 9.2 Struktur Folder

> frontend/
>
> public/ favicon, manifest, mockServiceWorker.js
>
> src/
>
> app/ App.tsx, router.tsx, providers.tsx
>
> lib/ axios.ts, query-client.ts, env.ts, flags.ts, calc.ts, format.ts, uuid.ts
>
> api/ query-keys.ts, auth.ts, menus.ts, ingredients.ts, stock.ts,
>
> shifts.ts, orders.ts, recaps.ts, forecast.ts, chat.ts
>
> types/ domain.ts, api.ts
>
> schemas/ login.ts, order.ts, stock-in.ts, close-shift.ts, menu.ts,
>
> ingredient.ts, chat.ts
>
> stores/ auth-store.ts, cart-store.ts, close-shift-store.ts
>
> mocks/ browser.ts, db.ts, handlers/\*.ts, fixtures/\*.json
>
> components/
>
> ui/ komponen shadcn/ui
>
> layout/ AppShell, Sidebar, BottomNav, Topbar, PageHeader, MoreSheet
>
> guards/ RequireAuth, RequireRole, RequireActiveShift
>
> feedback/ EmptyState, ErrorState, PageSkeleton, ColdStartBanner,
>
> OfflineBanner, AiUnavailableCard, ErrorBoundary
>
> shared/ StatusBadge, SelisihBadge, Rupiah, QuantityStepper, ConfirmDialog,
>
> HelpTooltip, SimulasiBanner, DataTable, ResponsiveList
>
> features/
>
> auth/ shift/ pos/ orders/ stock/ recap/ master/
>
> forecast/ dashboard/ assistant/ onboarding/ help/ owner-home/
>
> styles/ globals.css, print.css
>
> tests/
>
> unit/ e2e/
>
> .env.example vercel.json README.md

Setiap folder features/&lt;modul&gt; berisi halaman, komponen khusus modul, dan hook query modul tersebut. Komponen yang dipakai lebih dari satu modul dipindah ke components/shared.

## 9.3 Pengelolaan State

-   **Data server** (menu, bahan, pesanan, shift, rekap, perkiraan, chat) dikelola TanStack Query. Komponen tidak menyimpan salinan data server di state lokal.

-   **Sesi** (token dan profil) disimpan di Zustand dengan persist localStorage. Saat aplikasi dibuka, GET /auth/me memvalidasi token.

-   **Keranjang PoS** disimpan di Zustand dengan persist sessionStorage, termasuk clientRequestId dan kanal.

-   **Isian tutup shift** disimpan di Zustand dengan persist sessionStorage berkunci shiftId, beserta waktu mulai untuk durasiTutupDetik.

-   **Filter halaman** (tanggal, shift, status) disimpan di query string agar dapat dibagikan dan bertahan saat dimuat ulang.

## 9.4 Lapisan HTTP dan Cache

Instance Axios di lib/axios.ts memakai baseURL dari VITE\_API\_BASE\_URL, timeout bawaan 30 detik, dan timeout 75 detik untuk ping /health. Interceptor permintaan menyisipkan header Authorization: Bearer &lt;token&gt;. Interceptor respons membuka envelope data, memetakan galat ke objek ApiError { status, code, message, fieldErrors }, menangani 401 secara terpusat, dan memberi sinyal ke store UI bila permintaan berjalan lebih dari 5 detik.

|                   |                                                                                 |
|-------------------|---------------------------------------------------------------------------------|
| **Mutasi**        | **Query yang diinvalidasi**                                                     |
| Buat pesanan      | orders (shift aktif), ingredients, menus (tersedia), shifts.summary, owner-home |
| Barang masuk      | ingredients, ingredients.movements, menus (tersedia), shifts.summary            |
| Buka shift        | shifts.active, shifts.opening-preview, owner-home                               |
| Tutup shift       | shifts.active, ingredients, recaps, owner-home                                  |
| Ubah master menu  | menus                                                                           |
| Ubah master bahan | ingredients, menus                                                              |
| Kirim chat        | chat.history (sesi aktif), ditambahkan secara optimistis untuk pesan pengguna   |

Kunci query dikumpulkan di api/query-keys.ts agar invalidasi tidak bergantung pada string yang tersebar.

## 9.5 Pengembangan dengan Mock

MSW aktif bila VITE\_USE\_MOCK=true. Handler mock meniru seluruh endpoint pada Bagian 8.2, termasuk aturan bisnis utama (pemotongan stok sesuai takaran, penolakan stok kurang, penolakan shift ganda, perhitungan selisih, pembuatan rekap harian setelah Shift Malam) di atas basis data dalam memori (mocks/db.ts). Fixture awal memakai dataset CSV bersih dari tim DS (W11) setelah tersedia. Sebelum itu fixture memakai 12 menu contoh yang diberi penanda "Contoh".

Mock juga menyediakan skenario uji melalui query string pada mode pengembangan, misalnya ?mock=ai-down (respons 503 untuk endpoint AI), ?mock=slow (jeda 40 detik), dan ?mock=empty (semua daftar kosong). Skenario ini dipakai untuk menguji T4 tanpa mematikan layanan sungguhan.

## 9.6 Variabel Lingkungan dan Feature Flag

|                            |                                             |                                                       |
|----------------------------|---------------------------------------------|-------------------------------------------------------|
| **Variabel**               | **Contoh nilai**                            | **Fungsi**                                            |
| VITE\_API\_BASE\_URL       | https://&lt;backend&gt;.onrender.com/api/v1 | Alamat backend Express.                               |
| VITE\_USE\_MOCK            | false                                       | Menyalakan MSW.                                       |
| VITE\_APP\_ENV             | production                                  | Menentukan tampilan label debug (AST-10).             |
| VITE\_DASHBOARD\_URL       | https://&lt;dasbor&gt;.streamlit.app        | Alamat dasbor Streamlit.                              |
| VITE\_DASHBOARD\_SIMULASI  | true                                        | Menampilkan label data simulasi pada halaman dasbor.  |
| VITE\_FLAG\_DASHBOARD      | true                                        | Menampilkan menu dan halaman dasbor (T6).             |
| VITE\_FLAG\_RISK\_MODEL    | false                                       | Menampilkan kolom risiko stok (T13).                  |
| VITE\_FLAG\_ASSISTANT      | true                                        | Menampilkan Asisten Toko (W14).                       |
| VITE\_SHOW\_DEMO\_ACCOUNTS | true                                        | Menampilkan kotak akun demo di login (AUTH-07).       |
| VITE\_DEMO\_ACCOUNTS       | karyawan:...;pemilik:...                    | Isi kotak akun demo. Hanya diisi di dashboard Vercel. |
| VITE\_USER\_MANUAL\_URL    | https://.../buku-panduan.pdf                | Tautan Buku Panduan Pengguna.                         |

Semua variabel berawalan VITE\_ ikut ke bundle dan dapat dibaca siapa pun. Karena itu tidak ada API key, secret, atau alamat layanan AI di daftar ini. Repositori hanya memuat .env.example.

## 9.7 Deploy

-   Frontend di-deploy ke Vercel dari branch utama. Setiap pull request mendapat preview deployment untuk ditinjau.

-   vercel.json memuat rewrite semua path ke index.html agar rute SPA tidak 404 saat dimuat ulang.

-   Backend perlu mengizinkan origin domain Vercel produksi dan pola domain preview pada konfigurasi CORS.

-   Sebelum demo, frontend membangunkan backend dan dasbor dengan membuka aplikasi sekitar dua menit lebih awal.

# 10. Desain Antarmuka

## 10.1 Prinsip Desain

1.  **Cepat di kasir.** Aksi yang paling sering (tambah menu, simpan pesanan) berada di area jempol pada ponsel dan tidak memerlukan dialog konfirmasi.

2.  **Hati-hati pada aksi permanen.** Tutup shift, nonaktifkan menu, dan nonaktifkan bahan selalu melalui dialog konfirmasi yang menyebut akibatnya.

3.  **Angka mudah dibaca.** Nominal dan stok memakai angka tabular, rata kanan pada tabel, dan satuan selalu tertulis.

4.  **Status selalu terlihat.** Status shift, peringatan stok, dan status penyimpanan tidak pernah tersembunyi lebih dari satu ketukan.

5.  **Bahasa sehari-hari.** Label dan pesan memakai Bahasa Indonesia yang lugas, tanpa istilah teknis seperti "payload" atau "request".

## 10.2 Tata Letak Responsif

|                         |                                                                                                           |                                                            |
|-------------------------|-----------------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| **Lebar layar**         | **Tata letak**                                                                                            | **Catatan**                                                |
| &lt; 768 px (ponsel)    | Topbar ringkas, bottom navigation, konten satu kolom, keranjang sebagai bottom sheet, tabel menjadi kartu | Target utama karyawan. Target sentuh minimal 44 x 44 px.   |
| 768-1023 px (tablet)    | Topbar, bottom navigation, PoS dua kolom bila muat, tabel dengan kolom prioritas                          | Kolom sekunder disembunyikan dan tersedia di sheet detail. |
| &gt;= 1024 px (desktop) | Sidebar kiri tetap, konten lebar maksimal 1280 px, PoS dua kolom dengan keranjang menempel                | Target utama pemilik.                                      |

## 10.3 Token Desain

|                                     |                                        |                                                                      |
|-------------------------------------|----------------------------------------|----------------------------------------------------------------------|
| **Token**                           | **Nilai usulan**                       | **Pemakaian**                                                        |
| Font                                | Inter, fallback system-ui              | Seluruh antarmuka. Angka memakai font-variant-numeric: tabular-nums. |
| Primer                              | \#7C2D12 (cokelat teh), teks putih     | Tombol utama, tab aktif, tautan.                                     |
| Aman / Sesuai                       | \#15803D teks pada \#DCFCE7            | Badge status stok aman dan selisih nol.                              |
| Hampir habis / Waspada / Selisih    | \#A16207 teks pada \#FEF9C3            | Badge peringatan dan selisih dalam toleransi.                        |
| Habis / Kritis / Melewati toleransi | \#B91C1C teks pada \#FEE2E2            | Badge bahaya dan galat.                                              |
| Info                                | \#1D4ED8 teks pada \#DBEAFE            | Label simulasi, model cadangan, informasi.                           |
| Radius dan jarak                    | Radius 8 px, skala jarak Tailwind 4 px | Konsisten dengan bawaan shadcn/ui.                                   |

Warna status tidak menjadi satu-satunya penanda. Setiap badge memuat teks dan ikon agar tetap terbaca oleh pengguna dengan gangguan penglihatan warna.

## 10.4 Komponen

Komponen shadcn/ui yang dipakai: Button, Input, Textarea, Label, Form, Select, Tabs, ToggleGroup, Card, Badge, Table, Sheet, Dialog, AlertDialog, Tooltip, Popover, Calendar, Skeleton, Sonner, DropdownMenu, Avatar, Separator, ScrollArea, dan Progress.

|                                           |                                                                                                                          |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Komponen kustom**                       | **Fungsi**                                                                                                               |
| QuantityStepper                           | Tombol kurang, input angka, tombol tambah dengan batas 1-99 dan target sentuh besar.                                     |
| Rupiah                                    | Menampilkan nominal dengan Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }). |
| StatusBadge, SelisihBadge, RiskBadge      | Badge status stok, selisih, dan risiko dengan warna, ikon, dan teks.                                                     |
| ResponsiveList                            | Menampilkan data sebagai tabel di desktop dan kartu di ponsel dari satu definisi kolom.                                  |
| EmptyState, ErrorState, AiUnavailableCard | Keadaan kosong dan galat yang seragam dengan aksi lanjutan.                                                              |
| ColdStartBanner, OfflineBanner            | Banner global untuk server lambat dan koneksi terputus.                                                                  |
| HelpTooltip                               | Ikon bantuan dengan penjelasan istilah.                                                                                  |
| SimulasiBanner                            | Penanda data simulasi pada halaman data dan AI.                                                                          |

## 10.5 Pola Keadaan Halaman

|                |                                                                                                       |
|----------------|-------------------------------------------------------------------------------------------------------|
| **Keadaan**    | **Tampilan**                                                                                          |
| Memuat         | Skeleton dengan bentuk menyerupai konten akhir. Tidak memakai spinner layar penuh kecuali saat login. |
| Kosong         | Ikon, kalimat penjelasan, dan tombol aksi berikutnya.                                                 |
| Galat          | Pesan ramah, alasan singkat bila diketahui, dan tombol Coba lagi.                                     |
| Diproses       | Tombol nonaktif dengan indikator di dalam tombol dan toast diproses.                                  |
| Berhasil       | Toast hijau dan data terbarui di layar.                                                               |
| Sebagian gagal | Widget yang gagal menampilkan kartu galat, widget lain tetap tampil.                                  |

## 10.6 Format dan Pesan

-   Mata uang: Rp36.000 (tanpa desimal, pemisah titik). Angka stok: 1.250 gram, 2,5 kg, 40 pcs.

-   Tanggal: Kamis, 12 November 2026. Jam: 07.02. Seluruh waktu ditampilkan dalam zona Asia/Jakarta.

-   Pesan galat menyebut apa yang salah dan cara memperbaikinya. Contoh: "Jumlah gula harus lebih dari 0." bukan "Input tidak valid."

-   Tombol memakai kata kerja yang menjelaskan akibat: "Simpan Pesanan", "Buka Shift", "Tutup Shift", bukan "OK" atau "Submit".

## 10.7 Aksesibilitas

-   Kontras teks memenuhi WCAG 2.1 AA (rasio minimal 4,5:1 untuk teks normal).

-   Setiap input memiliki label yang terhubung. Pesan galat dihubungkan dengan aria-describedby.

-   Fokus keyboard terlihat jelas. Dialog dan sheet mengunci fokus dan dapat ditutup dengan Esc.

-   Toast diumumkan ke pembaca layar melalui region aria-live.

-   Atribut lang="id" pada dokumen HTML.

# 11. Kebutuhan Non-Fungsional

|                 |                                            |                                                                                    |                                   |
|-----------------|--------------------------------------------|------------------------------------------------------------------------------------|-----------------------------------|
| **Kategori**    | **Kebutuhan**                              | **Target**                                                                         | **Cara ukur**                     |
| Responsif       | Tidak ada scroll horizontal                | Lebar 360-1440 px                                                                  | DevTools dan ponsel Android nyata |
| Kinerja         | Ukuran JavaScript awal                     | Maksimal 300 KB gzip                                                               | Laporan build Vite                |
| Kinerja         | Skor Lighthouse mobile                     | Performance &gt;= 80, Accessibility &gt;= 90                                       | Lighthouse pada URL produksi      |
| Kinerja         | Respons UI setelah ketuk menu              | Kurang dari 100 ms                                                                 | Pengamatan dan React Profiler     |
| Ketahanan       | PoS dan stok tetap berfungsi saat AI gagal | 100% skenario uji lulus                                                            | Skenario mock ai-down             |
| Ketahanan       | Tidak ada pesanan ganda                    | 0 duplikat pada klik ganda dan jaringan lambat                                     | Uji T-05                          |
| Kompatibilitas  | Peramban yang didukung                     | Chrome desktop dan Chrome Android versi terbaru. Safari iOS sebatas upaya terbaik. | Uji manual                        |
| Lokalisasi      | Bahasa dan format                          | Bahasa Indonesia, locale id-ID, zona Asia/Jakarta                                  | Tinjauan UI                       |
| Kualitas kode   | Lint dan konsol                            | Tanpa galat ESLint dan tanpa galat konsol di produksi                              | CI dan DevTools                   |
| Keterpeliharaan | Kebutuhan terlacak                         | Setiap PR menyebut ID kebutuhan                                                    | Tinjauan PR                       |

# 12. Keamanan di Sisi Frontend

-   Tidak ada secret, API key Gemini, atau alamat layanan AI di kode dan variabel VITE\_. Seluruh panggilan AI melalui backend (T3).

-   Token disimpan di localStorage untuk kesederhanaan lintas domain Vercel dan Render. Risiko XSS ditekan dengan tidak merender HTML mentah di mana pun, termasuk jawaban chat. Alternatif yang lebih aman adalah cookie httpOnly dengan SameSite=None; Secure, yang perlu kesepakatan backend (lihat Q-10).

-   Logout dan respons 401 membersihkan token, seluruh store, dan cache query agar data peran sebelumnya tidak tertinggal di perangkat bersama.

-   Penjaga rute hanya untuk kenyamanan tampilan. Backend tetap menolak akses yang tidak berhak (W5).

-   Iframe dasbor memakai atribut sandbox="allow-scripts allow-same-origin allow-forms allow-popups" dan referrerpolicy="no-referrer".

-   Dasbor Streamlit membaca data omzet. Bila URL dasbor dapat dibuka publik tanpa login, data pemilik dapat dilihat siapa pun yang mengetahui alamatnya. Hal ini perlu diputuskan bersama tim DS dan backend (lihat Q-08).

-   Tidak ada data identitas pelanggan yang dikumpulkan atau ditampilkan.

-   npm audit dijalankan sebelum rilis dan dependensi dengan kerentanan tinggi diperbarui.

# 13. Rencana Pengujian Frontend

## 13.1 Uji Unit dan Komponen

|                   |                                                                                                                                                                      |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Sasaran**       | **Kasus yang diuji**                                                                                                                                                 |
| lib/calc.ts       | Total keranjang per kanal termasuk harga Shopee Food null, status stok di batas minimum, tercatat dan selisih, melewati toleransi, saran beli cadangan.              |
| lib/format.ts     | Format Rupiah, angka dengan presisi, tanggal dan jam zona Asia/Jakarta.                                                                                              |
| schemas/\*        | Jumlah kosong, 0, negatif, desimal, lebih dari 99; nama menu kosong dan terlalu panjang; takaran ganda; stok fisik negatif; chat kosong dan lebih dari 500 karakter. |
| CartPanel         | Tambah, ubah jumlah, hapus, ganti kanal, total berubah, tombol Simpan nonaktif saat kosong dan saat diproses.                                                        |
| CloseShiftWizard  | Navigasi langkah, isian bertahan, catatan wajib untuk bahan melewati toleransi.                                                                                      |
| Guards            | Pengalihan tanpa sesi, peran salah ke 403, tanpa shift aktif ke /shift.                                                                                              |
| Interceptor Axios | Pembukaan envelope, pemetaan galat, penanganan 401, sinyal cold start.                                                                                               |

## 13.2 Skenario Uji Fungsional

|        |                                                                                        |                                                                                                       |
|--------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **ID** | **Skenario**                                                                           | **Hasil yang diharapkan**                                                                             |
| T-01   | Login sebagai karyawan dan pemilik                                                     | Diarahkan sesuai peran dan status shift.                                                              |
| T-02   | Buka /pemilik/rekap sebagai karyawan dan tanpa login                                   | Karyawan melihat 403. Tanpa login diarahkan ke /login.                                                |
| T-03   | Pilih dua menu, jumlah 2, kanal Shopee Food, simpan                                    | Total sesuai harga kanal dikali jumlah, toast berhasil, pesanan muncul di riwayat, stok berkurang.    |
| T-04   | Isi jumlah kosong, 0, -1, dan 1,5                                                      | Semua ditolak dengan pesan perbaikan.                                                                 |
| T-05   | Tekan Simpan Pesanan dua kali cepat dengan jaringan lambat                             | Hanya satu pesanan tersimpan.                                                                         |
| T-06   | Catat barang masuk valid, lalu kosong dan negatif                                      | Stok bertambah untuk input valid. Input salah ditolak.                                                |
| T-07   | Turunkan stok sampai batas minimum                                                     | Badge Hampir habis muncul di stok, PoS, dan lonceng.                                                  |
| T-08   | Tutup shift dengan satu bahan melewati toleransi                                       | Selisih benar dan tombol Tutup Shift aktif setelah catatan diisi.                                     |
| T-09   | Jalankan alur tiga shift dalam satu tanggal                                            | Rekap harian berstatus Lengkap dan angkanya sama dengan jumlah tiga rekap shift.                      |
| T-10   | Mock ai-down                                                                           | PoS, stok, dan shift berjalan. Perkiraan, chat, dan risiko menampilkan pesan ramah.                   |
| T-11   | Mock slow                                                                              | Banner cold start tampil lalu hilang saat respons diterima.                                           |
| T-12   | Matikan jaringan                                                                       | Banner luring tampil dan tombol simpan nonaktif.                                                      |
| T-13   | Buka setiap halaman pada lebar 360, 390, 768, 1280 px                                  | Tanpa scroll horizontal dan tanpa elemen terpotong.                                                   |
| T-14   | Chat: input kosong, pertanyaan SOP, pertanyaan di luar konteks, jawaban model cadangan | Kosong ditolak, SOP disertai chip sumber, di luar konteks ditolak sopan, label model cadangan tampil. |
| T-15   | Buka dasbor dengan URL aktif dan URL mati                                              | Dasbor tampil tertanam. URL mati menampilkan tombol Muat ulang dan Buka di tab baru.                  |
| T-16   | Ubah takaran menu di master lalu catat pesanan menu tersebut                           | Stok terpotong sesuai takaran baru.                                                                   |

Skenario T-03, T-06, T-10, T-14, dan T-15 sejalan dengan Rencana Pengujian pada Project Plan. Hasil uji dicatat pada spreadsheet bersama dengan kolom ID kebutuhan, perangkat, hasil, dan tingkat bug (kritis, mayor, minor).

## 13.3 Uji End-to-End

Playwright menjalankan tiga alur utama terhadap mode mock pada setiap pull request: (1) login karyawan, buka shift, catat pesanan, tutup shift; (2) login pemilik, buka rekap harian, ubah master menu; (3) skenario AI gagal. Ketiga alur juga dijalankan manual terhadap URL produksi sebelum demo.

# 14. Rencana Implementasi Sekali Jalan

Urutan berikut disusun berdasarkan ketergantungan antar modul, bukan berdasarkan tanggal. Seluruh tahap dikerjakan berurutan dalam satu kali pengerjaan memakai mock. Setiap tahap menghasilkan kode yang dapat dijalankan sehingga sambungan ke API sungguhan dapat dilakukan per modul kapan pun backend siap.

|                              |                                                                                                                                                                   |                                                                  |                       |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|-----------------------|
| **Tahap**                    | **Pekerjaan**                                                                                                                                                     | **Kebutuhan**                                                    | **Bergantung pada**   |
| 1\. Fondasi                  | Inisialisasi Vite, Tailwind, shadcn/ui, ESLint, Prettier, Vitest. Router, providers, instance Axios, TanStack Query, env.ts, flags.ts, vercel.json, .env.example. | NAV-04, T1                                                       | Tidak ada             |
| 2\. Kontrak dan mock         | Tipe domain, skema Zod, query keys, modul api/\*, basis data mock, handler seluruh endpoint, fixture, skenario ai-down, slow, empty.                              | Bagian 7, 8, 9.5                                                 | Tahap 1               |
| 3\. Kerangka dan autentikasi | AppShell, Sidebar, BottomNav, Topbar, guards, halaman login, 403, 404, store sesi, interceptor 401.                                                               | AUTH-01 sampai AUTH-07, NAV-01 sampai NAV-06                     | Tahap 2               |
| 4\. Komponen bersama         | StatusBadge, SelisihBadge, Rupiah, QuantityStepper, ResponsiveList, EmptyState, ErrorState, banner, HelpTooltip, ConfirmDialog.                                   | Bagian 10.4, ERR-01 sampai ERR-03                                | Tahap 1               |
| 5\. Data master              | Master bahan dan master menu dengan field array takaran.                                                                                                          | MST-01 sampai MST-07                                             | Tahap 3, 4            |
| 6\. Shift dan PoS            | Halaman shift, buka shift, PoS, keranjang, riwayat pesanan.                                                                                                       | SHF-01 sampai SHF-05, POS-01 sampai POS-11, ORD-01 sampai ORD-05 | Tahap 5               |
| 7\. Stok                     | Daftar stok, detail mutasi, lonceng peringatan, barang masuk, kolom risiko di balik flag.                                                                         | STK-01 sampai STK-08                                             | Tahap 6               |
| 8\. Tutup shift dan rekap    | Wizard tutup shift, rekap shift, rekap harian, beranda pemilik, stylesheet print.                                                                                 | TUT-01 sampai TUT-10, RKP-01 sampai RKP-04, BRD-01               | Tahap 7               |
| 9\. Fitur AI dan data        | Perkiraan Belanja dengan grafik dan metrik, dasbor tertanam, Asisten Toko.                                                                                        | FC-01 sampai FC-07, DSB-01 sampai DSB-05, AST-01 sampai AST-10   | Tahap 3, 4            |
| 10\. Panduan                 | Tur onboarding, tooltip istilah, halaman Bantuan, penyempurnaan pesan.                                                                                            | ONB-01 sampai ONB-05                                             | Tahap 6 sampai 9      |
| 11\. Uji dan rapikan         | Uji unit, komponen, e2e mock, uji responsif, Lighthouse, audit aksesibilitas.                                                                                     | Bagian 11, 13                                                    | Tahap 1 sampai 10     |
| 12\. Sambung ke API          | Matikan mock per modul, sesuaikan dengan OpenAPI final, uji alur tiga shift di URL produksi.                                                                      | Bagian 8, T-09                                                   | Endpoint backend siap |

## 14.1 Definisi Selesai

-   Seluruh kriteria penerimaan pada ID kebutuhan modul terpenuhi dan tercatat di lembar uji.

-   Halaman memiliki keadaan memuat, kosong, galat, dan berhasil.

-   Lulus uji lebar 360 px tanpa scroll horizontal.

-   Tidak ada galat ESLint dan galat konsol.

-   Uji unit untuk logika baru lulus di CI.

-   Pull request menyebut ID kebutuhan, ditinjau minimal satu anggota, dan digabung melalui branch feat/fe-&lt;modul&gt;.

-   README Web bagian frontend diperbarui: cara menjalankan, variabel lingkungan, mode mock, struktur folder, dan tautan URL produksi.

# 15. Keterlacakan ke Project Plan

|                                      |                                                                          |                                                        |
|--------------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------|
| **ID Project Plan**                  | **Kebutuhan frontend**                                                   | **Halaman**                                            |
| W1 Pencatatan Transaksi (PoS)        | POS-01 sampai POS-11, ORD-01 sampai ORD-05                               | /pos, /pesanan                                         |
| W2 Data Master Menu, Bahan, Takaran  | MST-01 sampai MST-07                                                     | /pemilik/master/\*                                     |
| W3 Pengelolaan Stok                  | STK-01 sampai STK-06, STK-08, POS-07, POS-08                             | /stok, /stok/barang-masuk                              |
| W4 Serah Terima Shift dan Rekap      | SHF-01 sampai SHF-05, TUT-01 sampai TUT-09, RKP-01 sampai RKP-04, BRD-01 | /shift, /shift/tutup, /shift/:id/rekap, /pemilik/rekap |
| W5 Login Dua Peran                   | AUTH-01 sampai AUTH-07, NAV-02                                           | /login, seluruh penjaga rute                           |
| W6 Panduan dan Umpan Balik           | ONB-01 sampai ONB-05, NAV-05                                             | Seluruh halaman, /bantuan                              |
| W7 Deploy Web Publik                 | NAV-06, Bagian 9.7, Bagian 11                                            | Vercel                                                 |
| W12, W13 Forecasting dan Serving     | FC-01 sampai FC-04                                                       | /pemilik/perkiraan-belanja                             |
| W14 Asisten Toko                     | AST-01 sampai AST-05, AST-08                                             | /asisten                                               |
| W15 Pengujian dan Demo               | TUT-10, Bagian 13                                                        | Lembar uji                                             |
| W16 Dokumentasi                      | ONB-03, Definisi Selesai (README Web)                                    | README, Buku Panduan                                   |
| T1 Arsitektur Terpisah               | NAV-01, NAV-04, Bagian 9                                                 | Seluruh aplikasi                                       |
| T3 Integrasi AI via Backend          | FC-07, Bagian 8.2                                                        | Seluruh fitur AI                                       |
| T4 Validasi dan Graceful Handling    | ERR-01 sampai ERR-06, FC-06, AST-09, DSB-02                              | Seluruh aplikasi                                       |
| T5 Workflow Git dan Kontrak API      | Bagian 8, Definisi Selesai                                               | Repositori                                             |
| T6 Dasbor Streamlit Embedded         | DSB-01 sampai DSB-05                                                     | /pemilik/dasbor                                        |
| T8 Feature Engineering               | FC-04                                                                    | /pemilik/perkiraan-belanja                             |
| T9, T10, T11 Intent, RAG, Guardrails | AST-05, AST-06, AST-10                                                   | /asisten                                               |
| T13 Risk Out-of-Stock                | STK-07                                                                   | /stok                                                  |
| T14 Backup Local SLM                 | AST-07                                                                   | /asisten                                               |

W8 sampai W11, T2, T7, dan T12 tidak memerlukan pekerjaan frontend langsung. Frontend hanya memakai hasilnya: dataset bersih untuk fixture mock (W11), label data simulasi (W9), dan riwayat chat yang tersimpan (T2).

# 16. Asumsi, Pertanyaan Terbuka, dan Catatan Dokumen

## 16.1 Pertanyaan Terbuka

Setiap pertanyaan memiliki asumsi sementara yang sudah dipakai di PRD ini. Bila jawaban tim berbeda, cukup ubah bagian yang dirujuk.

|        |                                                                                               |                  |                                                                                                                                      |
|--------|-----------------------------------------------------------------------------------------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| **ID** | **Pertanyaan**                                                                                | **Ditujukan ke** | **Asumsi sementara**                                                                                                                 |
| Q-01   | Apakah harga Shopee Food berbeda dengan harga toko?                                           | PIC UMKM, DS     | Bisa berbeda. Bila kosong memakai harga toko (field harga.shopee\_food).                                                             |
| Q-02   | Jam setiap shift dan siapa yang menentukan usulan shift berikutnya?                           | PIC, backend     | Server mengusulkan berdasarkan urutan shift hari itu. Frontend tidak menyimpan jam shift.                                            |
| Q-03   | Apakah pesanan yang salah input dapat dibatalkan?                                             | PIC, backend     | Tidak tersedia di MVP. Koreksi dicatat sebagai catatan shift. Perlu diputuskan karena kesalahan input di kasir hampir pasti terjadi. |
| Q-04   | Bila stok tercatat tidak cukup, apakah pesanan ditolak atau tetap disimpan dengan peringatan? | PIC, backend     | Ditolak (409 STOCK\_INSUFFICIENT) agar persamaan stok tetap konsisten.                                                               |
| Q-05   | Berapa toleransi selisih per bahan?                                                           | PIC, DS          | Diatur pemilik di master bahan. Bawaan 0.                                                                                            |
| Q-06   | Apakah stok tercatat boleh terlihat saat karyawan menghitung stok fisik?                      | PIC              | Disembunyikan (hitung buta) untuk mengurangi bias.                                                                                   |
| Q-07   | Apa lima kategori intent chatbot?                                                             | AE               | Belum diketahui. Frontend hanya menampilkan label intent di mode non-produksi.                                                       |
| Q-08   | Bagaimana dasbor Streamlit dilindungi agar data omzet tidak terbuka publik?                   | DS, backend      | Dasbor memakai data simulasi selama demo. Perlindungan final perlu diputuskan sebelum memakai data asli.                             |
| Q-09   | Apakah pemilik dapat menutup paksa shift yang lupa ditutup karyawan?                          | PIC, backend     | Tidak di MVP. Pemilik melihat informasi shift yang belum ditutup.                                                                    |
| Q-10   | Penyimpanan token: localStorage atau cookie httpOnly?                                         | Backend          | localStorage dengan Bearer token. Masa berlaku token minimal satu shift.                                                             |
| Q-11   | Apakah backend menerima clientRequestId untuk mencegah pesanan ganda?                         | Backend          | Ya, dengan respons 409 DUPLICATE\_REQUEST yang membawa data pesanan semula.                                                          |
| Q-12   | Apakah Asisten Toko perlu menjawab sisa stok dan omzet, atau hanya SOP?                       | AE, backend      | Keduanya, sesuai Rencana Pengujian. Data stok dan omzet disiapkan backend untuk layanan AI.                                          |

## 16.2 Catatan Ketidaksesuaian pada Project Plan

Selama penyusunan PRD, ditemukan beberapa bagian Project Plan yang saling bertentangan atau belum lengkap. Catatan ini disampaikan agar dapat diperbaiki sebelum dokumen dikumpulkan.

1.  **Kanal Telegram.** Alur kerja aplikasi butir 3 menyebut Asisten Toko "via Web/Telegram", sedangkan bagian Yang Tidak Dikerjakan butir 6 mengecualikan Telegram API. PRD ini hanya mencakup kanal web. Saran: hapus kata Telegram pada alur kerja.

2.  **Penanggung jawab W5.** Tabel fitur mencantumkan backend saja untuk W5, padahal halaman login, penjaga rute, dan navigasi per peran dikerjakan frontend. Saran: tambahkan Muhammad Sultan Baqa (Frontend) pada W5.

3.  **Penanggung jawab risiko adaptasi karyawan.** Risiko ketiga menetapkan AI Engineer sebagai penanggung jawab, padahal mitigasinya berupa desain UI yang ramah dan panduan visual yang menjadi tugas frontend. Saran: tambahkan penanggung jawab frontend.

4.  **Cakupan chatbot.** W14 dan T10 menyebut pertanyaan operasional dan SOP, sedangkan Rencana Pengujian menguji pertanyaan sisa stok dan omzet. Kedua hal ini memerlukan akses data yang berbeda. Saran: tegaskan cakupan pada W14 (lihat Q-12).

5.  **Rencana pengujian chatbot.** Penanggung jawab uji chatbot hanya tim AI, padahal tampilan sumber, penolakan, dan input kosong juga diuji di antarmuka. Saran: tambahkan frontend pada baris tersebut.

6.  **Akses dasbor.** Alur kerja menyatakan dasbor membaca database secara read-only dan tertanam di web, tetapi belum dijelaskan bagaimana dasbor dibatasi hanya untuk pemilik (lihat Q-08).
