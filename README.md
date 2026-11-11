# CV Asli Jaya Tama — Company Profile

Website PHP 8.2+ tanpa database, framework, Composer, atau proses Node di server. Seluruh teks antarmuka berbahasa Indonesia. Konfigurasi proyek dan video **kosong secara sengaja** sampai dokumentasi pekerjaan asli ditambahkan. Monogram `AJ` adalah pengganti sementara, bukan logo resmi.

Tombol **Mode gelap** di navigasi mengganti tema terang/gelap. Pilihan disimpan di browser pengunjung; bila belum dipilih, situs mengikuti tema perangkat. Transisi warna menghormati `prefers-reduced-motion`.

## Menjalankan lokal

1. Pasang PHP 8.2+ dan pastikan perintah `php` tersedia.
2. Dari folder proyek jalankan `php -S localhost:8000 -t public public/index.php`.
3. Buka `http://localhost:8000`. URL routing ditangani oleh `public/index.php`.

Untuk pengujian Apache lokal, arahkan DocumentRoot ke folder `public` dan aktifkan `mod_rewrite` serta `AllowOverride All`.

## Deploy cPanel — pilihan utama

1. Pilih PHP 8.2 atau lebih baru di **MultiPHP Manager**. Aktifkan `mod_rewrite` (umumnya sudah tersedia).
2. Unggah isi folder `public/` ke `public_html/`. Pastikan file `.htaccess` ikut terunggah (tampilkan hidden files di File Manager).
3. Unggah `app/`, `config/`, dan `bootstrap.php` ke direktori **di luar** `public_html`, misalnya `/home/USER/asli-jaya-app/`. Letakkan `app/` dan `config/` sebagai subfolder di sana.
4. Edit baris `require dirname(__DIR__) . '/bootstrap.php';` pada `public_html/index.php` menjadi path absolut ke bootstrap, misalnya `require '/home/USER/asli-jaya-app/bootstrap.php';`.
5. Di `config/site.php`, isi `production_url` dengan domain HTTPS final, misalnya `https://example.com` tanpa garis miring akhir. Ini mengaktifkan canonical, Open Graph URL, JSON-LD, dan `/sitemap.xml`.
6. Aktifkan SSL di **SSL/TLS Status / AutoSSL** cPanel dan pastikan domain menggunakan HTTPS. Atur redirect HTTP ke HTTPS melalui fitur Domains cPanel atau aturan hosting.
7. Buka Beranda, setiap halaman, `/sitemap.xml`, dan satu URL acak untuk memastikan 404. Bila CSS tidak muncul, periksa lokasi `assets/` dan `.htaccess`.

## Deploy ke Vercel

