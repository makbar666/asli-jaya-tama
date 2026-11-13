# CV Asli Jaya Tama — Company Profile

Website utama memakai PHP 8.2+ tanpa framework, Composer, atau proses Node di server. CMS opsional memakai database Neon dan Vercel Functions; situs publik tetap menampilkan konten bawaan ketika Neon belum dikonfigurasi. Seluruh teks antarmuka berbahasa Indonesia. Galeri foto memakai lima foto yang tersedia di `public/assets/images/hero/`; daftar proyek detail tetap kosong sampai informasi proyek terverifikasi. Logo resmi berada di `public/assets/images/logo.png`.

Posisi utama situs adalah **pengerjaan furniture dan elemen ruang custom**. Teks Beranda, Tentang Kami, Layanan, Kontak, CTA, dan SEO menekankan diskusi kebutuhan, desain, ukuran, bahan, serta finishing. Nama brand pada logo tetap **Asli Jaya Interior**. Formulir kontak memiliki kolom opsional untuk pilihan bahan atau finishing; isinya hanya diteruskan ke WhatsApp dan tidak disimpan.

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

Setelah mengubah `config/projects.php`, `config/photos.php`, `config/videos.php`, `config/services.php`, atau kontak secara manual, **jalankan build statis ulang** dan deploy ulang `dist/`. Perubahan file PHP saja tidak mengubah halaman yang sudah dihosting di Vercel. File proyek PHP dan konfigurasi tidak disajikan kepada pengunjung karena Vercel hanya menayangkan isi `dist/`.

### CMS dengan database Neon

CMS tersedia di `/login.html` setelah database dan variabel lingkungan dikonfigurasi. Editor berada di `/admin.html` dan mengelola **proyek, foto, serta video**. Konten awal dari file PHP tetap tampil; perubahan CMS di Neon mengganti entri yang memiliki jenis dan slug sama. Video baru dari sinkronisasi Drive tetap muncul sebagai konten awal. Konten yang disembunyikan melalui CMS tidak tampil di situs.

1. Buat proyek PostgreSQL gratis di [Neon](https://neon.com/). Salin *connection string* yang memakai SSL.
2. Buka **SQL Editor** Neon dan jalankan seluruh isi `database/schema.sql` satu kali.
3. Jalankan `npm ci` di komputer pengembangan. Lalu jalankan `node scripts/hash-password.mjs` dan ketik kata sandi admin minimal 12 karakter. Skrip mencetak hash; kata sandi asli tidak perlu disimpan di repo.
4. Buat rahasia sesi dengan `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
5. Di **Vercel → Project Settings → Environment Variables**, tambahkan `DATABASE_URL`, `CMS_ADMIN_EMAIL`, `CMS_PASSWORD_HASH`, dan `CMS_SESSION_SECRET`. Simpan keempatnya sebagai **Secret** untuk Production. Lihat `.env.example` untuk nama variabel. Jangan menaruh nilainya di Git atau JavaScript browser.
6. Deploy ulang proyek Vercel, lalu buka `/login.html`. Jika login menampilkan pesan belum dikonfigurasi, periksa variabel dan jalankan ulang deployment. Jika muncul kesalahan server, pastikan tabel SQL sudah dibuat.

Admin dapat mengisi URL foto `/assets/...` yang sudah ada, atau URL gambar HTTPS dari penyimpanan eksternal. **Database hanya menyimpan metadata dan tautan; CMS ini belum mengunggah file gambar.** Untuk menambah foto ke folder `public/assets/`, unggah lewat Git dan deploy ulang; untuk video, tempel tautan file Google Drive pada formulir CMS. ID file diambil dan divalidasi oleh API. Tautan folder tidak didukung. Desain, bahan, dan konten bisnis lain masih di file konfigurasi. Halaman detail proyek yang dibuat lewat CMS memakai `/proyek?slug=...`; isinya langsung diperbarui dari Neon, tetapi metadata SEO per proyek memerlukan pengembangan server rendering atau build ulang.

Situs PHP di cPanel tetap dapat berjalan memakai konten konfigurasi. API CMS menggunakan Vercel Functions (Node.js tanpa proses yang terus berjalan), sehingga halaman CMS memerlukan Vercel dan tidak tersedia pada deploy cPanel standar. Untuk pengujian lokal lengkap, bangun `dist/` dengan PHP, lalu jalankan `npx vercel dev` dengan variabel lingkungan Neon yang sudah diatur pada proyek Vercel terhubung. Server PHP lokal sendiri hanya menyajikan halaman publik dan tidak menjalankan API Vercel.

### Sinkronisasi video Drive otomatis

Workflow `.github/workflows/sync-drive-videos.yml` memeriksa folder Drive setiap 30 menit (menit 17 dan 47 UTC) dan bisa dijalankan manual dari tab **Actions → Sync Google Drive videos → Run workflow**. Pemeriksaan terjadwal dapat terlambat; unggahan baru tidak muncul seketika. Workflow ini:

1. Membaca file video dari folder Drive publik `1lIegtho751s1vbYxGzqPKypC8QcPZVa_`.
2. Menambahkan hanya ID yang belum ada. Judul/kategori video yang sudah dikurasi di `config/videos.php` tidak ditimpa. Video baru diberi kategori netral **Dokumentasi Proyek** dan thumbnail asli dari Drive.
3. Menyimpan metadata baru di `config/drive_videos.json`, membangun ulang `dist/`, memeriksa aset, lalu commit dan push ke `main` jika ada perubahan.
4. Jika repo ini sudah terhubung sebagai Git project Vercel dengan `main` sebagai production branch, push tersebut memicu deploy baru.

Folder dan setiap video baru perlu dapat dibuka oleh pengunjung melalui tautan publik. Sinkronisasi **menambah** video baru; menghapus file di Drive tidak otomatis menghapus entri dari website. Ini mencegah video hilang karena kesalahan sementara saat membaca folder.

Tidak ada secret wajib untuk folder publik saat ini. Parser halaman publik dipakai bila `GOOGLE_DRIVE_API_KEY` tidak tersedia. Untuk jalur API resmi yang lebih stabil, buat Google Cloud API key dengan Drive API aktif lalu simpan sebagai repository secret `GOOGLE_DRIVE_API_KEY` di **Settings → Secrets and variables → Actions**. Kode tetap bisa memakai halaman publik jika API gagal. Jangan menaruh API key dalam repository.

Pastikan GitHub Actions aktif dan workflow memiliki izin `contents: write` agar bot dapat commit. Izin ini dinyatakan dalam workflow, tetapi kebijakan repository dapat membatasinya. Untuk uji lokal tanpa mengubah data:

```powershell
python scripts/sync_drive_videos.py --dry-run --php-bin "$env:TEMP\ajt-php82\php.exe"
```

Jika menjalankan sinkronisasi lokal secara nyata, jalankan tanpa `--dry-run`, lalu build statis dan push. Nama file generik dari Drive akan menjadi judul **Dokumentasi Video NN** sampai Anda mengeditnya secara manual.

## Deploy cPanel — bila semua file harus berada di `public_html`

Unggah **seluruh isi proyek** ke `public_html/`. Simpan `.htaccess` di root, serta `.htaccess` dalam `app/` dan `config/`. Root `.htaccess` mengarahkan URL publik ke `public/`, sementara direktori aplikasi dan konfigurasi ditolak secara langsung. Metode ini memerlukan Apache yang mengizinkan `.htaccess` dan `mod_rewrite`; uji bahwa URL `/app/Controllers/HomeController.php`, `/config/site.php`, dan `/bootstrap.php` menghasilkan 403/404 sebelum situs digunakan. Pilihan utama di atas lebih aman karena kode aplikasi secara fisik berada di luar web root.

## Mengelola konten

### Identitas dan kontak

Edit `config/site.php`. Isi `logo` dengan path seperti `/assets/images/branding/logo.webp` setelah mengunggah logo asli ke `public/assets/images/branding/`. Isi `hero_image` dan `about_image` dengan foto proyek asli. `email` dan `address` opsional; biarkan `null` bila belum tersedia. Nomor WhatsApp untuk URL menggunakan format internasional tanpa `+`.

Tautan Instagram dan TikTok pada bagian dokumentasi di halaman Portofolio dan Video Review diatur melalui `instagram_url` dan `tiktok_url` dalam file yang sama. Ubah keduanya jika akun resmi berpindah.

Foto bertumpuk pada Beranda diatur melalui `hero_gallery` dalam file yang sama. Lima foto saat ini berada di `public/assets/images/hero/`; urutan ketiga adalah foto utama di depan. Untuk mengganti foto, ubah path dan teks `alt`, lalu jalankan build statis ulang sebelum deploy Vercel.
Kartu foto berganti posisi setiap 5 detik, berhenti sementara saat di-hover atau mendapat fokus, dan bisa dipilih dengan klik. Pengunjung yang mengaktifkan `prefers-reduced-motion` tetap dapat memilih foto tanpa pergantian otomatis.

### Mengelola galeri foto

Bagian **Hasil Pekerjaan Kami** dan halaman Portofolio membaca `config/photos.php`. Untuk menambah foto, unggah berkas ke `public/assets/images/`, lalu tambah satu entri berisi `title`, `category`, `src`, `alt`, `width`, dan `height`. Judul dan kategori harus sesuai isi foto; jangan menambahkan lokasi atau tahun yang belum terverifikasi. Foto dapat diperbesar dan kategori di halaman Portofolio dibuat otomatis. Jalankan build statis ulang sebelum deploy ke Vercel.

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