Vercel memakai hasil statis di `dist/`; PHP **tidak dijalankan** di Vercel. Aplikasi PHP tetap menjadi sumber konten dan masih dapat dipakai untuk cPanel. `vercel.json` menetapkan `outputDirectory: dist`, `cleanUrls: true`, dan header keamanan. [Dokumentasi konfigurasi Vercel](https://vercel.com/docs/project-configuration/vercel-json) menjelaskan opsi tersebut.

1. Dari folder proyek, bangun ulang halaman statis. Jika PHP sudah ada di PATH, jalankan `php scripts/build-static.php`. Pada mesin pengembangan ini, PHP portabel yang dipakai untuk pengujian dapat dipanggil melalui PowerShell:

   ```powershell
   & "$env:TEMP\ajt-php82\php.exe" scripts/build-static.php
   ```

2. Pastikan `dist/index.html`, halaman `.html` lainnya, dan `dist/assets/` terbentuk. Jangan mengunggah `public/` sebagai Output Directory untuk deployment Vercel.
   Jika Node.js tersedia secara lokal, jalankan `node scripts/verify-static.js` untuk memeriksa tautan internal dan aset hasil build.
3. **Lewat Vercel CLI:** dari root proyek jalankan `npx vercel` untuk preview, lalu `npx vercel --prod` setelah siap. Ikuti proses login dan pilih proyek Vercel. CLI membaca `vercel.json` di root.
4. **Lewat GitHub + Dashboard Vercel:** unggah proyek ke repository GitHub termasuk folder `dist/`. Impor repo ke Vercel, pilih Framework Preset **Other**, Root Directory root proyek, Build Command kosong, dan Output Directory `dist` (sudah ditetapkan dalam `vercel.json`).
5. Setelah domain final tersedia, isi `production_url` di `config/site.php` dengan URL HTTPS final tanpa slash penutup. Jalankan build ulang dan deploy ulang. Ini menghasilkan canonical URL, Open Graph URL, dan `dist/sitemap.xml` yang sesuai domain.

Setelah mengubah `config/projects.php`, `config/videos.php`, `config/services.php`, atau kontak, **jalankan build statis ulang** dan deploy ulang `dist/`. Perubahan file PHP saja tidak mengubah halaman yang sudah dihosting di Vercel. File proyek PHP dan konfigurasi tidak disajikan kepada pengunjung karena Vercel hanya menayangkan isi `dist/`.

## Deploy cPanel — bila semua file harus berada di `public_html`

Unggah **seluruh isi proyek** ke `public_html/`. Simpan `.htaccess` di root, serta `.htaccess` dalam `app/` dan `config/`. Root `.htaccess` mengarahkan URL publik ke `public/`, sementara direktori aplikasi dan konfigurasi ditolak secara langsung. Metode ini memerlukan Apache yang mengizinkan `.htaccess` dan `mod_rewrite`; uji bahwa URL `/app/Controllers/HomeController.php`, `/config/site.php`, dan `/bootstrap.php` menghasilkan 403/404 sebelum situs digunakan. Pilihan utama di atas lebih aman karena kode aplikasi secara fisik berada di luar web root.

## Mengelola konten

### Identitas dan kontak

Edit `config/site.php`. Isi `logo` dengan path seperti `/assets/images/branding/logo.webp` setelah mengunggah logo asli ke `public/assets/images/branding/`. Isi `hero_image` dan `about_image` dengan foto proyek asli. `email` dan `address` opsional; biarkan `null` bila belum tersedia. Nomor WhatsApp untuk URL menggunakan format internasional tanpa `+`.

### Menambah proyek

Unggah foto ke `public/assets/images/projects/`, sebaiknya WebP dengan ukuran yang sesuai kebutuhan tampilan. Tambahkan **satu entri** ke `config/projects.php`:

```php
return [
    [
        'slug' => 'nama-proyek-asli',
        'title' => 'Nama Proyek Asli',
        'category' => 'Custom Furniture',
        'description' => 'Keterangan faktual mengenai pekerjaan.',
        'location' => null,
        'year' => null,
        'cover' => '/assets/images/projects/nama-proyek.webp',
        'gallery' => ['/assets/images/projects/detail-1.webp'],
        'video_id' => null,
        'featured' => true,
    ],
];
```

Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung. Gunakan kategori yang konsisten. Halaman detail, filter, dan sitemap diperbarui otomatis. Lokasi dan tahun cukup diisi bila terverifikasi. `featured: true` menampilkan proyek di Beranda (maksimal enam).

### Menambah video Google Drive

Unggah thumbnail asli ke `public/assets/images/thumbnails/`. Tambahkan entri ke `config/videos.php`:

```php
return [
    [
        'slug' => 'review-proyek-asli',
        'title' => 'Review Proyek Asli',
        'category' => 'Custom Furniture',
        'description' => 'Dokumentasi hasil pengerjaan.',
        'thumbnail' => '/assets/images/thumbnails/review.webp',
        'drive_file_id' => 'ID_FILE_GOOGLE_DRIVE_YANG_VALID',
        'duration' => null,
        'featured' => true,
    ],
];
```

Ambil ID dari URL Google Drive `https://drive.google.com/file/d/ID_FILE/view`. Atur izin berbagi file agar pengunjung dapat membukanya, lalu uji pada jendela privat. Iframe baru dibuat saat thumbnail diklik; saat modal ditutup, iframe dihapus. Tautan langsung ke Google Drive tersedia di modal bila embed tidak bekerja. Google Drive tidak menjamin streaming publik tanpa batas.

### Layanan dan alur kerja

Edit `config/services.php` untuk deskripsi, contoh pekerjaan, dan path foto layanan. Teks alur kerja awal berada di `app/Views/pages/home.php`; sesuaikan dengan proses operasional yang sebenarnya sebelum publikasi.

## Pemecahan masalah

- **404 untuk halaman selain Beranda:** periksa `mod_rewrite`, `.htaccess`, dan `AllowOverride All`.
- **500:** periksa versi PHP, path `bootstrap.php`, dan error log cPanel. Error PHP tidak perlu ditampilkan kepada pengunjung.
- **Gambar tidak tampil:** path harus diawali `/assets/` dan file harus berada di web root `assets/`.
- **Video tidak diputar:** periksa ID file, izin berbagi Google Drive, dan buka tautan fallback.
- **Izin file:** umumnya folder `755` dan file `644`; hindari `777`.
- **Sitemap 404:** isi `production_url` dengan URL HTTPS final.

Formulir kontak memvalidasi data di browser dan membuka WhatsApp. Tidak ada data pengunjung yang disimpan atau dikirim ke server aplikasi.
